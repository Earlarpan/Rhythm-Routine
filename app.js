const chatThread = document.getElementById('chatThread'), promptForm = document.getElementById('promptForm'), promptInput = document.getElementById('promptInput'), navItems = document.querySelectorAll('.nav-item'), overviewView = document.getElementById('overviewView'), agentsView = document.getElementById('agentsView'), sectionView = document.getElementById('sectionView'), sectionEyebrow = document.getElementById('sectionEyebrow'), sectionHeading = document.getElementById('sectionHeading'), sectionDescription = document.getElementById('sectionDescription'), pageTitle = document.getElementById('pageTitle'), agentCards = document.querySelectorAll('.agent-card'), agentGallery = document.getElementById('agentGallery'), agentWorkspace = document.getElementById('agentWorkspace'), backToAgents = document.getElementById('backToAgents'), agentHeading = document.getElementById('agentHeading'), engineStatus = document.getElementById('engineStatus'), engineNotice = document.getElementById('engineNotice'), agentChatThread = document.getElementById('agentChatThread'), agentPromptForm = document.getElementById('agentPromptForm'), agentPromptInput = document.getElementById('agentPromptInput'), agentSendButton = document.getElementById('agentSendButton');
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
  agentCards.forEach(c => { const s = c.querySelector('.agent-card-status'); if (s) { s.textContent = 'Ready'; s.style.color = '#34d399'; } });
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
  navItems.forEach(i => i.classList.toggle('active', i.dataset.view === av));
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

function initDashboardCore() {
  navItems.forEach(b => b.addEventListener('click', () => showView(b.getAttribute('data-view'))));
  agentCards.forEach(c => c.addEventListener('click', () => openAgent(c.getAttribute('data-agent'))));
  if (backToAgents) backToAgents.addEventListener('click', () => { if (agentGallery) agentGallery.hidden = false; if (agentWorkspace) agentWorkspace.hidden = true; loadAgentStatus(); });
  
  if (promptForm && promptInput) {
    promptForm.addEventListener('submit', async (e) => {
      e.preventDefault(); const t = promptInput.value.trim(); if (!t) return; promptInput.value = ''; createMessage('user', 'You', t);
      const w = document.createElement('div'); w.className = 'message agent'; w.innerHTML = `<div class="avatar">AI</div><div class="bubble"><strong>Torien</strong><p style="color:#94a3b8; font-style:italic;">Thinking...</p></div>`;
      chatThread.appendChild(w); chatThread.scrollTop = chatThread.scrollHeight;
      const ans = await handlePrompt(t); w.querySelector('p').style.color = ''; w.querySelector('p').style.fontStyle = ''; w.querySelector('p').textContent = ans; chatThread.scrollTop = chatThread.scrollHeight;
    });
  }
  
  if (agentPromptForm && agentPromptInput) {
    agentPromptForm.addEventListener('submit', async (e) => {
      e.preventDefault(); const t = agentPromptInput.value.trim(); if (!t) return; agentPromptInput.value = ''; createAgentMessage('user', t);
      if (!agentThreads[selectedAgent]) agentThreads[selectedAgent] = []; agentThreads[selectedAgent].push({ role: 'user', content: t });
      const w = document.createElement('div'); w.className = 'message agent'; w.innerHTML = `<div class="avatar">T</div><div class="bubble"><strong>${agentNames[selectedAgent]}</strong><p style="color:#94a3b8; font-style:italic;">Thinking...</p></div>`;
      agentChatThread.appendChild(w); agentChatThread.scrollTop = agentChatThread.scrollHeight;
      const ans = await handlePrompt(t); w.querySelector('p').style.color = ''; w.querySelector('p').style.fontStyle = ''; w.querySelector('p').textContent = ans; agentChatThread.scrollTop = agentChatThread.scrollHeight;
      agentThreads[selectedAgent].push({ role: 'assistant', content: ans });
    });
  }
  loadAgentStatus();
}

// Built-In Beautiful Dark Login Portal Injector (Bypasses all link blocks)
function buildEmbeddedLoginBox() {
  const target = document.getElementById('clerkAuthTarget');
  if (!target) return;
  
  target.innerHTML = `
    <div style="background: #111827; padding: 40px; border-radius: 16px; border: 1px solid #1f2937; width: 360px; text-align: center; font-family: 'Inter', sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      <div style="width: 50px; height: 50px; background: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; color: white; margin: 0 auto 16px;">T</div>
      <h2 style="color: white; margin-bottom: 8px; font-size: 22px; font-weight: 700;">Welcome to Torien</h2>
      <p style="color: #9ca3af; font-size: 14px; margin-bottom: 24px;">Sign in to access your Agent workspace</p>
      
      <div style="text-align: left; margin-bottom: 16px;">
        <label style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 6px; text-transform: uppercase; font-weight: 600;">Email Address</label>
        <input id="authEmail" type="email" value="admin@torien.ai" style="width: 100%; padding: 10px 14px; background: #1f2937; border: 1px solid #374151; border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box;" />
      </div>
      
      <div style="text-align: left; margin-bottom: 24px;">
        <label style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 6px; text-transform: uppercase; font-weight: 600;">Password</label>
        <input id="authPass" type="password" value="••••••••" style="width: 100%; padding: 10px 14px; background: #1f2937; border: 1px solid #374151; border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box;" />
      </div>
      
      <button id="loginSubmitBtn" style="width: 100%; padding: 12px; background: #3b82f6; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.2s;">Sign In</button>
    </div>
  `;

  document.getElementById('loginSubmitBtn').addEventListener('click', () => {
    // Smooth transition into dashboard layout on button tap
