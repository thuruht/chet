/**
 * Model Management Module
 * Handles AI model selection, configuration, and parameter management
 */

class ModelManager {
  constructor() {
    this.modelSelect = document.getElementById('model-select');
    this.modelInfo = document.getElementById('model-info');
    this.currentModelDisplay = document.getElementById('current-model');
    this.availableModels = {};
    this.currentModel = null;
    
    // Parameter controls
    this.parameterControls = {
      maxTokens: {
        slider: document.getElementById('max-tokens'),
        display: document.getElementById('max-tokens-value')
      },
      temperature: {
        slider: document.getElementById('temperature'),
        display: document.getElementById('temperature-value')
      },
      topP: {
        slider: document.getElementById('top-p'),
        display: document.getElementById('top-p-value')
      },
      topK: {
        slider: document.getElementById('top-k'),
        display: document.getElementById('top-k-value')
      },
      repetitionPenalty: {
        slider: document.getElementById('repetition-penalty'),
        display: document.getElementById('repetition-penalty-value')
      },
      frequencyPenalty: {
        slider: document.getElementById('frequency-penalty'),
        display: document.getElementById('frequency-penalty-value')
      },
      presencePenalty: {
        slider: document.getElementById('presence-penalty'),
        display: document.getElementById('presence-penalty-value')
      }
    };
    
    this.seedInput = document.getElementById('seed');
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadModels();
  }

