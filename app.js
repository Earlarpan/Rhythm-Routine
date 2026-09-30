```javascript
// Variable Mapping Registry Configuration
let chatThread, promptForm, promptInput, navItems, overviewView, agentsView, sectionView, sectionEyebrow, sectionHeading, sectionDescription, pageTitle, agentCards, agentGallery, agentWorkspace, backToAgents, agentHeading, engineStatus, engineNotice, agentChatThread, agentPromptForm, agentPromptInput, agentSendButton, settingsView, topbarCategory;
const agentNames = { general: 'Astro Core', research: 'Research Agent', planning: 'Planning Agent', code: 'Code Architect', automation: 'Automation Agent', cybersecurity: 'Cybersec Sentinel', creative: 'Creative Catalyst' }, agentThreads = {};
let selectedAgent = 'general';
let isSignUpMode = false;

const sectionContent = {
  workflows: { category: 'AUTOMATION PIPELINES', title: 'Automations', eyebrow: 'Event Trigger Routines', heading: 'No active automation loops found', description: 'Decentralized event handlers and background execution triggers are currently dormant. Link a plugin source module to start mapping automation webhooks.' },
  memory: { category: 'DATA ARCHITECTURE', title: 'Neural Vector Store', eyebrow: 'Persistent Vectors', heading: 'Volatile system memory online', description: 'Localized conversation data storage arrays reset upon complete browser frame updates. Connect a secure persistent cache system to maintain long-term node memory structures.' },
  plugins: { category: 'CONNECTIONS INTEGRATIONS', title: 'Integrations', eyebrow: 'Module Bridges', heading: 'No integration bridges mounted', description: 'Built-in baseline agent configurations are active. External third-party data streams, GitHub repository loops, and server configurations can be enabled via dynamic system API profiles.' }
};

function createMessage(r, a, t) {
  if (!chatThread) return;
  const w = document.createElement('div'); w.className = `message ${r}`;
  if (r === 'agent') { const av = document.createElement('div'); av.className = 'avatar'; av.style.background = '#00f0ff'; av.style.color = 'black'; av.style.fontWeight = '700'; av.textContent = 'AS'; w.appendChild(av); }
  const b = document.createElement('div'); b.className = 'bubble'; b.style.background = '#121c38'; b.style.border = '1px solid #1e293b';
  b.innerHTML = `<strong style="color:#00f0ff">${a}</strong><p style="color:#e2e8f0; margin-top:4px;">${t}</p>`; w.appendChild(b); chatThread.appendChild(w); chatThread.scrollTop = chatThread.scrollHeight;
}

function createAgentMessage(r, t) {
  if (!agentChatThread) return;
  const w = document.createElement('div'); w.className = `message ${r === 'user' ? 'user' : 'agent'}`;
  if (r !== 'user') { const av = document.createElement('div'); av.className = 'avatar'; av.style.background = '#bd00ff'; av.style.color = 'white'; av.style.fontWeight = '700'; av.textContent = 'A'; w.appendChild(av); }
  const b = document.createElement('div'); b.className = 'bubble'; b.style.background = '#121c38'; b.style.border = '1px solid #1e293b';
  b.innerHTML = `<strong style="color:#bd00ff">${r === 'user' ? 'You' : agentNames[selectedAgent]}</strong><p style="color:#e2e8f0; margin-top:4px;">${t}</p>`; w.appendChild(b); agentChatThread.appendChild(w); agentChatThread.scrollTop = agentChatThread.scrollHeight;
}

function updateEngineStatus() {
  if (engineStatus) { engineStatus.textContent = 'Matrix Ready'; engineStatus.style.color = '#39ff14'; }
  if (agentSendButton) agentSendButton.disabled = false;
  if (agentPromptInput) { agentPromptInput.disabled = false; agentPromptInput.placeholder = `Transmit operational data to ${agentNames[selectedAgent]}...`; }
  if (engineNotice) engineNotice.textContent = `${agentNames[selectedAgent]} is fully synchronized via Edge neural framework loops.`;
}

function loadAgentStatus() {
  if (agentCards) {
    agentCards.forEach(c => { const s = c.querySelector('.agent-card-status'); if (s) { s.textContent = 'Ready'; s.style.color = '#39ff14'; } });
  }
  if (agentWorkspace && agentWorkspace.style.display !== 'none') updateEngineStatus();
}

function openAgent(id) {
  selectedAgent = id; 
  if (agentGallery) agentGallery.style.display = 'none'; 
  if (agentWorkspace) agentWorkspace.style.display = 'block'; 
  if (agentHeading) agentHeading.textContent = agentNames[id];
  if (!agentThreads[id]) agentThreads[id] = [{ role: 'assistant', content: `${agentNames[id]} cluster node loaded safely. Transmit localized task profiles for sandbox analysis.` }];
  if (agentChatThread) { agentChatThread.replaceChildren(); agentThreads[id].forEach(m => createAgentMessage(m.role, m.content)); }
  updateEngineStatus();
}

// 🗺️ Clickable Navigation Router Core (Tied Directly to Sub-routing Workspace Windows)
function showView(v) {
  // Hide all potential workspace view frames safely first
  if (overviewView) overviewView.style.display = 'none';
  if (agentsView) agentsView.style.display = 'none';
  if (sectionView) sectionView.style.display = 'none';
  if (settingsView) settingsView.style.display = 'none';

  if (navItems) navItems.forEach(i => i.classList.toggle('active', i.dataset.view === v));

  if (v === 'overview') {
    if (overviewView) overviewView.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Operations Center';
    if (topbarCategory) topbarCategory.textContent = 'CORE TERMINAL';
  } else if (v === 'agents') {
    if (agentsView) agentsView.style.display = 'block';
    if (agentGallery) agentGallery.style.display = 'grid';
    if (agentWorkspace) agentWorkspace.style.display = 'none';
    if (pageTitle) pageTitle.textContent = 'AI Core Matrix';
    if (topbarCategory) topbarCategory.textContent = 'DEPLOYED NEURAL ASSETS';
    loadAgentStatus();
  } else if (v === 'settings') {
    if (settingsView) settingsView.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'System Config Parameters';
    if (topbarCategory) topbarCategory.textContent = 'GLOBAL SYSTEM PROFILE';
  } else if (sectionContent[v]) {
    const s = sectionContent[v];
    if (sectionView) sectionView.style.display = 'block';
    if (pageTitle) pageTitle.textContent = s.title;
    if (topbarCategory) topbarCategory.textContent = s.category;
    if (sectionEyebrow) sectionEyebrow.textContent = s.eyebrow;
    if (sectionHeading) sectionHeading.textContent = s.heading;
    if (sectionDescription) sectionDescription.textContent = s.description;
  }
}

async function handlePrompt(txt) {
  try {
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: txt }) });
    const d = await res.json(); return d.error ? "Server Error response block: " + d.error : d.reply;
  } catch { return "Transmission parameter error: Connection to neural backend edge node timed out."; }
}

function initDashboardCore() {
  navItems = document.querySelectorAll('.nav-item'); chatThread = document.getElementById('chatThread'); promptForm = document.getElementById('promptForm'); promptInput = document.getElementById('promptInput'); overviewView = document.getElementById('overviewView'); agentsView = document.getElementById('agentsView'); sectionView = document.getElementById('sectionView'); settingsView = document.getElementById('settingsView'); sectionEyebrow = document.getElementById('sectionEyebrow'); sectionHeading = document.getElementById('sectionHeading'); sectionDescription = document.getElementById('sectionDescription'); pageTitle = document.getElementById('pageTitle'); topbarCategory = document.getElementById('topbarCategory'); agentCards = document.querySelectorAll('.agent-card'); agentGallery = document.getElementById('agentGallery'); agentWorkspace = document.getElementById('agentWorkspace'); backToAgents = document.getElementById('backToAgents'); agentHeading = document.getElementById('agentHeading'); engineStatus = document.getElementById('engineStatus'); engineNotice = document.getElementById('engineNotice'); agentChatThread = document.getElementById('agentChatThread'); agentPromptForm = document.getElementById('agentPromptForm'); agentPromptInput = document.getElementById('agentPromptInput'); agentSendButton = document.getElementById('agentSendButton');

  // Sidebar navigation bindings
  if (navItems) navItems.forEach(b => b.addEventListener('click', () => showView(b.getAttribute('data-view'))));
  // Agent card sandbox initialization bindings
  if (agentCards) agentCards.forEach(c => c.addEventListener('click', () => openAgent(c.getAttribute('data-agent'))));
  if (backToAgents) backToAgents.addEventListener('click', () => { if (agentGallery) agentGallery.style.display = 'grid'; if (agentWorkspace) agentWorkspace.style.display = 'none'; loadAgentStatus(); });
  
  if (promptForm && promptInput) {
    promptForm.addEventListener('submit', async (e) => {
      e.preventDefault(); const t = promptInput.value.trim(); if (!t) return; promptInput.value = ''; createMessage('user', 'You', t);
      const w = document.createElement('div'); w.className = 'message agent'; w.innerHTML = `<div class="avatar" style="background:#00f0ff; color:black; font-weight:700;">AS</div><div class="bubble" style="background:#121c38; border:1px solid #1e293b;"><strong style="color:#00f0ff">Astro Core</strong><p style="color:#94a3b8; font-style:italic;">Processing quantum logic channels...</p></div>`;
      if (chatThread) { chatThread.appendChild(w); chatThread.scrollTop = chatThread.scrollHeight; }
