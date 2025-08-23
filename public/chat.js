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

// Application state
let availableModels = {};
let currentModel = null;
let chatHistory = [
  {
    role: "assistant",
    content: "Hello, bozo! I'm C.H.E.T. (Chat Helper for (almost) Every Task), powered by Cloudflare Workers AI. Choose a model from the sidebar and let's tackle any task together!",
  },
];
let isProcessing = false;
let savedPrompts = [];
let mcpServers = [];
let editingPrompt = null;
let editingMCP = null;

// Initialize the application
async function initialize() {
  await loadModels();
  await loadPrompts();
  await loadMCPServers();
  setupEventListeners();
  updateParameterDisplays();
  createToastContainer();
  setupAccordionSections();
}

// Setup accordion sections
function setupAccordionSections() {
  const sectionToggles = document.querySelectorAll('.section-toggle');
  
  // Make all sections expanded by default
  document.querySelectorAll('.sidebar-section').forEach(section => {
    section.style.maxHeight = section.scrollHeight + 'px';
  });
  
  sectionToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      
      if (!targetSection) return;
      
      const isCollapsed = targetSection.classList.contains('collapsed');
      
      // Toggle the section
      if (isCollapsed) {
        // Expand
        toggle.classList.remove('collapsed');
        targetSection.classList.remove('collapsed');
        targetSection.style.maxHeight = targetSection.scrollHeight + 'px';
        showToast(`Expanded ${toggle.textContent} section`, "info", 1000);
      } else {
        // Collapse
        toggle.classList.add('collapsed');
        targetSection.classList.add('collapsed');
        targetSection.style.maxHeight = '0';
        showToast(`Collapsed ${toggle.textContent} section`, "info", 1000);
      }
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
    
    // Clear existing options
    modelSelect.innerHTML = "";
    
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
    modelSelect.innerHTML = '<option value="">❌ Failed to load models</option>';
    modelInfo.innerHTML = `<strong style="color: #FF6B6B;">❌ Error loading models:</strong><br>${error.message}<br><small>Check console for details.</small>`;
    showToast("Failed to load models! Check your internet connection.", "error", 5000);
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
  modelInfo.style.background = "linear-gradient(135deg, #90EE90 0%, #98FB98 100%)";
  modelInfo.innerHTML = `
    <strong>✅ ${model.name} (Active)</strong><br>
    ${specialization ? specialization + '<br>' : ''}
    ${model.description}<br>
    <small>
      <strong>Context Window:</strong> ${model.contextWindow.toLocaleString()} tokens<br>
      <strong>Max Output:</strong> ${model.maxTokensMax.toLocaleString()} tokens<br>
      ${capabilities.length > 0 ? `<strong>Capabilities:</strong> ${capabilities.join(', ')}<br>` : ''}
      <strong>Best for:</strong> ${getModelUseCases(modelKey)}
    </small>
  `;
  
  // Reset background color after 2 seconds
  setTimeout(() => {
    modelInfo.style.background = "linear-gradient(135deg, var(--assistant-msg-bg) 0%, #e8d5e8 100%)";
  }, 2000);
  
  // Update current model indicator
  currentModelDisplay.textContent = `Model: ${model.name}`;
  currentModelDisplay.style.background = "linear-gradient(135deg, #32CD32 0%, var(--accent-color) 100%)";
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
    valueEl.style.color = "#32CD32";
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
    model: modelSelect.value,
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

    // Create new assistant response element
    const assistantMessageEl = document.createElement("div");
    assistantMessageEl.className = "message assistant-message";
    assistantMessageEl.innerHTML = "<p></p>";
    chatMessages.appendChild(assistantMessageEl);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

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

    // Handle errors
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to get response`);
    }

    // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });

        // Process SSE format
        const lines = chunk.split("\n");
        for (const line of lines) {
          try {
            const jsonData = JSON.parse(line);
            if (jsonData.response) {
              // Append new content to existing text
              responseText += jsonData.response;
              
              // Replace the response with one that addresses the user as "bozo"
              let displayText = responseText;
              
              // Check if we're at the beginning of a response to add "bozo" greeting
              if (displayText.length < 100 && !displayText.includes("bozo")) {
                // Add "bozo" to the start of the response if appropriate
                if (displayText.includes("Hello") || displayText.includes("Hi ")) {
                  displayText = displayText.replace(/(Hello|Hi)([!,.\s])/i, "$1, bozo$2");
                } else {
                  // Try to find the first sentence and add bozo there
                  const firstSentenceEnd = displayText.search(/[.!?]/);
                  if (firstSentenceEnd > 0 && firstSentenceEnd < 50) {
                    displayText = displayText.slice(0, firstSentenceEnd) + ", bozo" + displayText.slice(firstSentenceEnd);
                  } else {
                    displayText = "Hey bozo! " + displayText;
                  }
                }
              }
              
              // Ensure "bozo" appears at least once in longer responses
              if (displayText.length > 100 && !displayText.toLowerCase().includes("bozo")) {
                displayText = displayText.replace(/\. ([A-Z])/g, ". Listen bozo, $1");
              }
              
              assistantMessageEl.querySelector("p").textContent = displayText;

              // Scroll to bottom
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          } catch (e) {
            // Ignore JSON parse errors for incomplete chunks
          }
        }
      }    // Add completed response to chat history
    if (responseText) {
      // We need to modify what gets stored in the chat history as well
      let bozoResponseText = responseText;
      
      // Make sure "bozo" appears in the stored response too
      if (!bozoResponseText.toLowerCase().includes("bozo")) {
        if (bozoResponseText.includes("Hello") || bozoResponseText.includes("Hi ")) {
          bozoResponseText = bozoResponseText.replace(/(Hello|Hi)([!,.\s])/i, "$1, bozo$2");
        } else {
          // Try to find a good place to insert "bozo"
          const firstSentenceEnd = bozoResponseText.search(/[.!?]/);
          if (firstSentenceEnd > 0 && firstSentenceEnd < 50) {
            bozoResponseText = bozoResponseText.slice(0, firstSentenceEnd) + ", bozo" + bozoResponseText.slice(firstSentenceEnd);
          } else {
            bozoResponseText = "Hey bozo! " + bozoResponseText;
          }
        }
      }
      
      chatHistory.push({ role: "assistant", content: bozoResponseText });
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
    messageEl.innerHTML = `
      <p>${content}</p>
      <button class="save-response-btn" onclick="saveResponse('${content.replace(/'/g, "\\'")}')">Save Response</button>
    `;
  } else {
    messageEl.innerHTML = `<p>${content}</p>`;
  }
  
  chatMessages.appendChild(messageEl);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Save response as file
function saveResponse(content) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `chat-response-${timestamp}.txt`;
  
  fetch('/api/save-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: filename,
      content: content,
      contentType: 'text/plain'
    })
  })
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  })
  .catch(error => {
    console.error('Error saving file:', error);
    alert('Failed to save file');
  });
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
  promptsList.innerHTML = '';
  
  if (savedPrompts.length === 0) {
    promptsList.innerHTML = '<div class="list-item">No saved prompts</div>';
    return;
  }
  
  savedPrompts.forEach(prompt => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div>
        <div class="list-item-title">${prompt.name}</div>
        <div style="font-size: 0.7rem; color: #666;">${prompt.tags?.join(', ') || ''}</div>
      </div>
      <div class="list-item-actions">
        <button class="list-item-btn use" onclick="usePrompt('${prompt.id}')">Use</button>
        <button class="list-item-btn" onclick="editPrompt('${prompt.id}')">Edit</button>
        <button class="list-item-btn delete" onclick="deletePrompt('${prompt.id}')">Delete</button>
      </div>
    `;
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
  mcpList.innerHTML = '';
  
  if (mcpServers.length === 0) {
    mcpList.innerHTML = '<div class="list-item">No MCP servers configured</div>';
    return;
  }
  
  mcpServers.forEach(server => {
    const item = document.createElement('div');
    item.className = 'list-item';
    const status = server.enabled ? '🟢' : '🔴';
    item.innerHTML = `
      <div>
        <div class="list-item-title">${status} ${server.name}</div>
        <div style="font-size: 0.7rem; color: #666;">${server.description || ''}</div>
      </div>
      <div class="list-item-actions">
        <button class="list-item-btn" onclick="editMCPServer('${server.id}')">${server.enabled ? 'Disable' : 'Enable'}</button>
        <button class="list-item-btn" onclick="editMCPServer('${server.id}')">Edit</button>
        <button class="list-item-btn delete" onclick="deleteMCPServer('${server.id}')">Delete</button>
      </div>
    `;
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

// Toast notification system
function createToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  const colors = {
    success: '#32CD32',
    error: '#FF6B6B',
    warning: '#FFD93D',
    info: '#4ECDC4'
  };
  
  toast.style.cssText = `
    background: ${colors[type] || colors.info};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    font-weight: 500;
    font-size: 14px;
    pointer-events: auto;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  `;
  
  toast.textContent = message;
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}