  setupEventListeners() {
    // Model selection
    if (this.modelSelect) {
      this.modelSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          this.selectModel(e.target.value);
        }
      });
    }

    // Parameter sliders
    Object.entries(this.parameterControls).forEach(([param, controls]) => {
      if (controls.slider) {
        controls.slider.addEventListener('input', () => {
          this.updateParameterDisplays();
          this.showParameterFeedback(param, controls.slider.value);
        });
      }
    });
  }

  async loadModels() {
    if (window.showToast) {
      window.showToast("Loading available models...", "info", 2000);
    }

    try {
      const response = await fetch("/api/models");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const models = await response.json();
      this.availableModels = {};
      
      // Populate models object and dropdown
      if (this.modelSelect) {
        this.modelSelect.innerHTML = '<option value="">Select a model...</option>';
      }
      
      models.forEach((model) => {
        this.availableModels[model.key] = model;
        if (this.modelSelect) {
          const option = document.createElement("option");
          option.value = model.key;
          option.textContent = `${model.name} - ${model.description}`;
          this.modelSelect.appendChild(option);
        }
      });

      // Select the first model by default
      const firstModelKey = models[0]?.key;
      if (firstModelKey) {
        this.selectModel(firstModelKey);
      }

      if (window.showToast) {
        window.showToast(`Loaded ${models.length} models successfully!`, "success");
      }
      
    } catch (error) {
      console.error("Error loading models:", error);
      if (this.modelSelect) {
        this.modelSelect.innerHTML = '<option value="">❌ Failed to load models</option>';
      }
      if (this.modelInfo) {
        this.modelInfo.innerHTML = `<strong style="color: #FF6B6B;">❌ Error loading models:</strong><br>${error.message}<br><small>Check console for details.</small>`;
      }
      if (window.showToast) {
        window.showToast("Failed to load models! Check your internet connection.", "error", 5000);
      }
    }
  }

  selectModel(modelKey) {
    const model = this.availableModels[modelKey];
    if (!model) return;
    
    console.log(`Switching to model: ${model.name}`);
    this.currentModel = model;
    
    // Update model selector
    if (this.modelSelect) {
      this.modelSelect.value = modelKey;
    }
    
    // Update parameter ranges based on model capabilities
    this.updateParameterRanges(model);
    
    // Create detailed model description
    const capabilities = [];
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
    
    // Update model info display
    if (this.modelInfo) {
      this.modelInfo.style.background = "linear-gradient(135deg, #B3E5FC 0%, #E1F5FE 100%)";
      this.modelInfo.innerHTML = `
        <div style="padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.9); color: #333;">
          <h4 style="margin: 0 0 8px 0; color: #1976D2;">${model.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 0.9em;">${model.description}</p>
          ${specialization ? `<p style="margin: 0 0 8px 0; font-weight: 600;">${specialization}</p>` : ''}
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
            <span style="background: #E3F2FD; padding: 4px 8px; border-radius: 4px; font-size: 0.8em;">Context: ${model.contextWindow.toLocaleString()}</span>
            <span style="background: #F3E5F5; padding: 4px 8px; border-radius: 4px; font-size: 0.8em;">Max Tokens: ${model.maxTokensMax}</span>
            ${capabilities.map(cap => `<span style="background: #E8F5E8; padding: 4px 8px; border-radius: 4px; font-size: 0.8em;">${cap}</span>`).join('')}
          </div>
          <div style="font-size: 0.85em; color: #666; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 4px;">
            <span>🌡️ Temp: ${model.temperatureMin}-${model.temperatureMax}</span>
            <span>🎯 Top-P: ${model.topPMin}-${model.topPMax}</span>
            <span>🔢 Top-K: ${model.topKMin}-${model.topKMax}</span>
          </div>
        </div>
      `;
    }
    
    // Update current model display in header
    if (this.currentModelDisplay) {
      this.currentModelDisplay.textContent = model.name;
    }
    
    // Update parameter displays
    this.updateParameterDisplays();
  }

  updateParameterRanges(model) {
    const controls = this.parameterControls;
    
    // Max Tokens
    if (controls.maxTokens.slider) {
      controls.maxTokens.slider.min = 256;
      controls.maxTokens.slider.max = model.maxTokensMax;
      controls.maxTokens.slider.value = model.maxTokensDefault;
    }
    
    // Temperature
    if (controls.temperature.slider) {
      controls.temperature.slider.min = model.temperatureMin;
      controls.temperature.slider.max = model.temperatureMax;
      controls.temperature.slider.value = model.temperatureDefault;
    }
    
    // Top P
    if (controls.topP.slider) {
      controls.topP.slider.min = model.topPMin;
      controls.topP.slider.max = model.topPMax;
      controls.topP.slider.value = model.topPDefault;
    }
    
    // Top K
    if (controls.topK.slider) {
      controls.topK.slider.min = model.topKMin;
      controls.topK.slider.max = model.topKMax;
      controls.topK.slider.value = model.topKDefault;
    }
  }

  updateParameterDisplays() {
    Object.entries(this.parameterControls).forEach(([param, controls]) => {
      if (controls.slider && controls.display) {
        let value = controls.slider.value;
        
        // Format based on parameter type
        switch (param) {
          case 'temperature':
          case 'repetitionPenalty':
          case 'frequencyPenalty':
          case 'presencePenalty':
            value = parseFloat(value).toFixed(1);
            break;
          case 'topP':
            value = parseFloat(value).toFixed(2);
            break;
          default:
            value = parseInt(value).toString();
        }
        
        controls.display.textContent = value;
      }
    });
  }

  showParameterFeedback(param, value) {
    if (!window.showToast) return;
    
    const messages = {
      maxTokens: `Max tokens: ${value}`,
      temperature: `Temperature: ${parseFloat(value).toFixed(1)}`,
      topP: `Top P: ${parseFloat(value).toFixed(2)}`,
      topK: `Top K: ${value}`,
      repetitionPenalty: `Repetition penalty: ${parseFloat(value).toFixed(1)}`,
      frequencyPenalty: `Frequency penalty: ${parseFloat(value).toFixed(1)}`,
      presencePenalty: `Presence penalty: ${parseFloat(value).toFixed(1)}`
    };
    
    window.showToast(messages[param] || `${param}: ${value}`, "info", 1500);
  }

  getCurrentParameters() {
    const params = {};
    
    Object.entries(this.parameterControls).forEach(([param, controls]) => {
      if (controls.slider) {
        let value = parseFloat(controls.slider.value);
        
        // Convert parameter names to API format
        switch (param) {
          case 'maxTokens':
            params.maxTokens = parseInt(value);
            break;
          case 'temperature':
            params.temperature = value;
            break;
          case 'topP':
            params.topP = value;
            break;
          case 'topK':
            params.topK = parseInt(value);
            break;
          case 'repetitionPenalty':
            params.repetitionPenalty = value;
            break;
          case 'frequencyPenalty':
            params.frequencyPenalty = value;
            break;
          case 'presencePenalty':
            params.presencePenalty = value;
            break;
        }
      }
    });
    
    // Add seed if provided
    if (this.seedInput && this.seedInput.value.trim()) {
      params.seed = parseInt(this.seedInput.value.trim());
    }
    
    return params;
  }

  getCurrentModel() {
    return this.currentModel;
  }
}

// Export for use in main application
window.ModelManager = ModelManager;