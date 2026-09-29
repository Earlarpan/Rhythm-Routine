const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

const agentConfig = {
  general: {
    name: 'Torien',
    instruction: 'You are Torien, a helpful AI assistant. Give a direct answer, explain your reasoning in plain language, state assumptions and uncertainty, and never claim to have performed an action you did not perform.',
  },
  research: {
    name: 'Research Agent',
    instruction: 'You are Torien Research Agent. Analyze information and sources supplied by the user, separate evidence from assumptions, identify uncertainty, and explain findings. You do not have web browsing tools: never claim to search the internet or invent sources. Ask for source material when needed.',
  },
  planning: {
    name: 'Planning Agent',
    instruction: 'You are Torien Planning Agent. Turn the user’s goal into clear priorities, milestones, dependencies, risks, and next actions. State assumptions and explain why the sequence is practical. Do not claim to create calendar events or assign real owners.',
  },
  code: {
    name: 'Code Agent',
    instruction: 'You are Torien Code Agent. Help explain, debug, review, and write software. Provide concrete code when useful, explain key design choices, state missing context, and never claim to edit or test files unless tools actually did so.',
  },
  automation: {
    name: 'Automation Agent',
    instruction: 'You are Torien Automation Agent. Design reliable repeatable workflows, identify triggers and failure handling, and explain implementation steps. No external automation tools are connected, so never claim to run workflows or change external services.',
  },
};

const engineKey = process.env.OPENAI_API_KEY;
const engineModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

app.get('/api/agents', (req, res) => {
  res.json({
    configured: Boolean(engineKey),
    agents: Object.entries(agentConfig).map(([id, agent]) => ({ id, name: agent.name })),
  });
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

async function readModelResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || data?.message || 'Torien could not get a response from its AI engine.');
    error.statusCode = response.status === 429 ? 429 : 502;
    throw error;
  }
  return data;
}

async function requestTorienAgent(agentId, messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${engineKey}`,
    },
    body: JSON.stringify({
      model: engineModel,
      messages: [
        { role: 'system', content: agentConfig[agentId].instruction },
        ...messages,
      ],
      temperature: 0.7,
    }),
  });
  const data = await readModelResponse(response);
  return data?.choices?.[0]?.message?.content?.trim();
}

app.post('/api/agent', async (req, res) => {
  const body = req.body || {};
  const agentId = body.agent || 'general';
  const messages = getConversation(body);

  if (!agentConfig[agentId]) {
    return res.status(400).json({ error: 'Choose a valid Torien agent.' });
  }

  if (!messages.length) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  if (!engineKey) {
    return res.status(503).json({ error: 'Torien’s AI engine is not connected. Add OPENAI_API_KEY to the server environment.' });
  }

  try {
    const reply = await requestTorienAgent(agentId, messages);
    return res.json({ reply: reply || 'The AI engine returned an empty response.' });
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
