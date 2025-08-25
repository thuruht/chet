/**
 * UI Utilities and Toast System
 * Handles notifications, UI helpers, and common utilities
 */

// Toast notification system
function createToastContainer() {
  const existing = document.getElementById('toast-container');
  if (existing) return;
  
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

function showToast(message, type = 'info', duration = 3000) {
  // Ensure container exists
  let container = document.getElementById('toast-container');
  if (!container) {
    createToastContainer();
    container = document.getElementById('toast-container');
  }
  if (!container) {
    console.error('Toast container not found and could not be created.');
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const colors = {
    info: 'var(--primary-color, #333)',
    success: 'var(--success-color, #2ecc71)',
    error: 'var(--danger-color, #ff6b6b)',
  };
  
  toast.style.cssText = `
    background-color: ${colors[type] || colors.info};
    color: #fff;
    padding: 10px 20px;
    margin-bottom: 5px;
    border-radius: 5px;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    pointer-events: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    font-size: 0.9em;
    max-width: 350px;
    word-wrap: break-word;
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

// UI Section Toggle System
function setupSectionToggles() {
  const toggles = document.querySelectorAll('.section-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const isExpanded = targetSection.style.display !== 'none';
        
        if (isExpanded) {
          // Collapse
          targetSection.style.display = 'none';
          toggle.classList.remove('expanded');
          if (window.showToast) {
            showToast(`Collapsed ${toggle.textContent.trim()} section`, "info", 900);
          }
        } else {
          // Expand
          targetSection.style.display = 'block';
          toggle.classList.add('expanded');
          if (window.showToast) {
            showToast(`Expanded ${toggle.textContent.trim()} section`, "info", 900);
          }
        }
      }
    });
  });
}

// Enhanced Error Handling
class ErrorHandler {
  static handle(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    
    let message = 'An unexpected error occurred';
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      message = 'Network error - please check your connection';
    } else if (error.name === 'AbortError') {
      message = 'Request was cancelled';
    } else if (error.message) {
      message = error.message;
    }
    
    if (window.showToast) {
      showToast(message, 'error', 5000);
    }
    
    return { handled: true, message };
  }

  static async withRetry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
}

// Loading State Manager
class LoadingManager {
  constructor() {
    this.activeLoaders = new Set();
  }

  show(id, message = 'Loading...') {
    this.activeLoaders.add(id);
    this.updateGlobalLoadingState();
    
    if (window.showToast) {
      showToast(message, 'info', 2000);
    }
  }

  hide(id) {
    this.activeLoaders.delete(id);
    this.updateGlobalLoadingState();
  }

  updateGlobalLoadingState() {
    const isLoading = this.activeLoaders.size > 0;
    document.body.classList.toggle('loading', isLoading);
    
    // Update cursor for loading state
    if (isLoading) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = '';
    }
  }
}

// Debounce utility for performance
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

// Local storage utilities with error handling
const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
      return false;
    }
  }
};

// Copy to clipboard utility
async function copyToClipboard(text, successMessage = 'Copied to clipboard') {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    
    if (window.showToast) {
      showToast(successMessage, 'success', 1400);
    }
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    if (window.showToast) {
      showToast('Copy failed', 'error', 1400);
    }
    return false;
  }
}

// Initialize global utilities
document.addEventListener('DOMContentLoaded', () => {
  createToastContainer();
  setupSectionToggles();
});

// Export utilities to global scope
window.showToast = showToast;
window.ErrorHandler = ErrorHandler;
window.LoadingManager = LoadingManager;
window.debounce = debounce;
window.Storage = Storage;
window.copyToClipboard = copyToClipboard;