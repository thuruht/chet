/**
 * LLM Chat App Frontend
 *
 * Handles the chat UI interactions and communication with the backend API.
 * Now includes model selection and parameter controls.
 */

// DOM elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
const modelSelect = document.getElementById("model-select");
const modelInfo = document.getElementById("model-info");
const currentModelDisplay = document.getElementById("current-model");
const themeSelect = document.getElementById("theme-select");
const themeToggle = document.getElementById('theme-toggle');

// Parameter controls
const maxTokensSlider = document.getElementById("max-tokens");
const maxTokensValue = document.getElementById("max-tokens-value");
const temperatureSlider = document.getElementById("temperature");
const temperatureValue = document.getElementById("temperature-value");
const topPSlider = document.getElementById("top-p");
const topPValue = document.getElementById("top-p-value");
const topKSlider = document.getElementById("top-k");
const topKValue = document.getElementById("top-k-value");
const repetitionPenaltySlider = document.getElementById("repetition-penalty");
const repetitionPenaltyValue = document.getElementById("repetition-penalty-value");
const frequencyPenaltySlider = document.getElementById("frequency-penalty");
const frequencyPenaltyValue = document.getElementById("frequency-penalty-value");
const presencePenaltySlider = document.getElementById("presence-penalty");
const presencePenaltyValue = document.getElementById("presence-penalty-value");
const seedInput = document.getElementById("seed");

// New elements for prompts and MCP
const addPromptBtn = document.getElementById("add-prompt-btn");
const promptsList = document.getElementById("prompts-list");
const addMCPBtn = document.getElementById("add-mcp-btn");
const mcpList = document.getElementById("mcp-list");

// Modal elements
const promptModal = document.getElementById("prompt-modal");
const mcpModal = document.getElementById("mcp-modal");
const promptModalTitle = document.getElementById("prompt-modal-title");
const mcpModalTitle = document.getElementById("mcp-modal-title");

// Prompt modal inputs
const promptNameInput = document.getElementById("prompt-name");
const promptContentInput = document.getElementById("prompt-content");
const promptTagsInput = document.getElementById("prompt-tags");
const cancelPromptBtn = document.getElementById("cancel-prompt");
const savePromptBtn = document.getElementById("save-prompt");

// MCP modal inputs
const mcpNameInput = document.getElementById("mcp-name");
const mcpCommandInput = document.getElementById("mcp-command");
const mcpCwdInput = document.getElementById("mcp-cwd");
const mcpEnvInput = document.getElementById("mcp-env");
const mcpArgsInput = document.getElementById("mcp-args");
const mcpDescriptionInput = document.getElementById("mcp-description");
const mcpEnabledInput = document.getElementById("mcp-enabled");
const cancelMCPBtn = document.getElementById("cancel-mcp");
const saveMCPBtn = document.getElementById("save-mcp");

// Inspector and developer controls (ensure fallbacks)
const openInspectorBtn = document.getElementById('open-inspector-btn');
const inspector = document.getElementById('request-inspector');
const inspectorRequest = document.getElementById('inspector-request');
const inspectorResponse = document.getElementById('inspector-response');
const personaCheckbox = document.getElementById('persona-enabled');

// Create or locate inspector control wrapper and copy buttons to avoid runtime ReferenceErrors
let inspectorControlsWrap = document.getElementById('inspector-controls-wrap');
if (!inspectorControlsWrap) {
  inspectorControlsWrap = document.createElement('div');
  inspectorControlsWrap.id = 'inspector-controls-wrap';
  inspectorControlsWrap.className = 'inspector-controls';
}

let copyReqBtn = document.getElementById('inspector-copy-req');
if (!copyReqBtn) {
  copyReqBtn = document.createElement('button');
  copyReqBtn.id = 'inspector-copy-req';
  copyReqBtn.className = 'inspector-btn';
  copyReqBtn.textContent = 'Copy Request';
}

let copyResBtn = document.getElementById('inspector-copy-res');
if (!copyResBtn) {
  copyResBtn = document.createElement('button');
  copyResBtn.id = 'inspector-copy-res';
  copyResBtn.className = 'inspector-btn';
  copyResBtn.textContent = 'Copy Response Meta';
}

// Application state
    while (modelSelect.firstChild) modelSelect.removeChild(modelSelect.firstChild);
let currentModel = null;
let chatHistory = [
  {
    role: "assistant",
    content: "Hello! I'm C.H.E.T. (Chat Helper for (almost) Every Task), powered by Cloudflare Workers AI. Choose a model from the sidebar and let's tackle any task together!",
  },
];
let isProcessing = false;
let savedPrompts = [];
let mcpServers = [];
let editingPrompt = null;
let editingMCP = null;
// Keep latest server meta globally for modal viewing
let lastServerMeta = null;

