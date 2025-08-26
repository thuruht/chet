// Minimal, clean ModelManager implementation.
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
      topK: { slider: document.getElementById('top-k'), display: document.getElementById('top-k-value') }
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
      this.modelSelect.addEventListener('change', (e) => { if (e.target && e.target.value) this.selectModel(e.target.value); });
    }

    Object.entries(this.parameterControls).forEach(([param, ctrls]) => {
      if (!ctrls || !ctrls.slider) return;
      ctrls.slider.addEventListener('input', () => {
        this.updateParameterDisplays();
        this.showParameterFeedback(param, ctrls.slider.value);
      });
    });
  }

  async loadModels() {
    if (window.showToast) window.showToast('Loading available models...', 'info', 1000);
    try {
      const res = await fetch('/api/models');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const models = await res.json();

      this.availableModels = {};
      if (this.modelSelect) {
        while (this.modelSelect.firstChild) this.modelSelect.removeChild(this.modelSelect.firstChild);
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Select a model...';
        this.modelSelect.appendChild(placeholder);
      }

      models.forEach((m) => {
        this.availableModels[m.key] = m;
        if (this.modelSelect) {
          const opt = document.createElement('option');
          opt.value = m.key;
          opt.textContent = m.name + ' - ' + m.description;
          this.modelSelect.appendChild(opt);
        }
      });

      const first = models && models[0] && models[0].key;
      if (first) this.selectModel(first);
      if (window.showToast) window.showToast('Loaded ' + (models.length || 0) + ' models', 'success', 1000);
    } catch (err) {
      console.error('Error loading models', err);
      if (this.modelSelect) {
        while (this.modelSelect.firstChild) this.modelSelect.removeChild(this.modelSelect.firstChild);
        const o = document.createElement('option');
        o.value = '';
        o.textContent = '❌ Failed to load models';
        this.modelSelect.appendChild(o);
      }
      if (this.modelInfo) {
        while (this.modelInfo.firstChild) this.modelInfo.removeChild(this.modelInfo.firstChild);
        const s = document.createElement('strong');
        s.style.color = '#FF6B6B';
        s.textContent = '❌ Error loading models:';
        this.modelInfo.appendChild(s);
        const msg = document.createElement('div');
        msg.textContent = String(err);
        this.modelInfo.appendChild(msg);
      }
      if (window.showToast) window.showToast('Failed to load models', 'error', 3000);
    }
  }

  selectModel(key) {
    const m = this.availableModels[key];
    if (!m) return;
    this.currentModel = m;
    if (this.modelSelect) this.modelSelect.value = key;
    if (this.currentModelDisplay) this.currentModelDisplay.textContent = m.name;
    this.updateParameterRanges(m);
    this.renderModelInfo(m);
    this.updateParameterDisplays();
  }

  renderModelInfo(model) {
    if (!this.modelInfo) return;
    while (this.modelInfo.firstChild) this.modelInfo.removeChild(this.modelInfo.firstChild);

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    if (model.specializations && model.specializations.length) {
      model.specializations.forEach((specialization) => {
        const spec = document.createElement('div');
        spec.style.margin = '0 0 8px 0';
        spec.style.fontWeight = '600';
        spec.textContent = specialization;
        container.appendChild(spec);
      });
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
    contextSpan.textContent = 'Context: ' + (model.contextWindow ? model.contextWindow.toLocaleString() : 'N/A');
    capsWrap.appendChild(contextSpan);

    const maxTokensSpan = document.createElement('span');
    maxTokensSpan.style.background = '#F3E5F5';
    maxTokensSpan.style.padding = '4px 8px';
    maxTokensSpan.style.borderRadius = '4px';
    maxTokensSpan.style.fontSize = '0.8em';
    maxTokensSpan.textContent = 'Max Tokens: ' + (model.maxTokensMax || 'N/A');
    capsWrap.appendChild(maxTokensSpan);

    (model.capabilities || []).forEach((cap) => {
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
    tempSpan.textContent = 'Temp: ' + (model.temperatureMin !== undefined ? model.temperatureMin + '-' + model.temperatureMax : 'N/A');
    stats.appendChild(tempSpan);

    const topPSpan = document.createElement('span');
    topPSpan.textContent = 'Top-P: ' + (model.topPMin !== undefined ? model.topPMin + '-' + model.topPMax : 'N/A');
    stats.appendChild(topPSpan);

    const topKSpan = document.createElement('span');
    topKSpan.textContent = 'Top-K: ' + (model.topKMin !== undefined ? model.topKMin + '-' + model.topKMax : 'N/A');
    stats.appendChild(topKSpan);

    container.appendChild(stats);

    this.modelInfo.appendChild(container);

    if (this.currentModelDisplay) this.currentModelDisplay.textContent = model.name || '';
    this.updateParameterDisplays();
  }

  updateParameterRanges(model) {
    const controls = this.parameterControls; if (!controls) return;
    if (controls.maxTokens && controls.maxTokens.slider) { controls.maxTokens.slider.min = 256; controls.maxTokens.slider.max = model.maxTokensMax || 4096; controls.maxTokens.slider.value = model.maxTokensDefault || controls.maxTokens.slider.min; }
    if (controls.temperature && controls.temperature.slider) { controls.temperature.slider.min = model.temperatureMin || 0; controls.temperature.slider.max = model.temperatureMax || 2; controls.temperature.slider.value = model.temperatureDefault || controls.temperature.slider.min; }
    if (controls.topP && controls.topP.slider) { controls.topP.slider.min = model.topPMin || 0; controls.topP.slider.max = model.topPMax || 1; controls.topP.slider.value = model.topPDefault || controls.topP.slider.min; }
    if (controls.topK && controls.topK.slider) { controls.topK.slider.min = model.topKMin || 0; controls.topK.slider.max = model.topKMax || 100; controls.topK.slider.value = model.topKDefault || controls.topK.slider.min; }
  }

  updateParameterDisplays() {
    Object.entries(this.parameterControls).forEach(([param, controls]) => { if (!controls || !controls.slider || !controls.display) return; let value = controls.slider.value; if (['temperature','repetitionPenalty','frequencyPenalty','presencePenalty'].includes(param)) value = Number(value).toFixed(1); else if (param === 'topP') value = Number(value).toFixed(2); else value = parseInt(value).toString(); controls.display.textContent = value; });
  }

  showParameterFeedback(param, value) { if (!window.showToast) return; const messages = { maxTokens: 'Max tokens: ' + value, temperature: 'Temperature: ' + Number(value).toFixed(1), topP: 'Top P: ' + Number(value).toFixed(2), topK: 'Top K: ' + value }; window.showToast(messages[param] || (param + ': ' + value), 'info', 1200); }

  getCurrentParameters() { const params = {}; Object.entries(this.parameterControls).forEach(([param, controls]) => { if (!controls || !controls.slider) return; const raw = Number(controls.slider.value); if (param === 'maxTokens' || param === 'topK') params[param] = parseInt(raw); else params[param] = raw; }); if (this.seedInput && this.seedInput.value && this.seedInput.value.trim()) params.seed = parseInt(this.seedInput.value.trim()); return params; }

  getCurrentModel() { return this.currentModel; }
}

window.ModelManager = ModelManager;

