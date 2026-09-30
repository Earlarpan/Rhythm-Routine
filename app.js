// 🔑 1. AUTH WATCHER FIRST (Runs instantly before anything else to guarantee the button works!)
window.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById('loginSubmitBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // Hide the login screen shield layer
      const authScreen = document.getElementById('authScreen');
      if (authScreen) authScreen.style.display = 'none';
      
      // Reveal the main dashboard container shell
      const appContainer = document.getElementById('appContainer');
      if (appContainer) appContainer.style.display = 'flex';
      
      // Inject the admin profile badge into the sidebar bottom slot
      const profileBox = document.getElementById('userProfileButton');
      if (profileBox) {
        profileBox.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px; color: white;">
            <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">A</div>
            <div>
              <p style="font-size: 13px; font-weight: 600; margin: 0;">Admin Account</p>
              <a href="." style="font-size: 11px; color: #ef4444; text-decoration: none;">Sign Out</a>
            </div>
          </div>
        `;
      }
      
      // Safely initialize the rest of the application dashboard elements
      initDashboardCore();
    });
  }
});

// 📊 2. VARIABLE DEFINITIONS & APPLICATION REGISTRY SETUP
let chatThread, promptForm, promptInput, navItems, overviewView, agentsView, sectionView, sectionEyebrow, sectionHeading, sectionDescription, pageTitle, agentCards, agentGallery, agentWorkspace, backToAgents, agentHeading, engineStatus, engineNotice, agentChatThread, agentPromptForm, agentPromptInput, agentSendButton;
const agentNames = { general: 'Torien', research: 'Research Agent', planning: 'Planning Agent', code: 'Code Agent', automation: 'Automation Agent' }, agentThreads = {};
let selectedAgent = 'general';

const sectionContent = {
  workflows: { title: 'Workflows', eyebrow: 'Automation', heading: 'No workflows configured', description: 'Workflow creation is not available yet.' },
  memory: { title: 'Memory', eyebrow: 'Data', heading: 'No saved memory', description: 'Agent conversations clear when refreshed.' },
  plugins: { title: 'Plugins', eyebrow: 'Extensions', heading: 'No plugins connected', description: 'Built-in agents are available.' },
  settings: { title: 'Settings', eyebrow: 'Config', heading: 'Engine ready', description: 'AI engine connected via GITHUB_TOKEN.' }
};

function createMessage(r, a, t) {
  if (!chatThread) return;
  const w = document.createElement('div'); w.className = `message ${r}`;
  if (r === 'agent') { const av = document.createElement('div'); av.className = 'avatar'; av.textContent = 'AI'; w.appendChild(av); }
  const b = document.createElement('div'); b.className = 'bubble';
  b.innerHTML = `<strong>${a}</strong><p>${t}</p>`; w.appendChild(b); chatThread.appendChild(w); chatThread.scrollTop = chatThread.scrollHeight;
}

function createAgentMessage(r, t) {
  if (!agentChatThread) return;
  const w = document.createElement('div'); w.className = `message ${r === 'user' ? 'user' : 'agent'}`;
  if (r !== 'user') { const av = document.createElement('div'); av.className = 'avatar'; av.textContent = 'T'; w.appendChild(av); }
  const b = document.createElement('div'); b.className = 'bubble';
  b.innerHTML = `<strong>${r === 'user' ? 'You' : agentNames[selectedAgent]}</strong><p>${t}</p>`; w.appendChild(b); agentChatThread.appendChild(w); agentChatThread.scrollTop = agentChatThread.scrollHeight;
}

function updateEngineStatus() {
  if (engineStatus) { engineStatus.textContent = 'Ready'; engineStatus.style.color = '#34d399'; }
  if (agentSendButton) agentSendButton.disabled = false;
  if (agentPromptInput) { agentPromptInput.disabled = false; agentPromptInput.placeholder = `Ask the ${agentNames[selectedAgent]}...`; }
  if (engineNotice) engineNotice.textContent = 'Torien is ready via GitHub Models backend.';
}

function loadAgentStatus() {
  if (agentCards) {
    agentCards.forEach(c => { const s = c.querySelector('.agent-card-status'); if (s) { s.textContent = 'Ready'; s.style.color = '#34d399'; } });
  }
  if (agentWorkspace && !agentWorkspace.hidden) updateEngineStatus();
}

function openAgent(id) {
  selectedAgent = id; if (agentGallery) agentGallery.hidden = true; if (agentWorkspace) agentWorkspace.hidden = false; if (agentHeading) agentHeading.textContent = agentNames[id];
  if (!agentThreads[id]) agentThreads[id] = [{ role: 'assistant', content: `${agentNames[id]} is ready. Share your task!` }];
  if (agentChatThread) { agentChatThread.replaceChildren(); agentThreads[id].forEach(m => createAgentMessage(m.role, m.content)); }
  updateEngineStatus();
}

function showView(v) {
  const av = ['overview', 'agents', ...Object.keys(sectionContent)].includes(v) ? v : 'overview', s = sectionContent[av];
  if (overviewView) overviewView.hidden = av !== 'overview'; if (agentsView) agentsView.hidden = av !== 'agents'; if (sectionView) sectionView.hidden = !s;
  if (navItems) navItems.forEach(i => i.classList.toggle('active', i.dataset.view === av));
  if (pageTitle) pageTitle.textContent = av === 'overview' ? 'Operations Center' : av === 'agents' ? 'AI Agents' : s.title;
  if (s && sectionEyebrow && sectionHeading && sectionDescription) { sectionEyebrow.textContent = s.eyebrow; sectionHeading.textContent = s.heading; sectionDescription.textContent = s.description; }
  if (av === 'agents') { if (agentGallery) agentGallery.hidden = false; if (agentWorkspace) agentWorkspace.hidden = true; loadAgentStatus(); }
}

async function handlePrompt(txt) {
  try {
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: txt }) });
    const d = await res.json(); return d.error ? "Server Error: " + d.error : d.reply;
  } catch { return "Failed to connect to backend."; }
}

// 🛠️ 3. CORE WORKSPACE FUNCTION INITIALIZER
function initDashboardCore() {
  // Bind all workspace components safely after layout is visible
  chatThread = document.getElementById('chatThread'); promptForm = document.getElementById('promptForm'); promptInput = document.getElementById('promptInput'); navItems = document.querySelectorAll('.nav-item'); overviewView = document.getElementById('overviewView'); agentsView = document.getElementById('agentsView'); sectionView = document.getElementById('sectionView'); sectionEyebrow = document.getElementById('sectionEyebrow'); sectionHeading = document.getElementById('sectionHeading'); sectionDescription = document.getElementById('sectionDescription'); pageTitle = document.getElementById('pageTitle'); agentCards = document.querySelectorAll('.agent-card'); agentGallery = document.getElementById('agentGallery'); agentWorkspace = document.getElementById('agentWorkspace'); backToAgents = document.getElementById('backToAgents'); agentHeading = document.getElementById('agentHeading'); engineStatus = document.getElementById('engineStatus'); engineNotice = document.getElementById('engineNotice'); agentChatThread = document.getElementById('agentChatThread'); agentPromptForm = document.getElementById('agentPromptForm'); agentPromptInput = document.getElementById('agentPromptInput'); agentSendButton = document.getElementById('agentSendButton');

  if (navItems) navItems.forEach(b => b.addEventListener('click', () => showView(b.getAttribute('data-view'))));
  if (agentCards) agentCards.forEach(c => c.addEventListener('click', () => openAgent(c.getAttribute('data-agent'))));
  if (backToAgents) backToAgents.addEventListener('click', () => { if (agentGallery) agentGallery.hidden = false; if (agentWorkspace) agentWorkspace.hidden = true; loadAgentStatus(); });
  
  if (promptForm && promptInput) {
    promptForm.addEventListener('submit', async (e) => {
      e.preventDefault(); const t = promptInput.value.trim(); if (!t) return; promptInput.value = ''; createMessage('user', 'You', t);
      const w = document.createElement('div'); w.className = 'message agent'; w.innerHTML = `<div class="avatar">AI</div><div class="bubble"><strong>Torien</strong><p style="color:#94a3b8; font-style:italic;">Thinking...</p></div>`;
      if (chatThread) { chatThread.appendChild(w); chatThread.scrollTop = chatThread.scrollHeight; }
      const ans = await handlePrompt(t); if (w.querySelector('p')) { w.querySelector('p').style.color = ''; w.querySelector('p').style.fontStyle = ''; w.querySelector('p').textContent = ans; } if (chatThread) chatThread.scrollTop = chatThread.scrollHeight;
    });
  }
  
  if (agentPromptForm && agentPromptInput) {
    agentPromptForm.addEventListener('submit', async (e) => {
      e.preventDefault(); const t = agentPromptInput.value.trim(); if (!t) return; agentPromptInput.value = ''; createAgentMessage('user', t);
      if (!agentThreads[selectedAgent]) agentThreads[selectedAgent] = []; agentThreads[selectedAgent].push({ role: 'user', content: t });
      const w = document.createElement('div'); w.className = 'message agent'; w.innerHTML = `<div class="avatar">T</div><div class="bubble"><strong>${agentNames[selectedAgent]}</strong><p style="color:#94a3b8; font-style:italic;">Thinking...</p></div>`;
      if (agentChatThread) { agentChatThread.appendChild(w); agentChatThread.scrollTop = agentChatThread.scrollHeight; }
      const ans = await handlePrompt(t); if (w.querySelector('p')) { w.querySelector('p').style.color = ''; w.querySelector('p').style.fontStyle = ''; w.querySelector('p').textContent = ans; } if (agentChatThread) agentChatThread.scrollTop = agentChatThread.scrollHeight;
      agentThreads[selectedAgent].push({ role: 'assistant', content: ans });
    });
  }
  loadAgentStatus();
}