// Initialize the application
async function initialize() {
  try {
    await loadModels();
    await loadPrompts();
    await loadMCPServers();
    setupEventListeners();
    updateParameterDisplays();
  } catch (err) {
    // Centralized error handling to avoid referencing an undefined 'error'
    console.error('Initialization error:', err);
    // Clear select safely and add a single error option
    while (modelSelect.firstChild) modelSelect.removeChild(modelSelect.firstChild);
    const errOpt = document.createElement('option');
    errOpt.value = '';
    errOpt.textContent = '❌ Failed to load models';
    modelSelect.appendChild(errOpt);

    // Build modelInfo content safely
    while (modelInfo.firstChild) modelInfo.removeChild(modelInfo.firstChild);
    const errStrong = document.createElement('strong');
    errStrong.style.color = '#FF6B6B';
    errStrong.textContent = '❌ Initialization error:';
    modelInfo.appendChild(errStrong);
    modelInfo.appendChild(document.createElement('br'));
    const msg = document.createElement('div');
    msg.textContent = err.message || String(err);
    modelInfo.appendChild(msg);
    const small = document.createElement('small');
    small.textContent = 'Check console for details.';
    modelInfo.appendChild(small);
    if (typeof showToast === 'function') showToast('Initialization failed — check console', 'error', 5000);
  }
  copyResBtn.textContent = 'Copy Response Meta';
  inspectorControlsWrap.appendChild(copyReqBtn);
  inspectorControlsWrap.appendChild(copyResBtn);
  inspector.insertBefore(inspectorControlsWrap, inspector.firstChild);

  // Persist inspector open/closed state
  try {
    const saved = localStorage.getItem('chet_inspector_visible');
    if (saved === 'true') {
      inspector.style.display = 'block';
      openInspectorBtn.textContent = 'Hide Request Inspector';
    }
  } catch (e) {}

  // Load saved persona preference
  try {
    const saved = localStorage.getItem('chet_persona_enabled');
    if (saved !== null) personaCheckbox.checked = saved === 'true';
  } catch (e) {}

  personaCheckbox.addEventListener('change', () => {
    try { localStorage.setItem('chet_persona_enabled', personaCheckbox.checked ? 'true' : 'false'); } catch (e) {}
    showToast(personaCheckbox.checked ? 'Playful persona enabled' : 'Playful persona disabled','info',1200);
  });

  openInspectorBtn.addEventListener('click', () => {
    const visible = inspector.style.display !== 'none';
    const next = visible ? 'none' : 'block';
    inspector.style.display = next;
    openInspectorBtn.textContent = visible ? 'Open Request Inspector' : 'Hide Request Inspector';
    try { localStorage.setItem('chet_inspector_visible', (!visible).toString()); } catch (e) {}
  });

  // Helper to populate inspector from send/end
  window.__chetInspector = {
    setRequest: (payload) => {
      try { inspectorRequest.textContent = JSON.stringify(payload, null, 2); } catch (e) { inspectorRequest.textContent = String(payload); }
    },
    setResponseMeta: (meta) => {
      try { inspectorResponse.textContent = JSON.stringify(meta, null, 2); } catch (e) { inspectorResponse.textContent = String(meta); }
    }
  };

  // Copy handlers
  copyReqBtn.addEventListener('click', () => {
    try {
      navigator.clipboard.writeText(inspectorRequest.textContent || '').then(() => showToast('Request copied to clipboard', 'success', 1400));
    } catch (e) { showToast('Copy failed', 'error', 1400); }
  });
  copyResBtn.addEventListener('click', () => {
    try {
      navigator.clipboard.writeText(inspectorResponse.textContent || '').then(() => showToast('Response meta copied', 'success', 1400));
    } catch (e) { showToast('Copy failed', 'error', 1400); }
  });
}

// Theme setup and persistence
function setupTheme() {
  if (!themeSelect) return;

  const STORAGE_KEY = 'chet_theme';

  // Apply a theme class to the document body
  const applyTheme = (className) => {
    // Remove any known theme- classes first
    Array.from(document.body.classList).forEach(c => {
      if (c.startsWith('theme-')) document.body.classList.remove(c);
    });
    if (className) document.body.classList.add(className);
  };

  // Load saved theme
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // If body already has a theme- class (from server/default), prefer that
    const bodyTheme = Array.from(document.body.classList).find(c => c && c.startsWith('theme-'));
    if (bodyTheme) {
      applyTheme(bodyTheme);
      try { themeSelect.value = bodyTheme; } catch (e) {}
    } else if (saved) {
      applyTheme(saved);
      try { themeSelect.value = saved; } catch (e) {}
    } else {
      // final fallback: C.H.E.T. theme
      applyTheme('theme-chet');
      try { themeSelect.value = 'theme-chet'; } catch (e) {}
    }
  } catch (e) {}

  // Listen for changes
  themeSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    applyTheme(val);
    try { localStorage.setItem(STORAGE_KEY, val); } catch (err) {}
    showToast(`Theme set to ${themeSelect.options[themeSelect.selectedIndex].text}`, 'success', 1000);
  });

  // Keep the select visible after click by toggling an 'expanded' class on the container
  try {
    const container = themeSelect.closest('.theme-select-container');
    if (container) {
      themeSelect.addEventListener('focus', () => container.classList.add('expanded'));
      themeSelect.addEventListener('blur', () => setTimeout(() => container.classList.remove('expanded'), 150));

      // Clicking the toggle should also add the expanded class briefly so user can choose
      if (themeToggle) {
        themeToggle.addEventListener('click', (ev) => {
          container.classList.add('expanded');
          // If select has options, focus it so keyboard users can navigate
          try { themeSelect.focus(); } catch (e) {}
          // Remove expanded after a short time if user doesn't interact
          setTimeout(() => { if (document.activeElement !== themeSelect) container.classList.remove('expanded'); }, 2000);
        });
      }
    }
  } catch (e) {}

  // Light/Dark toggle: map of light <-> dark counterparts
  const toggleMap = {
    'theme-solarized-light': 'theme-solarized-dark',
    'theme-solarized-dark': 'theme-solarized-light',
    'theme-github-light': 'theme-github-dark',
    'theme-github-dark': 'theme-github-light',
    'theme-material-blue': 'theme-material-dark',
    'theme-material-dark': 'theme-material-blue',
    // leave others mapping to a sensible dark variant
    'theme-discord': 'theme-discord',
    'theme-monokai': 'theme-monokai',
    'theme-dracula': 'theme-dracula',
    'theme-nord': 'theme-nord',
    'theme-tokyo-night': 'theme-tokyo-night',
    'theme-cyberpunk': 'theme-cyberpunk'
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = Array.from(document.body.classList).find(c => c.startsWith('theme-')) || themeSelect.value;
      const next = toggleMap[current] || current;
      // Update select if option exists
      try {
        const optionExists = Array.from(themeSelect.options).some(o => o.value === next);
        if (optionExists) themeSelect.value = next;
      } catch (e) {}
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (err) {}
      showToast('Toggled theme', 'info', 800);
    });
  }

  // Keyboard shortcut: Ctrl/Cmd+T toggles theme (unobtrusive)
  window.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const metaKey = isMac ? e.metaKey : e.ctrlKey;
    if (metaKey && e.key.toLowerCase() === 't') {
      // prevent browser tab switch in some environments
      e.preventDefault();
      if (themeToggle) themeToggle.click();
    }
  });
}

