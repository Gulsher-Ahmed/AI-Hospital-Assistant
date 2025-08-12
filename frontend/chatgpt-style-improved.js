/**
 * ChatGPT-Style Hospital AI Frontend with Appointment Slot Containers
 */

class HospitalAI {
    constructor() {
        this.apiBase = 'http://localhost:3001/api';
        this.currentDepartment = null;
        this.conversationHistory = [];
        this.isTyping = false;
        
        this.initializeUI();
        this.loadDepartments();
        this.showWelcomeMessage();
    }

    initializeUI() {
        // Initialize DOM elements
        this.chatContainer = document.getElementById('chat-container');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.departmentsContainer = document.getElementById('departments-container');
        
        // Event listeners
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });
    }

    async loadDepartments() {
        try {
            const response = await fetch(`${this.apiBase}/departments`);
            const data = await response.json();
            
            if (data.departments) {
                this.renderDepartments(data.departments);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    renderDepartments(departments) {
        if (!this.departmentsContainer) return;
        
        this.departmentsContainer.innerHTML = departments.map(dept => `
            <div class="department-card" onclick="hospitalAI.selectDepartment('${dept.name}')">
                <h4>${dept.name}</h4>
                <p>${dept.description}</p>
            </div>
        `).join('');
    }

    selectDepartment(departmentName) {
        this.currentDepartment = departmentName;
        this.sendMessage(`I need help with ${departmentName}`);
    }

    showWelcomeMessage() {
        this.addMessage('ai', "Hello! Welcome to City General Hospital. I'm here to help you with appointments, find doctors, or answer any questions about our services. How may I assist you today?");
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // Add user message to chat
        this.addMessage('user', message);
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        // Add current user message to conversation history before sending
        const currentUserEntry = {
            user: message,
            ai: '', // Will be filled after response
            timestamp: new Date().toISOString()
        };

        try {
            const contextToSend = {
                department: this.currentDepartment,
                conversationHistory: [...this.conversationHistory.slice(-5), {user: message, ai: '', timestamp: new Date().toISOString()}]
            };
            
            console.log('🚀 Sending context:', JSON.stringify(contextToSend, null, 2));
            
            const response = await fetch(`${this.apiBase}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: contextToSend
                })
            });

            const data = await response.json();
            
            this.hideTypingIndicator();
            
            let aiResponse = '';
            if (data.response) {
                // Handle different response types
                if (typeof data.response === 'object' && data.response.type === 'appointment_slots') {
                    this.addMessageWithSlots(data.response.message, data.response.slots);
                    aiResponse = data.response.message;
                } else {
                    this.addMessage('ai', data.response);
                    aiResponse = data.response;
                }
            } else {
                aiResponse = 'I apologize, but I\'m having trouble processing your request right now. Please try again.';
                this.addMessage('ai', aiResponse);
            }

            // Store conversation with the AI response
            this.conversationHistory.push({
                user: message,
                ai: aiResponse,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.hideTypingIndicator();
            console.error('Error sending message:', error);
            const errorMessage = 'I\'m sorry, but I\'m having connection issues. Please try again in a moment.';
            this.addMessage('ai', errorMessage);
            
            // Store conversation even on error
            this.conversationHistory.push({
                user: message,
                ai: errorMessage,
                timestamp: new Date().toISOString()
            });
        }
    }

    addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.formatMessage(content)}</div>
                <div class="message-timestamp">${timestamp}</div>
            </div>
        `;

        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addMessageWithSlots(message, slots) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const slotsHTML = slots.map(slot => `
            <div class="appointment-slot" onclick="hospitalAI.selectAppointmentSlot('${slot.id}', '${slot.time}', '${slot.date}', '${slot.doctor}')">
                <div class="slot-time">${slot.time}</div>
                <div class="slot-date">${slot.date}</div>
                <div class="slot-doctor">${slot.doctor}</div>
            </div>
        `).join('');

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.formatMessage(message)}</div>
                <div class="appointment-slots-container">
                    ${slotsHTML}
                </div>
                <div class="message-timestamp">${timestamp}</div>
            </div>
        `;

        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    selectAppointmentSlot(slotId, time, date, doctor) {
        // Add a confirmation message
        this.addMessage('user', `I'd like to book the ${time} appointment on ${date} with ${doctor}`);
        
        // Send booking request
        this.sendMessage(`Please book the ${time} appointment on ${date} with ${doctor} for me`);
    }

    formatMessage(content) {
        if (typeof content !== 'string') return content;
        
        // Convert line breaks to <br> tags
        content = content.replace(/\n/g, '<br>');
        
        // Make phone numbers clickable
        content = content.replace(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, '<a href="tel:$1">$1</a>');
        
        // Make emails clickable
        content = content.replace(/([\w\.-]+@[\w\.-]+\.\w+)/g, '<a href="mailto:$1">$1</a>');
        
        // Make websites clickable
        content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        content = content.replace(/(?<!https?:\/\/)(www\.[^\s]+)/g, '<a href="http://$1" target="_blank">$1</a>');
        
        return content;
    }

    showTypingIndicator() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    // Quick action methods for buttons
    showHospitalServices() {
        this.sendMessage('Hospital Services');
    }

    bookAppointment() {
        this.sendMessage('Book an Appointment');
    }

    getEmergencyHelp() {
        this.sendMessage('Emergency Help');
    }

    findSpecialist() {
        this.sendMessage('Find a Specialist');
    }
}

// Initialize the application
let hospitalAI;
document.addEventListener('DOMContentLoaded', () => {
    hospitalAI = new HospitalAI();
});
