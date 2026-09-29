const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

function buildFallbackReply(prompt) {
  const text = String(prompt || '').toLowerCase();

  if (text.includes('summarize') || text.includes('summary')) {
    return 'Here is the summary: focus on the core objective, isolate the key constraints, highlight decisions that matter, and finish with a clear next-step plan for the next 48 hours.';
  }

  if (text.includes('plan') || text.includes('roadmap') || text.includes('launch') || text.includes('milestone')) {
    return 'Recommended roadmap: 1) define scope and assumptions, 2) assign owners and tasks, 3) validate critical risks, 4) ship the MVP, 5) review feedback and iterate weekly.';
  }

  if (text.includes('code') || text.includes('build') || text.includes('implement')) {
    return 'Implementation approach: start with the smallest working version, define the architecture clearly, build the critical workflow first, test the main path, and then add polish and automation.';
  }

  if (text.includes('research') || text.includes('analyze')) {
    return 'Research direction: map the audience, compare patterns in the market, identify the biggest constraints, and prioritize the strongest opportunities before executing.';
  }

  if (text.includes('fix') || text.includes('bug')) {
    return 'Fix strategy: reproduce the breakage, isolate the root cause, patch the narrowest failing layer, verify the outcome, and then check nearby flows for regression.';
  }

  if (text.includes('task') || text.includes('schedule') || text.includes('calendar')) {
    return 'Execution plan: define the top 3 priorities, block time for delivery, assign owners, and set a checkpoint review before the next milestone.';
  }

  return 'I can help with research, planning, code direction, summaries, and workflow automation. Tell me the exact outcome you want and I will turn it into an action plan.';
}

const providerConfig = {
  openai: {
    name: 'OpenAI',
    keyName: 'OPENAI_API_KEY',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
  claude: {
    name: 'Claude',
    keyName: 'ANTHROPIC_API_KEY',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  },
  gemini: {
    name: 'Gemini',
    keyName: 'GEMINI_API_KEY',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
};

const agentInstructions =
  'You are Torien, a helpful AI operations assistant. Give clear, useful answers for planning, research, execution, and coding tasks.';

app.get('/api/providers', (req, res) => {
  const providers = Object.entries(providerConfig).map(([id, provider]) => ({
    id,
    name: provider.name,
    model: provider.model,
    configured: Boolean(process.env[provider.keyName]),
    keyName: provider.keyName,
  }));

  res.json({ providers });
});

function getConversation(body) {
  if (Array.isArray(body.messages)) {
    return body.messages
      .filter((message) => ['user', 'assistant'].includes(message?.role) && typeof message.content === 'string')
      .slice(-20)
      .map((message) => ({ role: message.role, content: message.content.trim().slice(0, 8000) }))
      .filter((message) => message.content);
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  return prompt ? [{ role: 'user', content: prompt.slice(0, 8000) }] : [];
}

async function readProviderResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || data?.message || 'The AI provider request failed.');
    error.statusCode = response.status === 429 ? 429 : 502;
    throw error;
  }
  return data;
}

async function requestProvider(providerId, messages) {
  const provider = providerConfig[providerId];
  const apiKey = process.env[provider.keyName];
  const systemMessage = { role: 'system', content: agentInstructions };

  if (providerId === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: provider.model,
        messages: [systemMessage, ...messages],
        temperature: 0.7,
      }),
    });
    const data = await readProviderResponse(response);
    return data?.choices?.[0]?.message?.content?.trim();
  }

  if (providerId === 'claude') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 1200,
        system: agentInstructions,
        messages,
      }),
    });
    const data = await readProviderResponse(response);
    return data?.content?.filter((part) => part.type === 'text').map((part) => part.text).join('\n').trim();
  }

  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: agentInstructions }] },
      contents,
      generationConfig: { temperature: 0.7 },
    }),
  });
  const data = await readProviderResponse(response);
  return data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
}

app.post('/api/chat', async (req, res) => {
  const body = req.body || {};
  const providerId = body.provider || 'openai';
  const provider = providerConfig[providerId];
  const messages = getConversation(body);

  if (!provider) {
    return res.status(400).json({ error: 'Choose a supported provider: OpenAI, Claude, or Gemini.' });
  }

  if (!messages.length) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  if (!process.env[provider.keyName]) {
    if (!body.provider) {
      return res.json({ reply: buildFallbackReply(messages[messages.length - 1].content) });
    }
    return res.status(503).json({ error: `${provider.keyName} is not configured on the server.` });
  }

  try {
    const reply = await requestProvider(providerId, messages);
    return res.json({ reply: reply || 'The provider returned an empty response.' });
  } catch (error) {
    return res.status(error.statusCode || 502).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Torien is running on http://localhost:${port}`);
});
