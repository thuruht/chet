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

// Application state
let availableModels = {};
let currentModel = null;
let chatHistory = [
  {
    role: "assistant",
    content: "Hello! I'm an LLM chat app powered by Cloudflare Workers AI. Choose a model from the sidebar and start chatting!",
  },
];
let isProcessing = false;

// Initialize the application
async function initialize() {
  await loadModels();
  setupEventListeners();
  updateParameterDisplays();
}

// Load available models from the API
async function loadModels() {
  try {
    const response = await fetch("/api/models");
    if (!response.ok) {
      throw new Error("Failed to load models");
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
    }
    
  } catch (error) {
    console.error("Error loading models:", error);
    modelSelect.innerHTML = '<option value="">Failed to load models</option>';
    modelInfo.textContent = "Failed to load model information";
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
  maxTokensSlider.addEventListener("input", updateParameterDisplays);
  temperatureSlider.addEventListener("input", updateParameterDisplays);
  topPSlider.addEventListener("input", updateParameterDisplays);
  topKSlider.addEventListener("input", updateParameterDisplays);

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
}

// Select a model and update UI
function selectModel(modelKey) {
  const model = availableModels[modelKey];
  if (!model) return;
  
  currentModel = model;
  
  // Update model info display
  modelInfo.innerHTML = `
    <strong>${model.name}</strong><br>
    ${model.description}<br>
    <small>Context: ${model.contextWindow.toLocaleString()} tokens</small>
  `;
  
  // Update current model indicator
  currentModelDisplay.textContent = `Model: ${model.name}`;
  
  // Update parameter ranges and defaults
  updateParameterRanges(model);
  updateParameterDisplays();
}

// Update parameter slider ranges based on selected model
function updateParameterRanges(model) {
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
}

// Update parameter display values
function updateParameterDisplays() {
  maxTokensValue.textContent = maxTokensSlider.value;
  temperatureValue.textContent = parseFloat(temperatureSlider.value).toFixed(1);
  topPValue.textContent = parseFloat(topPSlider.value).toFixed(2);
  topKValue.textContent = topKSlider.value;
}

// Get current parameter values
function getCurrentParameters() {
  return {
    model: modelSelect.value,
    maxTokens: parseInt(maxTokensSlider.value),
    temperature: parseFloat(temperatureSlider.value),
    topP: parseFloat(topPSlider.value),
    topK: parseInt(topKSlider.value),
  };
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
            assistantMessageEl.querySelector("p").textContent = responseText;

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch (e) {
          // Ignore JSON parse errors for incomplete chunks
        }
      }
    }

    // Add completed response to chat history
    if (responseText) {
      chatHistory.push({ role: "assistant", content: responseText });
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
  messageEl.innerHTML = `<p>${content}</p>`;
  chatMessages.appendChild(messageEl);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", initialize);
