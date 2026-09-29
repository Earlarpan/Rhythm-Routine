const chatThread = document.getElementById('chatThread');
const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const quickActions = document.querySelectorAll('.quick-action');
const navItems = document.querySelectorAll('.nav-item');
const primaryAction = document.querySelector('.primary-btn');
const secondaryAction = document.querySelector('.secondary-btn');
const ghostAction = document.querySelector('.ghost-btn');
const overviewView = document.getElementById('overviewView');
const agentsView = document.getElementById('agentsView');
const pageTitle = document.getElementById('pageTitle');
const providerButtons = document.querySelectorAll('.provider-tab');
const providerNotice = document.getElementById('providerNotice');
const providerHeading = document.getElementById('providerHeading');
const providerModel = document.getElementById('providerModel');
const providerChatThread = document.getElementById('providerChatThread');
const providerPromptForm = document.getElementById('providerPromptForm');
const providerPromptInput = document.getElementById('providerPromptInput');
const providerSendButton = document.getElementById('providerSendButton');
const providerConnectionHeading = document.getElementById('providerConnectionHeading');
const providerConnectionText = document.getElementById('providerConnectionText');
const providerKeyLink = document.getElementById('providerKeyLink');

const providerDetails = {
  openai: {
    name: 'ChatGPT / OpenAI',
    env: 'OPENAI_API_KEY',
    url: 'https://platform.openai.com/api-keys',
    greeting: 'Chat with OpenAI using your API account. This uses API billing, which is separate from a ChatGPT subscription.'
  },
  claude: {
    name: 'Claude',
    env: 'ANTHROPIC_API_KEY',
    url: 'https://console.anthropic.com/settings/keys',
    greeting: 'Chat with Claude using your Anthropic API account.'
  },
  gemini: {
    name: 'Gemini',
    env: 'GEMINI_API_KEY',
    url: 'https://aistudio.google.com/app/apikey',
    greeting: 'Chat with Gemini using your Google AI API account.'
  }
};

const providerThreads = Object.fromEntries(
  Object.entries(providerDetails).map(([id, provider]) => [id, [
    { role: 'assistant', content: `${provider.name} is selected. ${provider.greeting}` }
  ]])
);
let selectedProvider = 'openai';
let providerStatus = {};

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

function createProviderMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role === 'user' ? 'user' : 'agent'}`;

  if (role !== 'user') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = selectedProvider === 'openai' ? 'AI' : providerDetails[selectedProvider].name.slice(0, 2).toUpperCase();
    wrapper.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const label = document.createElement('strong');
  label.textContent = role === 'user' ? 'You' : providerDetails[selectedProvider].name;
  const messageText = document.createElement('p');
  messageText.textContent = text;
  bubble.append(label, messageText);
  wrapper.appendChild(bubble);
  providerChatThread.appendChild(wrapper);
  providerChatThread.scrollTop = providerChatThread.scrollHeight;
}

function renderProviderThread() {
  providerChatThread.replaceChildren();
  providerThreads[selectedProvider].forEach((message) => createProviderMessage(message.role, message.content));
}

function renderProviderStatus() {
  const details = providerDetails[selectedProvider];
  const status = providerStatus[selectedProvider];
  const configured = Boolean(status?.configured);

  providerButtons.forEach((button) => {
    const isSelected = button.dataset.provider === selectedProvider;
    button.classList.toggle('active', isSelected);
    button.setAttribute('aria-selected', String(isSelected));
    const state = button.querySelector(`[data-provider-state="${button.dataset.provider}"]`);
    const connected = Boolean(providerStatus[button.dataset.provider]?.configured);
    state.textContent = connected ? 'Connected' : 'Needs key';
    state.classList.toggle('connected', connected);
  });

  providerHeading.textContent = details.name;
  providerModel.textContent = configured ? status.model : 'Not connected';
  providerModel.classList.toggle('online', configured);
  providerConnectionHeading.textContent = configured ? `${details.name} connected` : `Set up ${details.name}`;
  providerConnectionText.textContent = configured
    ? `Ready to chat with ${status.model}.`
    : `Add ${details.env} in Vercel Project Settings > Environment Variables, then redeploy. For local use, set it in your shell before starting the server.`;
  providerKeyLink.href = details.url;
  providerKeyLink.textContent = configured ? 'Manage provider API key' : 'Get an API key';
  providerPromptInput.disabled = !configured;
  providerSendButton.disabled = !configured;
  providerPromptInput.placeholder = configured
    ? `Message ${details.name}...`
    : `Add ${details.env} to enable ${details.name}...`;
  providerNotice.textContent = configured
    ? `${details.name} is ready. Your conversation stays separate from the other providers.`
    : `${details.name} needs a server-side API key before it can respond.`;
  providerNotice.classList.toggle('connected', configured);
}

async function loadProviderStatus() {
  try {
    const response = await fetch('/api/providers');
    if (!response.ok) throw new Error('Could not load provider status.');
    const data = await response.json();
    providerStatus = Object.fromEntries(data.providers.map((provider) => [provider.id, provider]));
    renderProviderStatus();
  } catch (error) {
    providerNotice.textContent = 'Could not check provider connections. Make sure the Torien server is running.';
  }
}

function showView(view, updateLocation = true) {
  const activeView = view === 'agents' ? 'agents' : 'overview';
  overviewView.hidden = activeView !== 'overview';
  agentsView.hidden = activeView !== 'agents';
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.view === activeView));
  pageTitle.textContent = activeView === 'agents' ? 'AI Agents' : 'Operations Center';

  if (updateLocation && window.location.hash !== `#${activeView}`) {
    window.location.hash = activeView;
  }

  if (activeView === 'agents') loadProviderStatus();
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
    if (item.dataset.view) {
      showView(item.dataset.view);
      return;
    }

    showView('overview');
    createMessage('agent', 'Torien', `${item.textContent.trim()} is not available yet.`);
  });
});

providerButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedProvider = button.dataset.provider;
    renderProviderThread();
    renderProviderStatus();
  });
});

providerPromptForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = providerPromptInput.value.trim();
  if (!prompt || providerSendButton.disabled) return;

  providerThreads[selectedProvider].push({ role: 'user', content: prompt });
  renderProviderThread();
  providerPromptInput.value = '';
  providerSendButton.disabled = true;
  providerSendButton.textContent = 'Sending...';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: selectedProvider, messages: providerThreads[selectedProvider] }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The provider request failed.');
    providerThreads[selectedProvider].push({ role: 'assistant', content: data.reply });
  } catch (error) {
    providerThreads[selectedProvider].push({ role: 'assistant', content: error.message });
  } finally {
    renderProviderThread();
    renderProviderStatus();
    providerSendButton.textContent = 'Send';
    if (providerStatus[selectedProvider]?.configured) providerSendButton.disabled = false;
  }
});

window.addEventListener('hashchange', () => showView(window.location.hash.slice(1), false));
showView(window.location.hash.slice(1), false);

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
