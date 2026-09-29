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

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getAgentStatus() {
  return {
    configured: Boolean(process.env.OPENAI_API_KEY),
    agents: Object.entries(agentConfig).map(([id, agent]) => ({ id, name: agent.name })),
  };
}

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

async function requestAgent(body = {}) {
  const agentId = body.agent || 'general';
  const agent = agentConfig[agentId];
  if (!agent) throw createError('Choose a valid Torien agent.', 400);

  const messages = getConversation(body);
  if (!messages.length) throw createError('Prompt is required.', 400);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw createError('Torien’s AI engine is not connected. Add OPENAI_API_KEY to the server environment.', 503);
  }

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'system', content: agent.instruction }, ...messages],
        temperature: 0.7,
      }),
    });
  } catch {
    throw createError('Torien could not reach its AI engine. Check the server connection and try again.', 502);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw createError('Torien received an unreadable response from its AI engine.', 502);
  }

  if (!response.ok) {
    const message = data?.error?.message || 'Torien could not get a response from its AI engine.';
    throw createError(message, response.status === 429 ? 429 : 502);
  }

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw createError('The AI engine returned an empty response.', 502);
  return { reply };
}

module.exports = { getAgentStatus, requestAgent };