// Server meta modal wiring
function setupServerMetaModal() {
  const modelAlert = document.getElementById('model-alert');
  const modal = document.getElementById('server-meta-modal');
  const metaPre = document.getElementById('server-meta-json');
  const copyBtn = document.getElementById('server-meta-copy');
  const closeBtn = document.getElementById('server-meta-close');

  modelAlert.addEventListener('click', () => {
    if (!lastServerMeta) return;
    try { metaPre.textContent = JSON.stringify(lastServerMeta, null, 2); } catch (e) { metaPre.textContent = String(lastServerMeta); }
    modal.style.display = 'block';
  });

  copyBtn.addEventListener('click', () => {
    try { navigator.clipboard.writeText(metaPre.textContent || ''); showToast('Server meta copied', 'success', 1200); } catch (e) { showToast('Copy failed', 'error', 1200); }
  });

  closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });

  // Close when clicking outside modal
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
}

function setupAccordionSections() {
  const STORAGE_KEY = 'chet_sidebar_state';
  const sectionToggles = document.querySelectorAll('.section-toggle');

  // Read saved state from localStorage (map of id -> boolean expanded)
  let savedState = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) savedState = JSON.parse(raw) || {};
  } catch (e) {
    // ignore parse errors
    savedState = {};
  }

  // Collapse all sections by default, then restore saved state where present
  document.querySelectorAll('.sidebar-section').forEach(section => {
    const id = section.id;
    const shouldExpand = !!savedState[id];
    if (shouldExpand) {
      section.classList.remove('collapsed');
      section.style.maxHeight = section.scrollHeight + 'px';
      section.setAttribute('aria-hidden', 'false');
    } else {
      section.classList.add('collapsed');
      section.style.maxHeight = '0';
      section.setAttribute('aria-hidden', 'true');
    }
  });

  // Add indicators, ARIA attributes, and handlers
  sectionToggles.forEach(toggle => {
    const targetId = toggle.getAttribute('data-target');
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    // Make toggles keyboard accessible and announceable
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-controls', targetId);

    // Add indicator element if missing
    let indicator = toggle.querySelector('.toggle-indicator');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'toggle-indicator';
      indicator.style.marginLeft = '8px';
      toggle.appendChild(indicator);
    }

    // Initialize aria-expanded and indicator based on saved state
    const expanded = !targetSection.classList.contains('collapsed');
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    toggle.setAttribute('aria-label', `${toggle.textContent.trim()} toggle`);
    indicator.textContent = expanded ? '▼' : '▶';

    const saveState = (id, isExpanded) => {
      try {
        savedState[id] = !!isExpanded;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
      } catch (e) {
        // ignore quota errors
      }
    };

    const toggleHandler = (e) => {
      const isCollapsed = targetSection.classList.contains('collapsed');
      if (isCollapsed) {
        // Expand
        toggle.classList.remove('collapsed');
        toggle.setAttribute('aria-expanded', 'true');
        indicator.textContent = '▼';
        targetSection.classList.remove('collapsed');
        targetSection.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => {
          targetSection.style.maxHeight = targetSection.scrollHeight + 'px';
        });
        showToast(`Expanded ${toggle.textContent.trim()} section`, "info", 900);
        saveState(targetId, true);
      } else {
        // Collapse
        toggle.classList.add('collapsed');
        toggle.setAttribute('aria-expanded', 'false');
        indicator.textContent = '▶';
        targetSection.classList.add('collapsed');
        targetSection.setAttribute('aria-hidden', 'true');
        targetSection.style.maxHeight = '0';
        showToast(`Collapsed ${toggle.textContent.trim()} section`, "info", 900);
        saveState(targetId, false);
      }
    };

    // Click and keyboard handlers
    toggle.addEventListener('click', toggleHandler);
    toggle.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        toggleHandler();
      }
    });
  });

  // Update maxHeight when window resizes
  window.addEventListener('resize', () => {
    document.querySelectorAll('.sidebar-section:not(.collapsed)').forEach(section => {
      section.style.maxHeight = section.scrollHeight + 'px';
    });
  });
}


