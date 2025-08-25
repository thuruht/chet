/**
 * Theme Management Module
 * Handles theme switching, persistence, and UI
 */

class ThemeManager {
  constructor() {
    this.themeSelect = document.getElementById('theme-select');
    this.themeToggle = document.getElementById('theme-toggle');
    this.currentTheme = 'theme-chet'; // Default theme
    this.isDarkMode = true; // Default to dark mode
    
    this.init();
  }

  init() {
    // Load saved theme
    const savedTheme = localStorage.getItem('selected-theme');
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode !== null) {
      this.isDarkMode = savedDarkMode === 'true';
    }

    this.applyTheme();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Theme selector
    if (this.themeSelect) {
      this.themeSelect.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
      });

      // Make dropdown stay open on click/focus for better UX
      this.themeSelect.addEventListener('click', () => {
        this.themeSelect.parentElement.classList.add('expanded');
      });

      this.themeSelect.addEventListener('blur', () => {
        setTimeout(() => {
          this.themeSelect.parentElement.classList.remove('expanded');
        }, 200);
      });
    }

    // Theme toggle button
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        this.toggleDarkMode();
      });
    }

    // Keyboard shortcut (Ctrl/Cmd + T)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        this.toggleDarkMode();
      }
    });
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    this.applyTheme();
    localStorage.setItem('selected-theme', themeName);
    
    // Update UI
    if (this.themeSelect) {
      this.themeSelect.value = themeName;
    }
    
    // Show feedback
    if (window.showToast) {
      window.showToast(`Theme set to ${this.getThemeDisplayName(themeName)}`, 'success', 1000);
    }
  }

  toggleDarkMode() {
    const lightThemes = {
      'theme-solarized-dark': 'theme-solarized-light',
      'theme-material-dark': 'theme-material-blue',
      'theme-github-dark': 'theme-github-light'
    };
    
    const darkThemes = {
      'theme-solarized-light': 'theme-solarized-dark',
      'theme-material-blue': 'theme-material-dark',
      'theme-github-light': 'theme-github-dark'
    };

    let newTheme;
    if (this.isDarkMode && lightThemes[this.currentTheme]) {
      newTheme = lightThemes[this.currentTheme];
      this.isDarkMode = false;
    } else if (!this.isDarkMode && darkThemes[this.currentTheme]) {
      newTheme = darkThemes[this.currentTheme];
      this.isDarkMode = true;
    } else {
      // For themes without light/dark variants, just toggle the flag
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('dark-mode', this.isDarkMode.toString());
      if (window.showToast) {
        window.showToast('Toggled theme mode', 'info', 800);
      }
      return;
    }

    this.setTheme(newTheme);
    localStorage.setItem('dark-mode', this.isDarkMode.toString());
  }

  applyTheme() {
    // Remove all theme classes
    document.body.className = document.body.className.replace(/theme-\w+(-\w+)*/g, '');
    
    // Apply current theme
    document.body.classList.add(this.currentTheme);
  }

  getThemeDisplayName(themeName) {
    const themeNames = {
      'theme-chet': 'C.H.E.T. (Default)',
      'theme-discord': 'Discord',
      'theme-solarized-dark': 'Solarized Dark',
      'theme-solarized-light': 'Solarized Light',
      'theme-material-blue': 'Material Blue',
      'theme-material-dark': 'Material Dark',
      'theme-github-dark': 'GitHub Dark',
      'theme-github-light': 'GitHub Light',
      'theme-monokai': 'Monokai',
      'theme-dracula': 'Dracula',
      'theme-nord': 'Nord',
      'theme-tokyo-night': 'Tokyo Night',
      'theme-cyberpunk': 'Cyberpunk'
    };
    return themeNames[themeName] || themeName;
  }
}

// Export for use in main application
window.ThemeManager = ThemeManager;