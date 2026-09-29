const chatThread = document.getElementById('chatThread');
const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const navItems = document.querySelectorAll('.nav-item');
const appShell = document.querySelector('.app-shell');
const navToggle = document.getElementById('navToggle');
const navBackdrop = document.getElementById('navBackdrop');
const primaryAction = document.querySelector('.primary-btn');
const secondaryAction = document.querySelector('.secondary-btn');
const ghostAction = document.querySelector('.ghost-btn');
const overviewView = document.getElementById('overviewView');
const agentsView = document.getElementById('agentsView');
const sectionView = document.getElementById('sectionView');
const sectionEyebrow = document.getElementById('sectionEyebrow');
const sectionHeading = document.getElementById('sectionHeading');
const sectionDescription = document.getElementById('sectionDescription');
const pageTitle = document.getElementById('pageTitle');
const agentCards = document.querySelectorAll('.agent-card');
const agentGallery = document.getElementById('agentGallery');
const agentWorkspace = document.getElementById('agentWorkspace');
const backToAgents = document.getElementById('backToAgents');
const agentHeading = document.getElementById('agentHeading');
const engineStatus = document.getElementById('engineStatus');
const engineNotice = document.getElementById('engineNotice');
const agentChatThread = document.getElementById('agentChatThread');
const agentPromptForm = document.getElementById('agentPromptForm');
const agentPromptInput = document.getElementById('agentPromptInput');
const agentSendButton = document.getElementById('agentSendButton');
const agentNames = {
  general: 'Torien',
  research: 'Research Agent',
  planning: 'Planning Agent',
  code: 'Code Agent',
  automation: 'Automation Agent'
};
const agentThreads = {};
let selectedAgent = 'general';
let engineConfigured = false;

const sectionContent = {
  workflows: {
    title: 'Workflows',
    eyebrow: 'Automation',
    heading: 'No workflows configured',
    description: 'Workflow creation and automatic triggers are not available yet.'
  },
  memory: {
    title: 'Memory',
    eyebrow: 'Conversation data',
    heading: 'No saved memory',
    description: 'Agent conversations stay in this browser session and are cleared when the page reloads.'
  },
  plugins: {
    title: 'Plugins',
    eyebrow: 'Extensions',
    heading: 'No plugins connected',
    description: 'External plugins are not connected. Torien’s built-in task agents are available from the Agents section.'
  },
  settings: {
    title: 'Settings',
    eyebrow: 'Configuration',
    heading: 'Torien engine configuration',
    description: 'Connect the server-side AI engine with OPENAI_API_KEY in your hosting environment. The key stays on the server and is not stored in this browser.'
  }
};

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