// Load available models from the API
async function loadModels() {
  try {
    showToast("Loading available models...", "info", 2000);

    const response = await fetch("/api/models");
    if (!response.ok) {
      throw new Error(`Failed to load models: ${response.status} ${response.statusText}`);
    }

    const models = await response.json();
    availableModels = {};

    // Clear existing options safely
    while (modelSelect.firstChild) modelSelect.removeChild(modelSelect.firstChild);

    // Add models to select and internal storage
    models.forEach((model) => {
      availableModels[model.key] = model;

      const option = document.createElement("option");
      option.value = model.key;
      option.textContent = model.name;
      modelSelect.appendChild(option);
    });

    // Set default model (first one)
    if (models.length > 0) {
      const defaultModelKey = models[0].key;
      modelSelect.value = defaultModelKey;
      selectModel(defaultModelKey);
      showToast(`Loaded ${models.length} models successfully!`, "success");
    } else {
      throw new Error("No models available");
    }
  } catch (error) {
    console.error("Error loading models:", error);
    // Clear select and add an error option safely
    while (modelSelect.firstChild) modelSelect.removeChild(modelSelect.firstChild);
    const errOption = document.createElement('option');
    errOption.value = '';
    errOption.textContent = '❌ Failed to load models';
    modelSelect.appendChild(errOption);

    // Build modelInfo content safely
    while (modelInfo.firstChild) modelInfo.removeChild(modelInfo.firstChild);
    const errStrong = document.createElement('strong');
    errStrong.style.color = '#FF6B6B';
    errStrong.textContent = '❌ Error loading models:';
    modelInfo.appendChild(errStrong);
    modelInfo.appendChild(document.createElement('br'));
    const msg = document.createElement('div');
    msg.textContent = error.message || String(error);
    modelInfo.appendChild(msg);
    const small = document.createElement('small');
    small.textContent = 'Check console for details.';
    modelInfo.appendChild(small);
    if (typeof showToast === 'function') showToast("Failed to load models! Check your internet connection.", "error", 5000);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Model selection
  modelSelect.addEventListener("change", (e) => {
    if (e.target.value) {
      selectModel(e.target.value);
    }
  });

  // Parameter sliders
  maxTokensSlider.addEventListener("input", () => {
    updateParameterDisplays();
    showToast(`Max tokens: ${maxTokensSlider.value}`, "info", 1500);
  });
  temperatureSlider.addEventListener("input", () => {
    updateParameterDisplays();
    showToast(`Temperature: ${parseFloat(temperatureSlider.value).toFixed(1)}`, "info", 1500);
  });
  topPSlider.addEventListener("input", () => {
    updateParameterDisplays();
    showToast(`Top P: ${parseFloat(topPSlider.value).toFixed(2)}`, "info", 1500);
  });
  topKSlider.addEventListener("input", () => {
    updateParameterDisplays();
    showToast(`Top K: ${topKSlider.value}`, "info", 1500);
  });
  repetitionPenaltySlider.addEventListener("input", () => {
    updateParameterDisplays();
    showToast(`Repetition penalty: ${parseFloat(repetitionPenaltySlider.value).toFixed(1)}`, "info", 1500);
  });
  frequencyPenaltySlider.addEventListener("input", () => {
    updateParameterDisplays();
    showToast(`Frequency penalty: ${parseFloat(frequencyPenaltySlider.value).toFixed(1)}`, "info", 1500);
  });
  presencePenaltySlider.addEventListener("input", () => {
    updateParameterDisplays();
    showToast(`Presence penalty: ${parseFloat(presencePenaltySlider.value).toFixed(1)}`, "info", 1500);
  });

  // Chat input
  userInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });

  userInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendButton.addEventListener("click", sendMessage);

  // New event listeners for prompts and MCP
  addPromptBtn.addEventListener("click", () => openPromptModal());
  addMCPBtn.addEventListener("click", () => openMCPModal());
  
  // Modal event listeners
  cancelPromptBtn.addEventListener("click", closePromptModal);
  savePromptBtn.addEventListener("click", savePrompt);
  cancelMCPBtn.addEventListener("click", closeMCPModal);
  saveMCPBtn.addEventListener("click", saveMCPServer);
  
  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === promptModal) closePromptModal();
    if (e.target === mcpModal) closeMCPModal();
  });
  
  // Accordion functionality
  document.querySelectorAll('.sidebar-section').forEach(section => {
    section.addEventListener('transitionend', function() {
      // Update max-height when content changes
      if (!this.classList.contains('collapsed')) {
        this.style.maxHeight = this.scrollHeight + 'px';
      }
    });
  });
}

// Select a model and update UI
function selectModel(modelKey) {
  const model = availableModels[modelKey];
  if (!model) return;
  
  console.log(`Switching to model: ${model.name}`);
  currentModel = model;
  
  // Create detailed model description
  let capabilities = [];
  if (model.supportsTools) capabilities.push("Function Calling");
  if (model.supportsJsonMode) capabilities.push("JSON Mode");
  
  let specialization = "";
  if (modelKey.includes("coder")) {
    specialization = "🔧 Coding & Programming Specialist";
  } else if (modelKey.includes("hermes")) {
    specialization = "⚡ Function Calling Expert";
  } else if (modelKey.includes("llama")) {
    specialization = "🧠 General Purpose Powerhouse";
  }
  
  // Update model info display with visual feedback
  modelInfo.style.background = "linear-gradient(135deg, #B3E5FC 0%, #E1F5FE 100%)";
  // Build the model info content using DOM methods (avoid innerHTML)
  while (modelInfo.firstChild) modelInfo.removeChild(modelInfo.firstChild);
  const strong = document.createElement('strong');
  strong.textContent = `✅ ${model.name} (Active)`;
  modelInfo.appendChild(strong);
  modelInfo.appendChild(document.createElement('br'));
  if (specialization) {
    const spec = document.createElement('div');
    spec.textContent = specialization;
    modelInfo.appendChild(spec);
  }
  const desc = document.createElement('div');
  desc.textContent = model.description;
  modelInfo.appendChild(desc);
  const small = document.createElement('small');
  const ctxStrong = document.createElement('strong');
  ctxStrong.textContent = 'Context Window:';
  small.appendChild(ctxStrong);
  small.appendChild(document.createTextNode(' ' + (model.contextWindow?.toLocaleString() ?? '-') + ' tokens'));
  small.appendChild(document.createElement('br'));
  const maxStrong = document.createElement('strong');
  maxStrong.textContent = 'Max Output:';
  small.appendChild(maxStrong);
  small.appendChild(document.createTextNode(' ' + (model.maxTokensMax?.toLocaleString() ?? '-') + ' tokens'));
  if (capabilities.length > 0) {
    small.appendChild(document.createElement('br'));
    const capStrong = document.createElement('strong');
    capStrong.textContent = 'Capabilities:';
    small.appendChild(capStrong);
    small.appendChild(document.createTextNode(' ' + capabilities.join(', ')));
  }
  small.appendChild(document.createElement('br'));
  const bestFor = document.createElement('strong');
  bestFor.textContent = 'Best for:';
  small.appendChild(bestFor);
  small.appendChild(document.createTextNode(' ' + getModelUseCases(modelKey)));
  modelInfo.appendChild(small);
  
  // Reset background color after 2 seconds
  setTimeout(() => {
    modelInfo.style.background = "linear-gradient(135deg, var(--assistant-msg-bg) 0%, #E1F5FE 100%)";
  }, 2000);
  
  // Update current model indicator
  currentModelDisplay.textContent = `Model: ${model.name}`;
  currentModelDisplay.style.background = "linear-gradient(135deg, #00BCD4 0%, var(--accent-color) 100%)";
  setTimeout(() => {
    currentModelDisplay.style.background = "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)";
  }, 2000);
  
  // Update parameter ranges and defaults
  updateParameterRanges(model);
  updateParameterDisplays();
  
  // Show toast notification
  showToast(`Switched to ${model.name}`, "success");
}

// Get use cases for each model
function getModelUseCases(modelKey) {
  switch (modelKey) {
    case "qwen2.5-coder-32b":
      return "Code generation, debugging, technical explanations, algorithm design";
    case "deepseek-coder-6.7b":
      return "Code completion, syntax help, programming tutorials, code review";
    case "hermes-2-pro-7b":
      return "Function calling, structured data, API interactions, tool usage";
    case "llama-3.3-70b":
    default:
      return "General conversation, analysis, creative writing, complex reasoning";
  }
}

