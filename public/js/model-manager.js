/**
 * Model Management Module
 * Single, clean ModelManager implementation that avoids innerHTML and uses safe DOM APIs.
 */

class ModelManager {
  constructor() {
    this.modelSelect = document.getElementById('model-select');
    this.modelInfo = document.getElementById('model-info');
    this.currentModelDisplay = document.getElementById('current-model');
    this.availableModels = {};
    this.currentModel = null;

    this.parameterControls = {
      maxTokens: { slider: document.getElementById('max-tokens'), display: document.getElementById('max-tokens-value') },
      temperature: { slider: document.getElementById('temperature'), display: document.getElementById('temperature-value') },
      topP: { slider: document.getElementById('top-p'), display: document.getElementById('top-p-value') },
      topK: { slider: document.getElementById('top-k'), display: document.getElementById('top-k-value') },
      repetitionPenalty: { slider: document.getElementById('repetition-penalty'), display: document.getElementById('repetition-penalty-value') },
      frequencyPenalty: { slider: document.getElementById('frequency-penalty'), display: document.getElementById('frequency-penalty-value') },
      presencePenalty: { slider: document.getElementById('presence-penalty'), display: document.getElementById('presence-penalty-value') }
    };

    this.seedInput = document.getElementById('seed');
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadModels();
  }

  setupEventListeners() {
    if (this.modelSelect) {
      this.modelSelect.addEventListener('change', (e) => {
        if (e.target && e.target.value) this.selectModel(e.target.value);
      });
    }

    Object.entries(this.parameterControls).forEach(([param, controls]) => {
      if (controls && controls.slider) controls.slider.addEventListener('input', () => { this.updateParameterDisplays(); this.showParameterFeedback(param, controls.slider.value); });
    });
  }

  async loadModels() {
    if (window.showToast) window.showToast('Loading available models...', 'info', 1200);
    try {
      const res = await fetch('/api/models');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const models = await res.json();

      this.availableModels = {};
      if (this.modelSelect) {
        while (this.modelSelect.firstChild) this.modelSelect.removeChild(this.modelSelect.firstChild);
        const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Select a model...'; this.modelSelect.appendChild(placeholder);
      }

      models.forEach((m) => {
        this.availableModels[m.key] = m;
        if (this.modelSelect) { const o = document.createElement('option'); o.value = m.key; o.textContent = `${m.name} - ${m.description}`; this.modelSelect.appendChild(o); }
      });

      const first = models[0]?.key; if (first) this.selectModel(first);
      if (window.showToast) window.showToast(`Loaded ${models.length} models`, 'success');
    } catch (err) {
      console.error('Error loading models:', err);
      if (this.modelSelect) { while (this.modelSelect.firstChild) this.modelSelect.removeChild(this.modelSelect.firstChild); const o = document.createElement('option'); o.value = ''; o.textContent = '❌ Failed to load models'; this.modelSelect.appendChild(o); }
      if (this.modelInfo) { while (this.modelInfo.firstChild) this.modelInfo.removeChild(this.modelInfo.firstChild); const strong = document.createElement('strong'); strong.style.color = '#FF6B6B'; strong.textContent = '❌ Error loading models:'; this.modelInfo.appendChild(strong); const msg = document.createElement('div'); msg.textContent = String(err); this.modelInfo.appendChild(msg); }
      if (window.showToast) window.showToast('Failed to load models', 'error', 3000);
    }
  }

  selectModel(key) {
    const model = this.availableModels[key]; if (!model) return; this.currentModel = model; if (this.modelSelect) this.modelSelect.value = key; if (this.currentModelDisplay) this.currentModelDisplay.textContent = model.name; this.updateParameterRanges(model);

    // Build a compact info card
    if (this.modelInfo) {
      while (this.modelInfo.firstChild) this.modelInfo.removeChild(this.modelInfo.firstChild);
      const h = document.createElement('div'); h.style.fontWeight = '700'; h.textContent = model.name; this.modelInfo.appendChild(h);
      const p = document.createElement('div'); p.style.marginTop = '6px'; p.textContent = model.description; this.modelInfo.appendChild(p);
    }
    this.updateParameterDisplays();
  }

  updateParameterRanges(model) {
    const c = this.parameterControls; if (!c) return;
    if (c.maxTokens?.slider) { c.maxTokens.slider.min = 256; c.maxTokens.slider.max = model.maxTokensMax ?? 4096; c.maxTokens.slider.value = model.maxTokensDefault ?? c.maxTokens.slider.min; }
    if (c.temperature?.slider) { c.temperature.slider.min = model.temperatureMin ?? 0; c.temperature.slider.max = model.temperatureMax ?? 2; c.temperature.slider.value = model.temperatureDefault ?? c.temperature.slider.min; }
    if (c.topP?.slider) { c.topP.slider.min = model.topPMin ?? 0; c.topP.slider.max = model.topPMax ?? 1; c.topP.slider.value = model.topPDefault ?? c.topP.slider.min; }
    if (c.topK?.slider) { c.topK.slider.min = model.topKMin ?? 0; c.topK.slider.max = model.topKMax ?? 100; c.topK.slider.value = model.topKDefault ?? c.topK.slider.min; }
  }

  updateParameterDisplays() {
    Object.entries(this.parameterControls).forEach(([param, controls]) => {
      if (!controls || !controls.slider || !controls.display) return;
      let v = controls.slider.value;
      if (param === 'temperature') v = parseFloat(v).toFixed(1);
      else if (param === 'topP') v = parseFloat(v).toFixed(2);
      else v = String(parseInt(v));
      controls.display.textContent = v;
    });
  }

