// Authentication manager for C.H.E.T.

class AuthManager {
  constructor() {
    this.isAuthenticated = false;
    this.overlay = document.getElementById("auth-overlay");
    this.form = document.getElementById("auth-form");
    this.emailInput = document.getElementById("auth-email");
    this.submitBtn = document.getElementById("auth-submit-btn");
    this.loadingDiv = document.getElementById("auth-loading");
    this.messageP = document.getElementById("auth-message");

    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Check if we just got a session cookie
    if (document.cookie.includes("chet_session=")) {
      this.isAuthenticated = true;
      if (this.overlay) {
        this.overlay.style.display = "none";
      }
      this.initLogoutBtn();
    } else {
      // Show auth overlay
      if (this.overlay) {
        this.overlay.style.display = "flex";
      }
    }
  }

  initLogoutBtn() {
    // Add logout to the top header or dev section
    const devSection = document.getElementById("dev-section");
    if (devSection && !document.getElementById("logout-btn")) {
      const btnDiv = document.createElement("div");
      btnDiv.className = "parameter-group";
      btnDiv.innerHTML =
        '<button id="logout-btn" class="action-btn" style="background: var(--danger-color); border-color: var(--danger-color); color: white;">Logout</button>';
      devSection.appendChild(btnDiv);

      document.getElementById("logout-btn").addEventListener("click", () => {
        this.handleLogout();
      });
    }
  }

  async handleLogin() {
    const email = this.emailInput.value.trim();
    if (!email) return;

    this.submitBtn.style.display = "none";
    this.loadingDiv.style.display = "block";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        this.messageP.textContent =
          "Link sent! Check your email and click the link to log in. You can close this window.";
        this.messageP.style.color = "var(--success-color)";
        this.form.style.display = "none";
        this.loadingDiv.style.display = "none";
      } else {
        throw new Error(data.error || "Failed to send login link");
      }
    } catch (error) {
      this.submitBtn.style.display = "block";
      this.loadingDiv.style.display = "none";
      if (window.showToast) {
        showToast(error.message, "error");
      }
    }
  }

  async handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
      window.location.reload(); // Reload anyway to clear local state
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.authManager = new AuthManager();
});
