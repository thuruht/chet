
/**
 * Chat Management Module
 * Handles chat UI, messaging, and streaming responses
 */

class ChatManager {
  constructor(modelManager) {
    this.modelManager = modelManager;
    this.chatMessages = document.getElementById('chat-messages');
    this.userInput = document.getElementById('user-input');
    this.sendButton = document.getElementById('send-button');
    this.typingIndicator = document.getElementById('typing-indicator');
    this.conversationHistory = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.displayWelcomeMessage();
  }

  setupEventListeners() {
    // Send button
    if (this.sendButton) {
      this.sendButton.addEventListener('click', () => this.sendMessage());
    }

    // Enter key to send
    if (this.userInput) {
      this.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      this.userInput.addEventListener('input', () => {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = this.userInput.scrollHeight + 'px';
      });
    }

    // Clear chat button
    const clearButton = document.getElementById('clear-chat');
    if (clearButton) {
      clearButton.addEventListener('click', () => this.clearChat());
    }
  }

  displayWelcomeMessage() {
    const welcomeMessage = {
      role: 'assistant',
      content: `Hello! I'm C.H.E.T. (Chat Helper for (almost) Every Task). I'm here to help you with a wide variety of tasks, from coding and analysis to creative writing and problem-solving.

✨ **What I can help with:**
- 🔧 Programming and code review
- 📊 Data analysis and explanations
- ✍️ Writing and editing
- 🤔 Problem solving and brainstorming
- 📚 Learning and research assistance

💡 **Tips:**
- Use the sidebar to adjust AI model parameters
- Switch between specialized models for different tasks
- Save useful prompts for later reuse

What would you like to work on today?`
    };

    this.displayMessage(welcomeMessage, false);
  }

  async sendMessage() {
    const message = this.userInput.value.trim();
    if (!message) return;

    const currentModel = this.modelManager.getCurrentModel();
    if (!currentModel) {
      if (window.showToast) {
        window.showToast('Please select a model first', 'error');
      }
      return;
    }

    // Clear input and disable send button
    this.userInput.value = '';
    this.userInput.style.height = 'auto';
    this.setSendingState(true);

    // Add user message to conversation
    const userMessage = { role: 'user', content: message };
    this.conversationHistory.push(userMessage);
    this.displayMessage(userMessage, false);

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await this.streamChatResponse(message, currentModel);
      this.hideTypingIndicator();
      this.setSendingState(false);
    } catch (error) {
      console.error('Chat error:', error);
      this.hideTypingIndicator();
      this.displayErrorMessage('Failed to get response from AI. Please try again.');
      this.setSendingState(false);
    }
  }

  async streamChatResponse(message, model) {
    const parameters = this.modelManager.getCurrentParameters();
    
    const requestBody = {
      messages: this.conversationHistory,
      model: model.key,
      ...parameters
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Create assistant message element
    const assistantMessage = { role: 'assistant', content: '' };
    const messageElement = this.displayMessage(assistantMessage, true);
    const contentElement = messageElement.querySelector('.message-content p');

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = '';
    let sseBuffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        let newlineIndex;
        while ((newlineIndex = sseBuffer.indexOf('\n')) !== -1) {
          const line = sseBuffer.slice(0, newlineIndex).trim();
          sseBuffer = sseBuffer.slice(newlineIndex + 1);
          
          if (!line) continue;

          try {
            const jsonData = JSON.parse(line);
            if (jsonData.response) {
              responseText += jsonData.response;
              contentElement.textContent = responseText;
              this.scrollToBottom();
            } else if (jsonData.meta) {
              // Handle metadata
              this.updateMessageMetadata(messageElement, jsonData.meta);
            }
          } catch (parseError) {
            console.warn('Failed to parse SSE line:', line, parseError);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Update conversation history
    assistantMessage.content = responseText;
    this.conversationHistory.push(assistantMessage);

    return responseText;
  }

  displayMessage(message, isStreaming = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = message.role === 'user' ? '👤' : '🤖';

    const content = document.createElement('div');
    content.className = 'message-content';
    
    const text = document.createElement('p');
    text.textContent = message.content;
    content.appendChild(text);

    // Add metadata container for assistant messages
    if (message.role === 'assistant') {
      const meta = document.createElement('div');
      meta.className = 'message-meta';
      content.appendChild(meta);

      // Add save button
      const saveButton = document.createElement('button');
      saveButton.className = 'save-response-btn';
  saveButton.textContent = '💾 Save Response';
  saveButton.addEventListener('click', () => this.saveResponse(message.content));
      content.appendChild(saveButton);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    if (this.chatMessages) {
      this.chatMessages.appendChild(messageDiv);
      this.scrollToBottom();
    }

    return messageDiv;
  }

  updateMessageMetadata(messageElement, metadata) {
    const metaElement = messageElement.querySelector('.message-meta');
    if (metaElement) {
      // Clear existing metadata
      while (metaElement.firstChild) metaElement.removeChild(metaElement.firstChild);
      const icon = document.createElement('span');
      icon.className = 'meta-icon';
      icon.textContent = '🤖';
      const details = document.createElement('span');
      details.textContent = `Model: ${metadata.modelKey} • Tokens: ${metadata.params?.maxTokens || '-'} • Temp: ${metadata.params?.temperature || '-'}`;
      const ts = document.createElement('span');
      ts.className = 'timestamp';
      ts.textContent = new Date().toLocaleTimeString();
      metaElement.appendChild(icon);
      metaElement.appendChild(details);
      metaElement.appendChild(ts);
    }
  }

  displayErrorMessage(errorMessage) {
    const errorMsg = {
      role: 'assistant',
      content: `❌ Error: ${errorMessage}`
    };
    this.displayMessage(errorMsg, false);
  }

  showTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.style.display = 'block';
    }
  }

  hideTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.style.display = 'none';
    }
  }

  setSendingState(isSending) {
    if (this.sendButton) {
      this.sendButton.disabled = isSending;
      this.sendButton.textContent = isSending ? '🔄 Sending...' : '📤 Send';
    }
    if (this.userInput) {
      this.userInput.disabled = isSending;
    }
  }

  scrollToBottom() {
    if (this.chatMessages) {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }

  clearChat() {
    this.conversationHistory = [];
    if (this.chatMessages) {
      while (this.chatMessages.firstChild) this.chatMessages.removeChild(this.chatMessages.firstChild);
    }
    this.displayWelcomeMessage();
    
    if (window.showToast) {
      window.showToast('Chat cleared', 'info', 1000);
    }
  }

  async saveResponse(content) {
    try {
      const response = await fetch('/api/save-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `chat-response-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`,
          content: content,
          contentType: 'text/plain'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-response-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        if (window.showToast) {
          window.showToast('Response saved successfully!', 'success');
        }
      } else {
        throw new Error('Failed to save response');
      }
    } catch (error) {
      console.error('Save error:', error);
      if (window.showToast) {
        window.showToast('Failed to save response', 'error');
      }
    }
  }
}

// Export for use in main application
window.ChatManager = ChatManager;