function createAgentMessage(role, text, threadElement = agentChatThread, agentId = selectedAgent) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role === 'user' ? 'user' : 'agent'}`;

  if (role !== 'user') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = 'T';
    wrapper.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const label = document.createElement('strong');
  label.textContent = role === 'user' ? 'You' : agentNames[agentId];
  const messageText = document.createElement('p');
  messageText.textContent = text;
  bubble.append(label, messageText);
  wrapper.appendChild(bubble);
  threadElement.appendChild(wrapper);
  threadElement.scrollTop = threadElement.scrollHeight;
}

function renderAgentThread(agentId) {
  const thread = agentThreads[agentId];
  agentChatThread.replaceChildren();
  thread.forEach((message) => createAgentMessage(message.role, message.content, agentChatThread, agentId));
}

function updateEngineStatus() {
  engineStatus.textContent = engineConfigured ? 'Ready' : 'Needs setup';
  engineStatus.classList.toggle('online', engineConfigured);
  agentSendButton.disabled = !engineConfigured;
  agentPromptInput.disabled = !engineConfigured;
  agentPromptInput.placeholder = engineConfigured
    ? `Ask the ${agentNames[selectedAgent]}...`
    : 'Connect Torien’s AI engine in Settings to start chatting.';
  engineNotice.textContent = engineConfigured
    ? 'Torien is ready. Each specialist uses its own instructions for this task.'
    : 'To enable live answers, add OPENAI_API_KEY to your Vercel project’s Environment Variables and redeploy. Keep this public app access-controlled to prevent unexpected usage.';
}

async function loadAgentStatus() {
  try {
    const response = await fetch('/api/agents');
    if (!response.ok) throw new Error('Could not load Torien status.');
    const data = await response.json();
    engineConfigured = Boolean(data.configured);
    agentCards.forEach((card) => {
      const status = card.querySelector('.agent-card-status');
      status.textContent = engineConfigured ? 'Ready' : 'Needs setup';
      status.classList.toggle('connected', engineConfigured);
    });
    if (!agentWorkspace.hidden) updateEngineStatus();
  } catch (error) {
    engineConfigured = false;
    engineNotice.textContent = 'Torien could not check its connection. Make sure the server is running.';
  }
}

function openAgent(agentId) {
  selectedAgent = agentId;
  agentGallery.hidden = true;
  agentWorkspace.hidden = false;
  agentHeading.textContent = agentNames[agentId];

  if (!agentThreads[agentId]) {
    agentThreads[agentId] = [{
      role: 'assistant',
      content: `${agentNames[agentId]} is ready for ${agentId === 'general' ? 'general questions' : `${agentId}-focused work`}. Share your task, context, and any constraints.`
    }];
  }

  renderAgentThread(agentId);
  updateEngineStatus();
}

function showView(view, updateLocation = true) {
  const activeView = ['overview', 'agents', ...Object.keys(sectionContent)].includes(view) ? view : 'overview';
  const section = sectionContent[activeView];
  overviewView.hidden = activeView !== 'overview';
  agentsView.hidden = activeView !== 'agents';
  sectionView.hidden = !section;
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.view === activeView));
  pageTitle.textContent = activeView === 'overview' ? 'Operations Center' : activeView === 'agents' ? 'AI Agents' : section.title;

  if (section) {
    sectionEyebrow.textContent = section.eyebrow;
    sectionHeading.textContent = section.heading;
    sectionDescription.textContent = section.description;
  }

  if (updateLocation && window.location.hash !== `#${activeView}`) {
    window.location.hash = activeView;
  }

  if (activeView === 'agents') {
    agentGallery.hidden = false;
    agentWorkspace.hidden = true;
    loadAgentStatus();
  }
}

function setMobileNavigation(open) {
  const shouldOpen = open && window.matchMedia('(max-width: 900px)').matches;
  appShell.classList.toggle('nav-open', shouldOpen);
  navBackdrop.hidden = !shouldOpen;
  document.body.classList.toggle('nav-open', shouldOpen);
  navToggle.setAttribute('aria-expanded', String(shouldOpen));
  navToggle.setAttribute('aria-label', shouldOpen ? 'Close navigation' : 'Open navigation');
}

async function handlePrompt(inputText) {
  const text = inputText.trim();
  if (!text) return;

  createMessage('user', 'You', text);
  promptInput.value = '';

  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: 'general', messages: [{ role: 'user', content: text }] }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Torien could not complete the request.');
    createMessage('agent', 'Torien', data.reply);
  } catch (error) {
    createMessage('agent', 'Torien', error.message);
  }
}

promptForm.addEventListener('submit', (event) => {
  event.preventDefault();
  handlePrompt(promptInput.value);
});

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    showView(item.dataset.view || 'overview');
    setMobileNavigation(false);
  });
});

navToggle.addEventListener('click', () => {
  setMobileNavigation(navToggle.getAttribute('aria-expanded') !== 'true');
});

navBackdrop.addEventListener('click', () => setMobileNavigation(false));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMobileNavigation(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) setMobileNavigation(false);
});

agentCards.forEach((card) => {
  card.addEventListener('click', () => openAgent(card.dataset.agent));
});

backToAgents.addEventListener('click', () => {
  agentWorkspace.hidden = true;
  agentGallery.hidden = false;
});

agentPromptForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = agentPromptInput.value.trim();
  if (!prompt || agentSendButton.disabled) return;

  const agentId = selectedAgent;
  const thread = agentThreads[agentId];
  thread.push({ role: 'user', content: prompt });
  renderAgentThread(agentId);
  agentPromptInput.value = '';
  agentSendButton.disabled = true;
  agentSendButton.textContent = 'Working...';

  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: agentId, messages: thread }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Torien could not complete the request.');
    thread.push({ role: 'assistant', content: data.reply });
  } catch (error) {
    thread.push({ role: 'assistant', content: error.message });
  } finally {
    if (selectedAgent === agentId && !agentWorkspace.hidden) renderAgentThread(agentId);
    agentSendButton.textContent = 'Send';
    agentSendButton.disabled = !engineConfigured;
  }
});

window.addEventListener('hashchange', () => {
  showView(window.location.hash.slice(1), false);
  setMobileNavigation(false);
});
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