  showParameterFeedback(param, value) {
    if (!window.showToast) return; const messages = { maxTokens: `Max tokens: ${value}`, temperature: `Temperature: ${parseFloat(value).toFixed(1)}`, topP: `Top P: ${parseFloat(value).toFixed(2)}`, topK: `Top K: ${value}` }; if (window.showToast) window.showToast(messages[param] || `${param}: ${value}`, 'info', 1200);
  }

  getCurrentParameters() {
    const params = {}; Object.entries(this.parameterControls).forEach(([param, controls]) => { if (!controls || !controls.slider) return; const raw = parseFloat(controls.slider.value); if (param === 'maxTokens' || param === 'topK') params[param] = parseInt(raw); else params[param] = raw; }); if (this.seedInput && this.seedInput.value && this.seedInput.value.trim()) params.seed = parseInt(this.seedInput.value.trim()); return params;
  }

  getCurrentModel() { return this.currentModel; }
}

window.ModelManager = ModelManager;

/**
 * Model Management Module
 * Clean, single-definition ModelManager using safe DOM methods.
 */

class ModelManager {
  constructor() {
    this.modelSelect = document.getElementById('model-select');
    this.modelInfo = document.getElementById('model-info');
    this.currentModelDisplay = document.getElementById('current-model');
    this.availableModels = {};
    this.currentModel = null;

    this.parameterControls = {
      maxTokens: { slider: document.getElementById('max-tokens'), display: document.getElementById('max-tokens-value') },
      temperature: { slider: document.getElementById('temperature'), display: document.getElementById('temperature-value') },
      topP: { slider: document.getElementById('top-p'), display: document.getElementById('top-p-value') },
      topK: { slider: document.getElementById('top-k'), display: document.getElementById('top-k-value') },
      repetitionPenalty: { slider: document.getElementById('repetition-penalty'), display: document.getElementById('repetition-penalty-value') },
      frequencyPenalty: { slider: document.getElementById('frequency-penalty'), display: document.getElementById('frequency-penalty-value') },
      presencePenalty: { slider: document.getElementById('presence-penalty'), display: document.getElementById('presence-penalty-value') }
    };

    this.seedInput = document.getElementById('seed');
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadModels();
  }

  setupEventListeners() {

    // Export for use in main application
    window.ModelManager = ModelManager;
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
        this.modelInfo.style.background = 'linear-gradient(135deg, #B3E5FC 0%, #E1F5FE 100%)';
        // Clear previous children
        while (this.modelInfo.firstChild) this.modelInfo.removeChild(this.modelInfo.firstChild);

        const container = document.createElement('div');
        container.style.padding = '12px';
        container.style.borderRadius = '8px';
        container.style.background = 'rgba(255,255,255,0.9)';
        container.style.color = '#333';

        const h4 = document.createElement('h4');
        h4.style.margin = '0 0 8px 0';
        h4.style.color = '#1976D2';
        h4.textContent = model.name;
        container.appendChild(h4);

        const desc = document.createElement('p');
        desc.style.margin = '0 0 8px 0';
        desc.style.fontSize = '0.9em';
        desc.textContent = model.description;
        container.appendChild(desc);

        if (specialization) {
          const spec = document.createElement('p');
          spec.style.margin = '0 0 8px 0';
          spec.style.fontWeight = '600';
          spec.textContent = specialization;
          container.appendChild(spec);
        }

        const capsWrap = document.createElement('div');
        capsWrap.style.display = 'flex';
        capsWrap.style.flexWrap = 'wrap';
        capsWrap.style.gap = '8px';
        capsWrap.style.marginBottom = '8px';

        const contextSpan = document.createElement('span');
        contextSpan.style.background = '#E3F2FD';
        contextSpan.style.padding = '4px 8px';
        contextSpan.style.borderRadius = '4px';
        contextSpan.style.fontSize = '0.8em';
        contextSpan.textContent = `Context: ${model.contextWindow.toLocaleString()}`;
        capsWrap.appendChild(contextSpan);

        const maxTokensSpan = document.createElement('span');
        maxTokensSpan.style.background = '#F3E5F5';
        maxTokensSpan.style.padding = '4px 8px';
        maxTokensSpan.style.borderRadius = '4px';
        maxTokensSpan.style.fontSize = '0.8em';
        maxTokensSpan.textContent = `Max Tokens: ${model.maxTokensMax}`;
        capsWrap.appendChild(maxTokensSpan);

        capabilities.forEach(cap => {
          const s = document.createElement('span');
          s.style.background = '#E8F5E8';
          s.style.padding = '4px 8px';
          s.style.borderRadius = '4px';
          s.style.fontSize = '0.8em';
          s.textContent = cap;
          capsWrap.appendChild(s);
        });

        container.appendChild(capsWrap);

        const stats = document.createElement('div');
        stats.style.fontSize = '0.85em';
        stats.style.color = '#666';
        stats.style.display = 'grid';
        stats.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
        stats.style.gap = '4px';

        const tempSpan = document.createElement('span');
        tempSpan.textContent = `🌡️ Temp: ${model.temperatureMin}-${model.temperatureMax}`;
        stats.appendChild(tempSpan);

        const topPSpan = document.createElement('span');
        topPSpan.textContent = `🎯 Top-P: ${model.topPMin}-${model.topPMax}`;
        stats.appendChild(topPSpan);

        const topKSpan = document.createElement('span');
        topKSpan.textContent = `🔢 Top-K: ${model.topKMin}-${model.topKMax}`;
        stats.appendChild(topKSpan);

        container.appendChild(stats);

        this.modelInfo.appendChild(container);
      }
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