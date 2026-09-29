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

app.post('/api/chat', async (req, res) => {
  const prompt = (req.body && req.body.prompt) || '';

  if (!prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.json({ reply: buildFallbackReply(prompt) });
  }

  try {
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are Torien, an AI operations agent. Give concise but useful answers for planning, research, execution, and coding tasks.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      throw new Error(data?.error?.message || 'OpenAI request failed');
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    return res.json({ reply: reply || buildFallbackReply(prompt) });
  } catch (error) {
    return res.json({
      reply: `Torien fallback: ${buildFallbackReply(prompt)}`,
      warning: error.message,
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Torien is running on http://localhost:${port}`);
});
