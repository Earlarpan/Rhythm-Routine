const chatThread = document.getElementById('chatThread');
const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const quickActions = document.querySelectorAll('.quick-action');
const navItems = document.querySelectorAll('.nav-item');
const primaryAction = document.querySelector('.primary-btn');
const secondaryAction = document.querySelector('.secondary-btn');
const ghostAction = document.querySelector('.ghost-btn');

function createMessage(role, author, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  if (role === 'agent') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = 'AI';
    wrapper.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const label = document.createElement('strong');
  label.textContent = author;

  const messageText = document.createElement('p');
  messageText.textContent = text;

  bubble.append(label, messageText);
  wrapper.appendChild(bubble);
  chatThread.appendChild(wrapper);
  chatThread.scrollTop = chatThread.scrollHeight;
}

function buildResponse(prompt) {
  const trimmed = prompt.toLowerCase();

  if (trimmed.includes('summarize') || trimmed.includes('summary')) {
    return 'Here is the summary: focus on the core objective, list the main blockers, highlight the most important decisions, and finish with a clear action plan for the next 48 hours.';
  }

  if (trimmed.includes('plan') || trimmed.includes('roadmap') || trimmed.includes('launch') || trimmed.includes('milestone')) {
    return 'Recommended roadmap: 1) define scope and assumptions, 2) assign owners and tasks, 3) validate critical risks, 4) ship an MVP, 5) review feedback and iterate weekly.';
  }

  if (trimmed.includes('code') || trimmed.includes('build') || trimmed.includes('implement')) {
    return 'Implementation approach: start with the smallest working version, define architecture clearly, build the core workflow first, test the critical path, then add polish and automation.';
  }

  if (trimmed.includes('research') || trimmed.includes('analyze')) {
    return 'Research direction: gather the target audience, compare market patterns, identify the key constraints, and map the strongest opportunities before moving into execution.';
  }

  if (trimmed.includes('fix') || trimmed.includes('bug')) {
    return 'Fix strategy: reproduce the issue, isolate the root cause, patch the smallest failing layer, verify the outcome, and confirm there are no regressions in adjacent flows.';
  }

  if (trimmed.includes('email') || trimmed.includes('message')) {
    return 'Draft message: "Thanks for the update. I have reviewed the current state and recommend we progress with the next milestone while tracking the key risks closely."';
  }

  if (trimmed.includes('schedule') || trimmed.includes('calendar') || trimmed.includes('task')) {
    return 'Proposed schedule: start with stakeholder alignment, reserve deep work blocks, schedule review checkpoints, and leave one buffer slot for blockers or last-minute changes.';
  }

  return 'I can help with research, planning, code direction, summaries, and workflow automation. Tell me the exact outcome you want and I will turn it into an action plan.';
}

async function handlePrompt(inputText) {
  const text = inputText.trim();
  if (!text) return;

  createMessage('user', 'You', text);
  promptInput.value = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text }),
    });

    const data = await response.json();
    const reply = data?.reply || buildResponse(text);
    createMessage('agent', 'Torien', reply);
  } catch (error) {
    createMessage('agent', 'Torien', buildResponse(text));
  }
}

function triggerAction(actionKey) {
  const promptMap = {
    research: 'Research the best path for this initiative and highlight the key risks, stakeholders, and likely bottlenecks.',
    summarize: 'Summarize this project in a crisp executive overview with priorities, blockers, and the next 3 actions.',
    plan: 'Create a clear launch plan with milestones, owners, success checkpoints, and a delivery timeline.',
    code: 'Suggest the best implementation plan and the core technical steps to build this feature safely and quickly.'
  };

  if (promptMap[actionKey]) {
    handlePrompt(promptMap[actionKey]);
    return;
  }

  handlePrompt('Help me with the next best action for this workflow.');
}

promptForm.addEventListener('submit', (event) => {
  event.preventDefault();
  handlePrompt(promptInput.value);
});

quickActions.forEach((button) => {
  button.addEventListener('click', () => {
    triggerAction(button.dataset.action);
  });
});

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((nav) => nav.classList.toggle('active', nav === item));
    createMessage('agent', 'Torien', `Workspace view updated to ${item.textContent.trim()}.`);
  });
});

if (primaryAction) {
  primaryAction.addEventListener('click', () => {
    const launchPrompt = 'Launch the agent by creating the highest-priority implementation checklist and the first 3 execution steps.';
    handlePrompt(launchPrompt);
  });
}

if (secondaryAction) {
  secondaryAction.addEventListener('click', () => {
    const taskPrompt = 'Create a new task list with 3 priorities, owners, and due dates for the next sprint.';
    handlePrompt(taskPrompt);
  });
}

if (ghostAction) {
  ghostAction.addEventListener('click', () => {
    createMessage('agent', 'Torien', 'Activity log: Research reviewed, plan drafted, and next actions queued for execution.');
  });
}
