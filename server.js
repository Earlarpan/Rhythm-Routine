const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

function buildFallbackReply(prompt) {
  const text = String(prompt || '').toLowerCase();

  if (text.includes('summarize') || text.includes('summary')) {
    return 'Summary template: state the core objective, key constraints, important decisions, and next steps.\n\nWhy this structure helps: it separates the goal from the blockers and turns the summary into something actionable. This is a general template, not a summary of your specific material.';
  }

  if (text.includes('plan') || text.includes('roadmap') || text.includes('launch') || text.includes('milestone')) {
    return 'Recommended sequence: 1) define scope and assumptions, 2) assign owners and tasks, 3) validate the biggest risks, 4) ship the smallest useful version, 5) review feedback and iterate.\n\nWhy this order: agreeing on scope first prevents wasted work; testing risks before release makes the plan more reliable; feedback then guides the next iteration. This is a general plan until you share project details.';
  }

  if (text.includes('code') || text.includes('build') || text.includes('implement')) {
    return 'Implementation approach: define the smallest useful version, choose an architecture that fits it, build the critical workflow, test the main path, then add polish.\n\nWhy: this keeps early work focused and exposes integration problems before extra features make them harder to change. Share your code or requirements for a specific implementation.';
  }

  if (text.includes('research') || text.includes('analyze')) {
    return 'I can suggest a research plan in fallback mode: define the question, identify credible sources, compare evidence, and record uncertainties.\n\nWhy: a clear question and source comparison make conclusions easier to verify. I cannot search sources or provide request-specific findings until an AI provider is connected.';
  }

  if (text.includes('fix') || text.includes('bug')) {
    return 'Debugging approach: reproduce the issue, capture the error, isolate the failing layer, make the smallest root-cause fix, then retest the affected flow and nearby behavior.\n\nWhy: reproducing and isolating the failure helps avoid unrelated changes; regression checks confirm the fix did not break adjacent behavior. Share the error and relevant code for a specific diagnosis.';
  }

  if (text.includes('task') || text.includes('schedule') || text.includes('calendar')) {
    return 'Planning template: choose the top three priorities, reserve time for focused work, assign an owner to each task, and set a review checkpoint.\n\nWhy: limiting active priorities makes progress easier to track, while owners and checkpoints make blockers visible. This suggests a plan; it does not create calendar events or save tasks.';
  }

  return 'I can’t provide a tailored explanation in fallback mode because no AI provider is connected. Connect OpenAI, Claude, or Gemini in the Agents page for answers that address your request and explain the reasoning, assumptions, and steps. This fallback does not browse the web or perform actions.';
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
  'You are Torien, a helpful AI operations assistant. For every request, give a direct answer and a clear plain-language explanation of how or why it is the answer. For procedures, give actionable steps and explain important steps. For recommendations, state the reasons, assumptions, and relevant tradeoffs. For factual or research questions, distinguish verified information from uncertainty and never invent sources or claim to have browsed when you have not. For code, explain the key changes and how to use or verify them. If you cannot complete a request, explain what is missing and what the user can provide next. Keep explanations proportional to the question. Do not reveal private chain-of-thought; provide a concise, verifiable rationale instead.';

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