// Update parameter slider ranges based on selected model
function updateParameterRanges(model) {
  const modelKey = modelSelect.value;
  
  // Max tokens
  maxTokensSlider.min = 64;
  maxTokensSlider.max = model.maxTokensMax;
  maxTokensSlider.value = model.maxTokensDefault;
  
  // Temperature
  temperatureSlider.min = model.temperatureMin;
  temperatureSlider.max = model.temperatureMax;
  temperatureSlider.value = model.temperatureDefault;
  
  // Top P
  topPSlider.min = model.topPMin;
  topPSlider.max = model.topPMax;
  topPSlider.value = model.topPDefault;
  
  // Top K
  topKSlider.min = model.topKMin;
  topKSlider.max = model.topKMax;
  topKSlider.value = model.topKDefault;
  
  // Repetition penalty (standard range for all models)
  repetitionPenaltySlider.value = 1.1;
  
  // Frequency penalty (ranges vary by model)
  frequencyPenaltySlider.min = modelKey.includes("deepseek") || modelKey.includes("hermes") ? -2 : 0;
  frequencyPenaltySlider.max = 2;
  frequencyPenaltySlider.value = 0;
  
  // Presence penalty (ranges vary by model)  
  presencePenaltySlider.min = modelKey.includes("deepseek") || modelKey.includes("hermes") ? -2 : 0;
  presencePenaltySlider.max = 2;
  presencePenaltySlider.value = 0;
  
  // Clear seed input
  seedInput.value = "";
}

// Update parameter display values
function updateParameterDisplays() {
  const maxTokens = maxTokensSlider.value;
  const temperature = parseFloat(temperatureSlider.value).toFixed(1);
  const topP = parseFloat(topPSlider.value).toFixed(2);
  const topK = topKSlider.value;
  const repetitionPenalty = parseFloat(repetitionPenaltySlider.value).toFixed(1);
  const frequencyPenalty = parseFloat(frequencyPenaltySlider.value).toFixed(1);
  const presencePenalty = parseFloat(presencePenaltySlider.value).toFixed(1);

  // Update display values with visual feedback
  maxTokensValue.textContent = maxTokens;
  temperatureValue.textContent = temperature;
  topPValue.textContent = topP;
  topKValue.textContent = topK;
  repetitionPenaltyValue.textContent = repetitionPenalty;
  frequencyPenaltyValue.textContent = frequencyPenalty;
  presencePenaltyValue.textContent = presencePenalty;

  // Add visual feedback for changes
  const values = [maxTokensValue, temperatureValue, topPValue, topKValue, repetitionPenaltyValue, frequencyPenaltyValue, presencePenaltyValue];
  values.forEach(valueEl => {
    valueEl.style.color = "#3F51B5";
    valueEl.style.fontWeight = "bold";
    setTimeout(() => {
      valueEl.style.color = "";
      valueEl.style.fontWeight = "";
    }, 1000);
  });
}

// Get current parameter values
function getCurrentParameters() {
  const params = {
    model: (currentModel && currentModel.key) ? currentModel.key : modelSelect.value,
    maxTokens: parseInt(maxTokensSlider.value),
    temperature: parseFloat(temperatureSlider.value),
    topP: parseFloat(topPSlider.value),
    topK: parseInt(topKSlider.value),
    repetitionPenalty: parseFloat(repetitionPenaltySlider.value),
    frequencyPenalty: parseFloat(frequencyPenaltySlider.value),
    presencePenalty: parseFloat(presencePenaltySlider.value),
  };

  // Add seed if specified
  if (seedInput.value && seedInput.value.trim() !== "") {
    params.seed = parseInt(seedInput.value);
  }

  return params;
}

/**
 * Sends a message to the chat API and processes the response
 */
