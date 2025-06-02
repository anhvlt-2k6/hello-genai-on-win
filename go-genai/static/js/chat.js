document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const modelNameSpan = document.getElementById('model-name');
    const modelNameFooter = document.getElementById('model-name-footer');
    const themeToggle = document.getElementById('theme-toggle');
    const clearChatButton = document.getElementById('clear-chat');
    const suggestions = document.querySelectorAll('.suggestion');
    
    // Track if a request is in progress
    let isRequestInProgress = false;

    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '🔆';
    }

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Enable/disable send button based on input
        sendButton.disabled = this.value.trim() === '';
    });

    // Theme toggle
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        themeToggle.innerHTML = isDarkMode ? '🔆' : '🌙';
    });

    // Clear chat history
    if (clearChatButton) {
        clearChatButton.addEventListener('click', function() {
            // Keep only the first welcome message
            while (chatBox.childNodes.length > 2) {
                chatBox.removeChild(chatBox.lastChild);
            }
            
            // Add suggestions back
            if (!document.querySelector('.suggestions')) {
                const suggestionsDiv = document.createElement('div');
                suggestionsDiv.className = 'suggestions';
                suggestionsDiv.innerHTML = `
                    <div class="suggestion">What can you do?</div>
                    <div class="suggestion">Tell me about Docker</div>
                    <div class="suggestion">How to use GenAI?</div>
                    <div class="suggestion" id="show-example">Show structured example</div>
                `;
                chatBox.appendChild(suggestionsDiv);
                
                // Re-attach event listeners to new suggestions
                document.querySelectorAll('.suggestion').forEach(suggestion => {
                    suggestion.addEventListener('click', function() {
                        if (this.id === 'show-example') {
                            showStructuredExample();
                        } else {
                            messageInput.value = this.textContent;
                            messageInput.dispatchEvent(new Event('input'));
                            sendMessage();
                        }
                    });
                });
            }
        });
    }

    // Get model info
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: "!modelinfo" }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.model) {
            modelNameSpan.textContent = data.model;
            if (modelNameFooter) {
                modelNameFooter.textContent = data.model;
            }
        } else {
            modelNameSpan.textContent = "AI Language Model";
        }
    })
    .catch(error => {
        modelNameSpan.textContent = "AI Language Model";
        console.error('Error fetching model info:', error);
    });

    // Format the response with markdown-like styling
    function formatResponse(text) {
        // Handle code blocks
        text = text.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
        
        // Handle inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Handle bold text
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Handle italic text
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Handle headers
        text = text.replace(/^# (.+)$/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.+)$/gm, '<h4>$1</h4>');
        text = text.replace(/^### (.+)$/gm, '<h5>$1</h5>');
        
        // Handle unordered lists
        text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');
        
        // Handle ordered lists
        text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>.+<\/li>\n)+/g, '<ol>$&</ol>');
        
        // Handle paragraphs
        text = text.replace(/^([^<\n].+)$/gm, '<p>$1</p>');
        
        // Handle links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Handle line breaks
        text = text.replace(/\n/g, '');
        
        return text;
    }

    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message || isRequestInProgress) return;
        
        // Set flag to prevent multiple requests
        isRequestInProgress = true;

        // Remove suggestions when user sends first message
        const suggestionsDiv = document.querySelector('.suggestions');
        if (suggestionsDiv) {
            chatBox.removeChild(suggestionsDiv);
        }

        // Add user message to chat
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message-container';
        userMessageDiv.innerHTML = `
            <div class="message-content" style="margin-left: auto;">
                <div class="user-message">
                    ${escapeHTML(message)}
                </div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
        `;
        chatBox.appendChild(userMessageDiv);
        
        // Clear input and reset height
        messageInput.value = '';
        messageInput.style.height = '50px';
        sendButton.disabled = true;

        // Show loading indicator
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'message-container';
        loadingContainer.innerHTML = `
            <div class="bot-icon">🤖</div>
            <div class="loading">
                <span>Thinking</span>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatBox.appendChild(loadingContainer);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Send message to API
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Remove loading indicator
            chatBox.removeChild(loadingContainer);
            
            // Add bot's response to chat
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message-container';
            
            if (data.error) {
                botMessageDiv.innerHTML = `
                    <div class="bot-icon">🤖</div>
                    <div class="message-content">
                        <div class="bot-message">
                            Sorry, I encountered an error: ${escapeHTML(data.error)}
                        </div>
                        <div class="message-time">${getCurrentTime()}</div>
                    </div>
                `;
            } else {
                // Format the response with markdown-like styling
                const formattedResponse = formatResponse(data.response);
                botMessageDiv.innerHTML = `
                    <div class="bot-icon">🤖</div>
                    <div class="message-content">
                        <div class="bot-message">
                            ${formattedResponse}
                        </div>
                        <div class="message-time">${getCurrentTime()}</div>
                    </div>
                `;
            }
            
            chatBox.appendChild(botMessageDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => {
            // Remove loading indicator
            chatBox.removeChild(loadingContainer);
            
            // Show error message
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'message-container';
            errorMessageDiv.innerHTML = `
                <div class="bot-icon">🤖</div>
                <div class="message-content">
                    <div class="bot-message">
                        Sorry, I encountered an error. Please try again.
                    </div>
                    <div class="message-time">${getCurrentTime()}</div>
                </div>
            `;
            chatBox.appendChild(errorMessageDiv);
            console.error('Error:', error);
        })
        .finally(() => {
            // Reset request flag
            isRequestInProgress = false;
        });
    }

    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Function to show structured example
    function showStructuredExample() {
        // Remove suggestions
        const suggestionsDiv = document.querySelector('.suggestions');
        if (suggestionsDiv) {
            chatBox.removeChild(suggestionsDiv);
        }
        
        // Add user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message-container';
        userMessageDiv.innerHTML = `
            <div class="message-content" style="margin-left: auto;">
                <div class="user-message">
                    Show me an example of structured formatting
                </div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
        `;
        chatBox.appendChild(userMessageDiv);
        
        // Show loading indicator
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'message-container';
        loadingContainer.innerHTML = `
            <div class="bot-icon">🤖</div>
            <div class="loading">
                <span>Loading example</span>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatBox.appendChild(loadingContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Fetch example
        fetch('/example')
            .then(response => response.json())
            .then(data => {
                // Remove loading indicator
                chatBox.removeChild(loadingContainer);
                
                // Add example response
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'message-container';
                
                // Format the response
                const formattedResponse = formatResponse(data.response);
                botMessageDiv.innerHTML = `
                    <div class="bot-icon">🤖</div>
                    <div class="message-content">
                        <div class="bot-message">
                            ${formattedResponse}
                        </div>
                        <div class="message-time">${getCurrentTime()}</div>
                    </div>
                `;
                
                chatBox.appendChild(botMessageDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
            })
            .catch(error => {
                // Remove loading indicator
                chatBox.removeChild(loadingContainer);
                
                // Show error message
                const errorMessageDiv = document.createElement('div');
                errorMessageDiv.className = 'message-container';
                errorMessageDiv.innerHTML = `
                    <div class="bot-icon">🤖</div>
                    <div class="message-content">
                        <div class="bot-message">
                            Sorry, I encountered an error loading the example.
                        </div>
                        <div class="message-time">${getCurrentTime()}</div>
                    </div>
                `;
                chatBox.appendChild(errorMessageDiv);
                console.error('Error:', error);
            });
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Add click event to suggestions
    suggestions.forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            if (this.id === 'show-example') {
                showStructuredExample();
            } else {
                messageInput.value = this.textContent;
                messageInput.dispatchEvent(new Event('input'));
                sendMessage();
            }
        });
    });
});
