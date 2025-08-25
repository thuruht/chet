/**
 * C.H.E.T. Main Application
 * 
 * Orchestrates the various modules and provides the main application logic.
 * This is a complete rewrite that modularizes the previous monolithic chat.js file.
 */

class CHETApplication {
  constructor() {
    this.themeManager = null;
    this.modelManager = null;
    this.chatManager = null;
    this.loadingManager = new LoadingManager();
    
    this.init();
  }

  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
      }

      showToast('Initializing C.H.E.T...', 'info', 2000);

      // Initialize managers in order
      this.themeManager = new ThemeManager();
      this.modelManager = new ModelManager();
      this.chatManager = new ChatManager(this.modelManager);

      // Setup global event listeners
      this.setupGlobalEventListeners();

      // Initialize additional features
      await this.initializePromptManagement();
      await this.initializeMCPManagement();

      showToast('C.H.E.T. ready! 🚀', 'success', 2000);

    } catch (error) {
      ErrorHandler.handle(error, 'Application Initialization');
    }
  }

  setupGlobalEventListeners() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + / for help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        this.showHelpDialog();
      }
      
      // Ctrl/Cmd + K for focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const userInput = document.getElementById('user-input');
        if (userInput) {
          userInput.focus();
        }
      }
    });

    // Handle window visibility changes for better performance
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Refresh any stale data when user returns
        this.refreshApplicationState();
      }
    });
  }

  async initializePromptManagement() {
    const addPromptBtn = document.getElementById('add-prompt-btn');
    const promptsList = document.getElementById('prompts-list');
    
    if (!addPromptBtn || !promptsList) return;

    // Load saved prompts
    await this.loadPrompts();

    // Add prompt button handler
    addPromptBtn.addEventListener('click', () => this.showPromptModal());
  }

  async loadPrompts() {
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const prompts = await response.json();
        this.displayPrompts(prompts);
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
    }
  }

  displayPrompts(prompts) {
    const promptsList = document.getElementById('prompts-list');
    if (!promptsList) return;

    promptsList.innerHTML = '';

    prompts.forEach(prompt => {
      const promptItem = document.createElement('div');
      promptItem.className = 'prompt-item';
      promptItem.innerHTML = `
        <div class="prompt-header">
          <h4>${prompt.name}</h4>
          <div class="prompt-actions">
            <button onclick="app.usePrompt('${prompt.id}')" title="Use Prompt">📝</button>
            <button onclick="app.editPrompt('${prompt.id}')" title="Edit">✏️</button>
            <button onclick="app.deletePrompt('${prompt.id}')" title="Delete">🗑️</button>
          </div>
        </div>
        <p class="prompt-content">${prompt.content.substring(0, 100)}${prompt.content.length > 100 ? '...' : ''}</p>
        ${prompt.tags.length > 0 ? `<div class="prompt-tags">${prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
      `;
      promptsList.appendChild(promptItem);
    });
  }

  usePrompt(promptId) {
    // Implementation for using a saved prompt
    const userInput = document.getElementById('user-input');
    if (userInput) {
      // This would fetch the prompt and populate the input
      fetch(`/api/prompts?id=${promptId}`)
        .then(response => response.json())
        .then(prompts => {
          const prompt = prompts.find(p => p.id === promptId);
          if (prompt) {
            userInput.value = prompt.content;
            userInput.focus();
            showToast('Prompt loaded', 'success');
          }
        })
        .catch(error => ErrorHandler.handle(error, 'Use Prompt'));
    }
  }

  async initializeMCPManagement() {
    const addMCPBtn = document.getElementById('add-mcp-btn');
    const mcpList = document.getElementById('mcp-list');
    
    if (!addMCPBtn || !mcpList) return;

    // Load MCP servers
    await this.loadMCPServers();

    // Add MCP server button handler
    addMCPBtn.addEventListener('click', () => this.showMCPModal());
  }

  async loadMCPServers() {
    try {
      const response = await fetch('/api/mcp-servers');
      if (response.ok) {
        const servers = await response.json();
        this.displayMCPServers(servers);
      }
    } catch (error) {
      console.error('Failed to load MCP servers:', error);
    }
  }

  displayMCPServers(servers) {
    const mcpList = document.getElementById('mcp-list');
    if (!mcpList) return;

    mcpList.innerHTML = '';

    servers.forEach(server => {
      const serverItem = document.createElement('div');
      serverItem.className = `mcp-item ${server.enabled ? 'enabled' : 'disabled'}`;
      serverItem.innerHTML = `
        <div class="mcp-header">
          <h4>${server.name}</h4>
          <div class="mcp-actions">
            <button onclick="app.toggleMCPServer('${server.id}')" title="Toggle Enable/Disable">
              ${server.enabled ? '🟢' : '🔴'}
            </button>
            <button onclick="app.editMCPServer('${server.id}')" title="Edit">✏️</button>
            <button onclick="app.deleteMCPServer('${server.id}')" title="Delete">🗑️</button>
          </div>
        </div>
        <p class="mcp-command">${Array.isArray(server.command) ? server.command.join(' ') : server.command}</p>
        ${server.description ? `<p class="mcp-description">${server.description}</p>` : ''}
      `;
      mcpList.appendChild(serverItem);
    });
  }

  showHelpDialog() {
    const helpContent = `
      <h3>🤖 C.H.E.T. Help</h3>
      <div class="help-section">
        <h4>Keyboard Shortcuts:</h4>
        <ul>
          <li><kbd>Ctrl/Cmd + K</kbd> - Focus chat input</li>
          <li><kbd>Ctrl/Cmd + T</kbd> - Toggle theme</li>
          <li><kbd>Ctrl/Cmd + /</kbd> - Show this help</li>
          <li><kbd>Enter</kbd> - Send message</li>
          <li><kbd>Shift + Enter</kbd> - New line</li>
        </ul>
      </div>
      <div class="help-section">
        <h4>Features:</h4>
        <ul>
          <li>🎨 13 beautiful themes with custom C.H.E.T. theme</li>
          <li>🤖 Multiple specialized AI models</li>
          <li>⚙️ Fine-tune model parameters</li>
          <li>💾 Save and reuse prompts</li>
          <li>🔧 MCP server management</li>
          <li>📁 Export chat responses</li>
        </ul>
      </div>
      <div class="help-section">
        <h4>Models:</h4>
        <ul>
          <li><strong>Llama 3.3 70B:</strong> General purpose powerhouse</li>
          <li><strong>Qwen2.5 Coder:</strong> Advanced coding specialist</li>
          <li><strong>DeepSeek Coder:</strong> Code generation expert</li>
          <li><strong>Hermes 2 Pro:</strong> Function calling specialist</li>
        </ul>
      </div>
    `;

    this.showModal('C.H.E.T. Help', helpContent);
  }

  showModal(title, content) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20000;
      backdrop-filter: blur(5px);
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.style.cssText = `
      background: var(--light-bg);
      color: var(--text-color);
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-color);
    `;

    modal.innerHTML = `
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: var(--primary-color);">${title}</h2>
        <button class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-light);">×</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => document.body.removeChild(overlay));
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    // Add to DOM
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus management
    modal.focus();
  }

  showPromptModal() {
    // Implementation for prompt modal would go here
    showToast('Prompt management modal - coming soon!', 'info', 2000);
  }

  showMCPModal() {
    // Implementation for MCP modal would go here
    showToast('MCP server management modal - coming soon!', 'info', 2000);
  }

  refreshApplicationState() {
    // Refresh any data that might be stale
    if (this.modelManager) {
      // Could refresh model list if needed
    }
    // Refresh prompts and MCP servers if needed
    this.loadPrompts();
    this.loadMCPServers();
  }

  // API for external access to app functionality
  getThemeManager() { return this.themeManager; }
  getModelManager() { return this.modelManager; }
  getChatManager() { return this.chatManager; }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new CHETApplication();
});

// Export for console debugging
window.chet = app;