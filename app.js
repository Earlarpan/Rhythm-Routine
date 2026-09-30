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
    agentCards.forEach(c => { const s = c.querySelector('.agent-card-status'); if (s) { s.textContent = 'Ready'; s.style.color = '#34d399'; } });
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

function showView(v) {
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

  if (navItems) navItems.forEach(b => b.addEventListener('click', () => showView(b.getAttribute('data-view'))));
  if (agentCards) agentCards.forEach(c => c.addEventListener('click', () => openAgent(c.getAttribute('data-agent'))));
  if (backToAgents) backToAgents.addEventListener('click', () => { if (agentGallery) agentGallery.style.display = 'grid'; if (agentWorkspace) agentWorkspace.style.display = 'none'; loadAgentStatus(); });
  
  if (promptForm && promptInput) {
    promptForm.addEventListener('submit', async (e) => {
      e.preventDefault(); const t = promptInput.value.trim(); if (!t) return; promptInput.value = ''; createMessage('user', 'You', t);
      const w = document.createElement('div'); w.className = 'message agent'; w.innerHTML = `<div class="avatar" style="background:#00f0ff; color:black; font-weight:700;">AS</div><div class="bubble" style="background:#121c38; border:1px solid #1e293b;"><strong style="color:#00f0ff">Astro Core</strong><p style="color:#94a3b8; font-style:italic;">Processing quantum logic channels...</p></div>`;
      if (chatThread) { chatThread.appendChild(w); chatThread.scrollTop = chatThread.scrollHeight; }
      const ans = await handlePrompt(t); if (w.querySelector('p')) { w.querySelector('p').style.color = '#e2e8f0'; w.querySelector('p').style.fontStyle = ''; w.querySelector('p').textContent = ans; } if (chatThread) chatThread.scrollTop = chatThread.scrollHeight;
    });
  }
  
  if (agentPromptForm && agentPromptInput) {
    agentPromptForm.addEventListener('submit', async (e) => {
      e.preventDefault(); const t = agentPromptInput.value.trim(); if (!t) return; agentPromptInput.value = ''; createAgentMessage('user', t);
      if (!agentThreads[selectedAgent]) agentThreads[selectedAgent] = []; agentThreads[selectedAgent].push({ role: 'user', content: t });
const w = document.createElement('div'); w.className = 'message agent'; w.innerHTML = <div class="avatar" style="background:#bd00ff; color:white; font-weight:700;">A</div><div class="bubble" style="background:#121c38; border:1px solid #1e293b;"><strong style="color:#bd00ff">${agentNames[selectedAgent]}</strong><p style="color:#94a3b8; font-style:italic;">Evaluating vector space parameters...</p></div>;
if (agentChatThread) { agentChatThread.appendChild(w); agentChatThread.scrollTop = agentChatThread.scrollHeight; }
const ans = await handlePrompt(t); if (w.querySelector('p')) { w.querySelector('p').style.color = '#e2e8f0'; w.querySelector('p').style.fontStyle = ''; w.querySelector('p').textContent = ans; } if (agentChatThread) agentChatThread.scrollTop = agentChatThread.scrollHeight;
agentThreads[selectedAgent].push({ role: 'assistant', content: ans });
});
}
const deleteBtn = document.getElementById('deleteAccountActionBtn');
if (deleteBtn) {
deleteBtn.addEventListener('click', () => {
if (confirm("🚨 WARNING CRITICAL PARAMETER WIPE: This will drop current system sessions, clear user configurations, and lock the mainframe gates. Proceed with complete account profile deletion?")) {
alert("Session parameters dropped. Mainframe node locked.");
window.location.reload();
}
});
}
loadAgentStatus();
}
function setupCustomAuthFlow() {
const switchLink = document.getElementById('authSwitchLink');
const authForm = document.getElementById('customAuthForm');
const errorBar = document.getElementById('authErrorMsg');
if (!switchLink || !authForm || !errorBar) return;
switchLink.addEventListener('click', (e) => {
e.preventDefault();
isSignUpMode = !isSignUpMode;
errorBar.style.display = 'none';
document.getElementById('authTitle').textContent = isSignUpMode ? 'Create account' : 'Welcome back';
document.getElementById('authSubtitle').textContent = isSignUpMode ? 'Get started with your free Astro neural matrix' : 'Sign in to your Astro Agent workspace';
document.getElementById('nameFieldContainer').style.display = isSignUpMode ? 'block' : 'none';
document.getElementById('switchPromptText').textContent = isSignUpMode ? 'Already have an account?' : "Don't have an account?";
switchLink.textContent = isSignUpMode ? 'Sign in' : 'Sign up';
});
authForm.addEventListener('submit', (e) => {
e.preventDefault();
errorBar.style.display = 'none';
const email = document.getElementById('authEmail').value.trim();
const password = document.getElementById('authPass').value.trim();
const name = isSignUpMode ? document.getElementById('authName').value.trim() : 'Matrix Admin User';
if (!email || !password) {
errorBar.textContent = 'Mainframe Blocked: Email and password fields must contain configuration values.';
errorBar.style.display = 'block';
return;
}
if (password.length < 6) {
errorBar.textContent = 'Mainframe Blocked: Password matrix sequence must be at least 6 characters long.';
errorBar.style.display = 'block';
return;
}
if (isSignUpMode && !name) {
errorBar.textContent = 'Mainframe Blocked: Full name parameters required to compile new profile profiles.';
errorBar.style.display = 'block';
return;
}
document.getElementById('authScreen').style.display = 'none';
document.getElementById('appContainer').style.display = 'flex';
const profileBox = document.getElementById('userProfileButton');
if (profileBox) {
const initial = name.charAt(0).toUpperCase();
profileBox.innerHTML = <div style="display: flex; align-items: center; gap: 10px; color: white; font-family: 'Inter', sans-serif; width: 100%;"> <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #00f0ff, #bd00ff); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);">${initial}</div> <div style="flex-grow: 1; min-width: 0;"> <p style="font-size: 13px; font-weight: 600; margin: 0; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</p> <p style="font-size: 11px; margin: 0; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${email}</p> </div> <a href="." style="font-size: 12px; color: #f87171; text-decoration: none; font-weight: 600; margin-left: 8px; border-bottom: 1px dotted #f87171;">Exit</a> </div>;
}
initDashboardCore();
});
}
document.addEventListener("DOMContentLoaded", () => {
setupCustomAuthFlow();
});
