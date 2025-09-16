document.addEventListener('DOMContentLoaded', () => {
    const sessionNameInput = document.getElementById('session-name');
    const newSessionBtn = document.getElementById('new-session-btn');
    const sessionList = document.getElementById('session-list');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const modelSelect = document.getElementById('model-select');
    const sendButton = document.getElementById('send-button');

    let currentSession = localStorage.getItem('chet_current_session') || null;
    let sessions = JSON.parse(localStorage.getItem('chet_sessions')) || [];

    const renderSessions = () => {
        sessionList.innerHTML = '';
        sessions.forEach(session => {
            const li = document.createElement('li');
            li.textContent = session;
            li.dataset.session = session;
            if (session === currentSession) {
                li.classList.add('active');
            }
            sessionList.appendChild(li);
        });
    };

    const addMessage = (role, content, isError = false) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role);
        if (isError) {
            messageDiv.classList.add('error');
        }
        // Naive markdown for bold and code blocks
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        messageDiv.innerHTML = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    };

    const loadSessionHistory = async (sessionName) => {
         document.querySelector('.welcome-message')?.remove();
         chatMessages.innerHTML = '';
         addMessage('assistant', `Loading history for '${sessionName}'...`, true);

        try {
            const response = await fetch(`/chat?session=${encodeURIComponent(sessionName)}`);
            if (!response.ok) {
                throw new Error(`Failed to load history: ${response.statusText}`);
            }
            const history = await response.json();
            chatMessages.innerHTML = ''; // Clear loading message
            if(history && history.length > 0) {
                history.forEach(msg => addMessage(msg.role, msg.content));
            } else {
                addMessage('assistant', `Started new session: '${sessionName}'.`);
            }
        } catch(error) {
            console.error(error);
            chatMessages.innerHTML = '';
            addMessage('assistant', `Error loading session: ${error.message}`, true);
        }
    };

    const startSession = (sessionName) => {
        if (!sessionName || !sessionName.trim()) {
            alert('Please enter a valid session name.');
            return;
        }
        currentSession = sessionName.trim();
        if (!sessions.includes(currentSession)) {
            sessions.unshift(currentSession); // Add to top
            localStorage.setItem('chet_sessions', JSON.stringify(sessions));
        }
        localStorage.setItem('chet_current_session', currentSession);

        renderSessions();
        loadSessionHistory(currentSession);
    };

    newSessionBtn.addEventListener('click', () => {
        startSession(sessionNameInput.value);
        sessionNameInput.value = '';
    });

    sessionNameInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            newSessionBtn.click();
        }
    });

    sessionList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            startSession(e.target.dataset.session);
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentSession) {
            alert('Please start or select a session first.');
            return;
        }

        const message = messageInput.value.trim();
        if (!message) return;

        addMessage('user', message);
        messageInput.value = '';
        messageInput.style.height = 'auto';
        messageInput.disabled = true;
        sendButton.disabled = true;

        const loadingMessage = addMessage('assistant loading', 'C.H.E.T. is thinking...');

        const selectedModel = modelSelect.value;

        try {
            const response = await fetch(`/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session: currentSession,
                    model: selectedModel,
                    message: message,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`[${response.status}] ${errorText}`);
            }

            const assistantResponse = await response.text();
            loadingMessage.remove();
            addMessage('assistant', assistantResponse);

        } catch (error) {
            console.error('Error sending message:', error);
            loadingMessage.remove();
            addMessage('assistant', `Error: Could not get a response. ${error.message}`, true);
        } finally {
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    });

    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.requestSubmit();
        }
    });

    // Initial Load
    renderSessions();
    if(currentSession) {
        loadSessionHistory(currentSession);
    }
});