async function sendMessage() {
  const message = userInput.value.trim();

  // Don't send empty messages or if no model selected
  if (message === "" || isProcessing || !currentModel) return;

  // Disable input while processing
  isProcessing = true;
  userInput.disabled = true;
  sendButton.disabled = true;

  // Add user message to chat
  addMessageToChat("user", message);

  // Clear input
  userInput.value = "";
  userInput.style.height = "auto";

  // Show typing indicator
  typingIndicator.classList.add("visible");

  // Add message to history
  chatHistory.push({ role: "user", content: message });

  try {
    // Get current parameters
    const parameters = getCurrentParameters();
    // Log what we're sending for better debugging
    console.log('Sending chat with parameters:', parameters, 'modelConfigId:', availableModels[parameters.model]?.id);

    // Send inspector payload for dev tools (if enabled)
    if (window.__chetInspector && typeof window.__chetInspector.setRequest === 'function') {
      try { window.__chetInspector.setRequest({ messages: chatHistory, ...parameters }); } catch (e) {}
    }

    // Create new assistant response element
    const assistantMessageEl = document.createElement("div");
    assistantMessageEl.className = "message assistant-message";

    // Create persona greeting area (if enabled we'll populate it later)
    const personaEl = document.createElement('div');
    personaEl.className = 'assistant-persona';
    assistantMessageEl.appendChild(personaEl);

    // Main content paragraph
    const contentP = document.createElement('p');
    contentP.textContent = '';
    assistantMessageEl.appendChild(contentP);

    // Add a small metadata area so the user can see which model and params were used
    const metaEl = document.createElement('div');
    metaEl.className = 'message-meta';
    metaEl.style.fontSize = '0.75rem';
    metaEl.style.color = '#666';
    metaEl.style.marginTop = '6px';
    metaEl.style.display = 'flex';
    metaEl.style.gap = '8px';
    metaEl.style.alignItems = 'center';
    assistantMessageEl.appendChild(metaEl);

    // Fill initial (client-side) meta badge so user sees immediate feedback
    try {
      metaEl.textContent = `Model: ${availableModels[parameters.model]?.name || parameters.model} • Temp: ${parameters.temperature} • MaxTokens: ${parameters.maxTokens}`;
    } catch (e) {}

    chatMessages.appendChild(assistantMessageEl);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Ensure a valid model key is present and available
    if (!parameters.model || !availableModels[parameters.model]) {
      // Try to pick a sensible fallback (first available model)
      const keys = Object.keys(availableModels || {});
      if (keys.length > 0) {
        const fallback = keys[0];
        console.warn(`Model "${parameters.model}" not available, falling back to ${fallback}`);
        parameters.model = fallback;
        try { showToast(`No valid model selected — falling back to ${availableModels[fallback].name}`, 'warning', 3500); } catch (e) {}
      } else {
        showToast('No models are available. Cannot send message.', 'error', 4000);
        throw new Error('No models available');
      }
    }

    // Send request to API with parameters
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: chatHistory,
        ...parameters,
      }),
    });

    // Handle errors and surface server-provided messages when possible
    if (!response.ok) {
      // Try to read JSON or text body for a helpful error
      let bodyText = '';
      try {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const j = await response.json().catch(() => null);
          bodyText = j && j.error ? j.error : JSON.stringify(j);
        } else {
          bodyText = await response.text().catch(() => '');
        }
      } catch (e) {
        bodyText = '';
      }
      console.error('Chat API error', response.status, bodyText);
      const message = bodyText ? `Server error: ${bodyText}` : `HTTP ${response.status}: Failed to get response`;
      throw new Error(message);
    }

    // Process streaming response robustly, handling JSON-per-line and a final meta line
    if (!response.body) {
      throw new Error('Response has no body to stream');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = "";
    let hadResponse = false;
    let sseBuffer = "";
    let serverMeta = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk
      const chunk = decoder.decode(value, { stream: true });
      sseBuffer += chunk;

      // Extract complete lines
      let newlineIndex;
      while ((newlineIndex = sseBuffer.indexOf('\n')) !== -1) {
        const line = sseBuffer.slice(0, newlineIndex).trim();
        sseBuffer = sseBuffer.slice(newlineIndex + 1);
        if (!line) continue;

        // Try to parse JSON line (our server sends JSON per-line)
        try {
          const jsonData = JSON.parse(line);
          if (jsonData.response) {
            responseText += jsonData.response;
            contentP.textContent = responseText;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            hadResponse = true;
          } else if (jsonData.meta) {
            // Authoritative server-side metadata arrived
            serverMeta = jsonData.meta;
            // Update the meta UI and inspector
            try {
              // Build meta with icon and timestamp
              // Clear metaEl safely
              while (metaEl.firstChild) metaEl.removeChild(metaEl.firstChild);
              const iconSpan = document.createElement('span');
              iconSpan.className = 'meta-icon';
              iconSpan.textContent = '🤖';
              metaEl.appendChild(iconSpan);

              const mainText = document.createElement('span');
              mainText.textContent = `Server: ${serverMeta.modelKey} (${serverMeta.modelId}) • MaxTokens: ${serverMeta.params?.maxTokens || '-'} • Temp: ${serverMeta.params?.temperature || '-'} `;
              metaEl.appendChild(mainText);

              const ts = document.createElement('span');
              ts.className = 'meta-ts';
              ts.textContent = new Date().toLocaleTimeString();
              metaEl.appendChild(ts);
            } catch (e) {}
            if (window.__chetInspector && typeof window.__chetInspector.setResponseMeta === 'function') {
              try { window.__chetInspector.setResponseMeta(serverMeta); } catch (e) {}
            }
          }
        } catch (e) {
          // If not JSON, try to detect embedded JSON (meta/response) and extract it.
          const trimmed = line.trim();
          // If the line starts with a JSON object, attempt to extract a trailing object
          if (trimmed.startsWith('{')) {
            // Find the first { and last } to attempt to parse a JSON substring
            const firstBrace = line.indexOf('{');
            const lastBrace = line.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              const maybeJson = line.slice(firstBrace, lastBrace + 1);
              try {
                const parsed = JSON.parse(maybeJson);
                if (parsed.response) {
                  responseText += parsed.response;
                  contentP.textContent = responseText;
                  chatMessages.scrollTop = chatMessages.scrollHeight;
                  hadResponse = true;
                } else if (parsed.meta) {
                  serverMeta = parsed.meta;
                  lastServerMeta = serverMeta;
                  // create concise meta UI and view button below (handled next loop)
                }
                continue; // skip adding raw JSON to text
              } catch (err) {
                // fall through to ignoring raw JSON
              }
            }
            // If likely JSON but couldn't parse, ignore it (don't dump into chat)
            continue;
          }

          // Otherwise treat as plain text
          responseText += line;
          contentP.textContent = responseText;
          chatMessages.scrollTop = chatMessages.scrollHeight;
          hadResponse = true;
        }
      }
    }

    // Add completed response to chat history (store original server text only)
    if (responseText) {
      chatHistory.push({ role: "assistant", content: responseText });
    }

    // Simple response validation: prefer server metadata, fallback to heuristic
    let validation = { status: 'unknown', reason: '' };
    if (serverMeta) {
      // If server reported a different model than requested, warn
      if (serverMeta.modelKey !== parameters.model) {
        validation.status = 'warning';
        validation.reason = `Server used ${serverMeta.modelKey} instead of requested ${parameters.model}`;
      } else if (!hadResponse || responseText.trim().length < 10) {
        validation.status = 'warning';
        validation.reason = 'Response was very short or empty. Might indicate a problem.';
      } else {
        validation.status = 'success';
        validation.reason = `Server produced ${responseText.length} chars`;
      }
    } else {
      if (!hadResponse || responseText.trim().length < 10) {
        validation.status = 'warning';
        validation.reason = 'Response was very short or empty. Might indicate a problem.';
      } else {
        validation.status = 'success';
        validation.reason = `Received ${responseText.length} chars`;
      }
      // update inspector with heuristic info as a fallback
      if (window.__chetInspector && typeof window.__chetInspector.setResponseMeta === 'function') {
        try { window.__chetInspector.setResponseMeta({ model: parameters.model, validation, length: responseText.length }); } catch (e) {}
      }
    }

    // Show a small status in the message meta
    const statusEl = document.createElement('span');
    statusEl.style.marginLeft = '8px';
    statusEl.style.fontWeight = '600';
    if (validation.status === 'success') {
      statusEl.style.color = 'var(--success-color)';
      statusEl.textContent = 'Success';
    } else {
      statusEl.style.color = 'var(--danger-color)';
      statusEl.textContent = 'Warning';
    }
    try { if (metaEl && metaEl.appendChild) metaEl.appendChild(statusEl); } catch (e) {}

    // If serverMeta shows a different model than requested, show a visible alert in header
    try {
      const modelAlert = document.getElementById('model-alert');
      if (serverMeta && serverMeta.modelKey && serverMeta.modelKey !== parameters.model) {
        modelAlert.style.display = 'inline-block';
        modelAlert.textContent = `Server used ${serverMeta.modelKey}`;
      } else if (modelAlert) {
        modelAlert.style.display = 'none';
        modelAlert.textContent = '';
      }
    } catch (e) {}

    // Persona / "bozo" opt-in: only change presentation layer, not server response or history
    let personaEnabled = false;
    try { personaEnabled = !!document.getElementById('persona-enabled')?.checked || localStorage.getItem('chet_persona_enabled') === 'true'; } catch (e) {}
    if (personaEnabled) {
      const greetingText = "Hey there — C.H.E.T. here, feeling a bit whimsical today. Here's what I think:\n\n";
      const greetingP = document.createElement('p');
      greetingP.className = 'persona-greeting';
      greetingP.style.fontStyle = 'italic';
      greetingP.style.opacity = '0.95';
      greetingP.style.margin = '0 0 6px 0';
      greetingP.textContent = greetingText;
      // Insert greeting before main content (visual only)
      personaEl.appendChild(greetingP);
    }
  } catch (error) {
    console.error("Error:", error);
    addMessageToChat(
      "assistant",
      `Sorry, there was an error processing your request: ${error.message}`,
    );
  } finally {
    // Hide typing indicator
    typingIndicator.classList.remove("visible");

    // Re-enable input
    isProcessing = false;
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

/**
 * Helper function to add message to chat
 */
function addMessageToChat(role, content) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}-message`;
  
  if (role === "assistant") {
    const p = document.createElement('p');
    p.textContent = content;
    messageEl.appendChild(p);

    const btn = document.createElement('button');
    btn.className = 'save-response-btn';
    btn.textContent = 'Save Response';
    btn.addEventListener('click', () => saveResponse(content));
    messageEl.appendChild(btn);
  } else {
    const p = document.createElement('p');
    p.textContent = content;
    messageEl.appendChild(p);
  }
  
  chatMessages.appendChild(messageEl);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Save response as file
function saveResponse(content) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `chat-response-${timestamp}.txt`;
  (async () => {
    try {
      const resp = await fetch('/api/save-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content, contentType: 'text/plain' })
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        console.error('Save-file failed', resp.status, txt);
        showToast('Failed to save file', 'error', 3000);
        return;
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Saved response to file', 'success', 2200);
    } catch (error) {
      console.error('Error saving file:', error);
      showToast('Failed to save file', 'error', 3000);
    }
  })();
}

// Load saved prompts
async function loadPrompts() {
  try {
    const response = await fetch('/api/prompts');
    if (response.ok) {
      const data = await response.json();
      savedPrompts = data.prompts || [];
      renderPrompts();
      if (savedPrompts.length > 0) {
        showToast(`Loaded ${savedPrompts.length} saved prompts`, "success", 2000);
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error loading prompts:', error);
    showToast("Failed to load saved prompts", "error", 3000);
  }
}

// Render prompts list
function renderPrompts() {
  // Clear prompts list safely
  while (promptsList.firstChild) promptsList.removeChild(promptsList.firstChild);
  
  if (savedPrompts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'list-item';
    empty.textContent = 'No saved prompts';
    promptsList.appendChild(empty);
    return;
  }
  
  savedPrompts.forEach(prompt => {
    const item = document.createElement('div');
    item.className = 'list-item';
    // ...existing code...
    const left = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'list-item-title';
    title.textContent = prompt.name;
    const tags = document.createElement('div');
    tags.style.cssText = 'font-size: 0.7rem; color: #666;';
    tags.textContent = prompt.tags?.join(', ') || '';
    left.appendChild(title);
    left.appendChild(tags);

    const actions = document.createElement('div');
    actions.className = 'list-item-actions';

    const useBtn = document.createElement('button');
    useBtn.className = 'list-item-btn use';
    useBtn.textContent = 'Use';
    useBtn.addEventListener('click', () => usePrompt(prompt.id));

    const editBtn = document.createElement('button');
    editBtn.className = 'list-item-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editPrompt(prompt.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'list-item-btn delete';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deletePrompt(prompt.id));

    actions.appendChild(useBtn);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    item.appendChild(left);
    item.appendChild(actions);
    promptsList.appendChild(item);
  });
}

// Use a saved prompt
function usePrompt(promptId) {
  const prompt = savedPrompts.find(p => p.id === promptId);
  if (prompt) {
    userInput.value = prompt.content;
    userInput.style.height = "auto";
    userInput.style.height = userInput.scrollHeight + "px";
    userInput.focus();
    showToast(`Using prompt: ${prompt.name}`, "success", 2000);
  }
}

// Edit a prompt
function editPrompt(promptId) {
  const prompt = savedPrompts.find(p => p.id === promptId);
  if (prompt) {
    editingPrompt = prompt;
    promptNameInput.value = prompt.name;
    promptContentInput.value = prompt.content;
    promptTagsInput.value = prompt.tags?.join(', ') || '';
    promptModalTitle.textContent = 'Edit Prompt';
    promptModal.style.display = 'block';
  }
}

// Delete a prompt
async function deletePrompt(promptId) {
  if (!confirm('Are you sure you want to delete this prompt?')) return;
  
  try {
    const response = await fetch(`/api/prompts?id=${promptId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await loadPrompts();
    } else {
      alert('Failed to delete prompt');
    }
  } catch (error) {
    console.error('Error deleting prompt:', error);
    alert('Failed to delete prompt');
  }
}

