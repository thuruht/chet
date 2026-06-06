class WorkspaceManager {
  constructor() {
    this.uploadBtn = document.getElementById("workspace-upload-btn");
    this.fileInput = document.getElementById("workspace-file-input");

    if (this.uploadBtn && this.fileInput) {
      this.uploadBtn.addEventListener("click", () => this.fileInput.click());
      this.fileInput.addEventListener("change", (e) =>
        this.handleFileUpload(e),
      );
    }
  }

  async handleFileUpload(event) {
    const files = event.target.files;
    if (!files.length) return;

    if (window.LoadingManager) {
      window.loadingManager = window.loadingManager || new LoadingManager();
      window.loadingManager.show(
        "upload",
        `Uploading ${files.length} file(s) to RAG...`,
      );
    }

    for (let file of files) {
      try {
        const content = await file.text();
        const response = await fetch("/api/rag/index", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, content }),
        });

        if (!response.ok) throw new Error("Failed to index file");
        if (window.showToast)
          showToast(`Indexed ${file.name} successfully`, "success");
      } catch (e) {
        console.error("Error uploading to RAG:", e);
        if (window.showToast)
          showToast(`Failed to index ${file.name}`, "error");
      }
    }

    if (window.loadingManager) window.loadingManager.hide("upload");
    this.fileInput.value = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.workspaceManager = new WorkspaceManager();
});