// Open prompt modal
function openPromptModal() {
  editingPrompt = null;
  promptNameInput.value = '';
  promptContentInput.value = '';
  promptTagsInput.value = '';
  promptModalTitle.textContent = 'Add Prompt';
  promptModal.style.display = 'block';
}

// Close prompt modal
function closePromptModal() {
  promptModal.style.display = 'none';
}

// Save prompt
async function savePrompt() {
  const name = promptNameInput.value.trim();
  const content = promptContentInput.value.trim();
  const tags = promptTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
  
  if (!name || !content) {
    showToast('Name and content are required', "error", 3000);
    return;
  }
  
  const promptData = {
    name,
    content,
    tags
  };
  
  try {
    let response;
    if (editingPrompt) {
      response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...promptData, id: editingPrompt.id })
      });
    } else {
      response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData)
      });
    }
    
    if (response.ok) {
      closePromptModal();
      await loadPrompts();
      showToast(editingPrompt ? 'Prompt updated successfully!' : 'Prompt saved successfully!', "success");
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save prompt');
    }
  } catch (error) {
    console.error('Error saving prompt:', error);
    showToast(`Failed to save prompt: ${error.message}`, "error", 4000);
  }
}

// Load MCP servers
async function loadMCPServers() {
  try {
    const response = await fetch('/api/mcp-servers');
    if (response.ok) {
      const data = await response.json();
      mcpServers = data.servers || [];
      renderMCPServers();
      if (mcpServers.length > 0) {
        showToast(`Loaded ${mcpServers.length} MCP servers`, "success", 2000);
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error loading MCP servers:', error);
    showToast("Failed to load MCP servers", "error", 3000);
  }
}

// Render MCP servers list
function renderMCPServers() {
  // Clear MCP list safely
  while (mcpList.firstChild) mcpList.removeChild(mcpList.firstChild);
  
  if (mcpServers.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'list-item';
    empty.textContent = 'No MCP servers configured';
    mcpList.appendChild(empty);
    return;
  }
  
  mcpServers.forEach(server => {
    const item = document.createElement('div');
    item.className = 'list-item';
    const status = server.enabled ? '🟢' : '🔴';
    const left = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'list-item-title';
    title.textContent = `${status} ${server.name}`;
    const desc = document.createElement('div');
    desc.style.cssText = 'font-size: 0.7rem; color: #666;';
    desc.textContent = server.description || '';
    left.appendChild(title);
    left.appendChild(desc);

    const actions = document.createElement('div');
    actions.className = 'list-item-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'list-item-btn';
    toggleBtn.textContent = server.enabled ? 'Disable' : 'Enable';
    toggleBtn.addEventListener('click', () => editMCPServer(server.id));

    const editBtn = document.createElement('button');
    editBtn.className = 'list-item-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editMCPServer(server.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'list-item-btn delete';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteMCPServer(server.id));

    actions.appendChild(toggleBtn);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    item.appendChild(left);
    item.appendChild(actions);
    mcpList.appendChild(item);
  });
}

// Edit MCP server
function editMCPServer(serverId) {
  const server = mcpServers.find(s => s.id === serverId);
  if (server) {
    editingMCP = server;
    mcpNameInput.value = server.name;
    mcpCommandInput.value = JSON.stringify(server.command);
    mcpCwdInput.value = server.cwd || '';
    mcpEnvInput.value = server.env ? JSON.stringify(server.env) : '';
    mcpArgsInput.value = server.args ? JSON.stringify(server.args) : '';
    mcpDescriptionInput.value = server.description || '';
    mcpEnabledInput.checked = server.enabled;
    mcpModalTitle.textContent = 'Edit MCP Server';
    mcpModal.style.display = 'block';
  }
}

// Delete MCP server
async function deleteMCPServer(serverId) {
  if (!confirm('Are you sure you want to delete this MCP server?')) return;
  
  try {
    const response = await fetch(`/api/mcp-servers?id=${serverId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await loadMCPServers();
    } else {
      alert('Failed to delete MCP server');
    }
  } catch (error) {
    console.error('Error deleting MCP server:', error);
    alert('Failed to delete MCP server');
  }
}

// Open MCP modal
function openMCPModal() {
  editingMCP = null;
  mcpNameInput.value = '';
  mcpCommandInput.value = '';
  mcpCwdInput.value = '';
  mcpEnvInput.value = '';
  mcpArgsInput.value = '';
  mcpDescriptionInput.value = '';
  mcpEnabledInput.checked = true;
  mcpModalTitle.textContent = 'Add MCP Server';
  mcpModal.style.display = 'block';
}

// Close MCP modal
function closeMCPModal() {
  mcpModal.style.display = 'none';
}

// Save MCP server
async function saveMCPServer() {
  const name = mcpNameInput.value.trim();
  const commandStr = mcpCommandInput.value.trim();
  const cwd = mcpCwdInput.value.trim();
  const envStr = mcpEnvInput.value.trim();
  const argsStr = mcpArgsInput.value.trim();
  const description = mcpDescriptionInput.value.trim();
  const enabled = mcpEnabledInput.checked;
  
  if (!name || !commandStr) {
    alert('Name and command are required');
    return;
  }
  
  try {
    const command = JSON.parse(commandStr);
    const env = envStr ? JSON.parse(envStr) : undefined;
    const args = argsStr ? JSON.parse(argsStr) : undefined;
    
    const serverData = {
      name,
      command,
      cwd: cwd || undefined,
      env,
      args,
      enabled,
      description: description || undefined
    };
    
    let response;
    if (editingMCP) {
      response = await fetch('/api/mcp-servers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...serverData, id: editingMCP.id })
      });
    } else {
      response = await fetch('/api/mcp-servers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverData)
      });
    }
    
    if (response.ok) {
      closeMCPModal();
      await loadMCPServers();
    } else {
      alert('Failed to save MCP server');
    }
  } catch (error) {
    console.error('Error saving MCP server:', error);
    alert('Failed to save MCP server (check JSON format)');
  }
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", initialize);

// Toast functions are provided by `public/js/ui-utils.js` and exposed globally as showToast/createToastContainer
