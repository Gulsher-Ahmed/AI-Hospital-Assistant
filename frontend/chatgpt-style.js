/**
 * ChatGPT-Style Hospital AI Frontend
 * Modern, autonomous, AI-driven interface
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
        this.departmentsContainer.innerHTML = departments.map(dept => `
            <div class="department-card" onclick="hospitalAI.selectDepartment('${dept.id}')">
                <div class="department-info">
                    <div class="department-name">${dept.name}</div>
                    <div class="department-desc">${dept.description}</div>
                </div>
            </div>
        `).join('');
    }

    selectDepartment(departmentId) {
        this.currentDepartment = departmentId;
        const message = `I need help with ${departmentId}`;
        this.sendMessage(message);
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.addMessage('ai', `
                <div class="welcome-message">
                    <h3>Welcome to City General Hospital</h3>
                    <p>I'm your AI medical assistant, powered by advanced artificial intelligence. I can help you with:</p>
                    <ul>
                        <li>Medical questions and symptom assessment</li>
                        <li>Appointment scheduling with specialists</li>
                        <li>Department information and services</li>
                        <li>Emergency guidance and protocols</li>
                    </ul>
                    <p><strong>How can I assist you today?</strong></p>
                </div>
            `);
        }, 500);
    }

    async sendMessage(message = null) {
        const text = message || this.messageInput.value.trim();
        
        if (!text || this.isTyping) return;
        
        // Add user message
        this.addMessage('user', text);
        
        // Clear input
        if (!message) {
            this.messageInput.value = '';
            this.messageInput.style.height = 'auto';
        }
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const response = await fetch(`${this.apiBase}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    context: {
                        department: this.currentDepartment,
                        history: this.conversationHistory.slice(-5) // Last 5 messages for context
                    }
                })
            });
            
            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.error) {
                this.addMessage('ai', `❌ ${data.error}`, 'error');
            } else {
                this.handleAIResponse(data);
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage('ai', '❌ Sorry, I\'m having technical difficulties. Please try again.', 'error');
        }
        
        // Store conversation
        this.conversationHistory.push({
            user: text,
            timestamp: new Date().toISOString()
        });
    }

    handleAIResponse(data) {
        let content = data.message;
        
        // Add department badge if applicable
        if (data.department) {
            content = `
                <div class="department-badge">
                    <span class="badge-text">${data.department.name}</span>
                </div>
                ${content}
            `;
            this.currentDepartment = data.department.id;
        }
        
        // Add appointment slots if available
        if (data.showAppointments && data.appointments && data.appointments.length > 0) {
            content += this.renderAppointmentSlots(data.appointments);
        }
        
        // Add suggested departments
        if (data.suggestedDepartments && data.suggestedDepartments.length > 0) {
            content += this.renderSuggestedDepartments(data.suggestedDepartments);
        }
        
        // Add quick actions for greetings
        if (data.showQuickActions) {
            content += this.renderQuickActions();
        }
        
        // Add emergency contacts
        if (data.showEmergencyContacts) {
            content += this.renderEmergencyContacts();
        }
        
        this.addMessage('ai', content, data.type);
        
        // Update conversation history
        this.conversationHistory.push({
            ai: data.message,
            type: data.type,
            timestamp: new Date().toISOString()
        });
    }

    renderAppointmentSlots(appointments) {
        return `
            <div class="appointment-section">
                <h4>Available Appointments</h4>
                <div class="appointment-grid">
                    ${appointments.map(apt => `
                        <div class="appointment-card" onclick="hospitalAI.bookAppointment('${apt.id}')">
                            <div class="apt-header">
                                <div class="apt-doctor">${apt.doctor}</div>
                                <div class="apt-specialty">${apt.specialty}</div>
                            </div>
                            <div class="apt-time">
                                <div class="apt-date">${apt.date}</div>
                                <div class="apt-time-slot">${apt.time}</div>
                            </div>
                            <div class="apt-action">Click to Book</div>
                        </div>
                    `).join('')}
                </div>
                <div class="appointment-note">
                    Click any appointment slot to book, or ask me for specific preferences
                </div>
            </div>
        `;
    }

    renderSuggestedDepartments(departments) {
        return `
            <div class="suggestions-section">
                <h4>Recommended Specialists</h4>
                <div class="suggestions-grid">
                    ${departments.map(dept => `
                        <div class="suggestion-card" onclick="hospitalAI.selectDepartment('${dept.id}')">
                            <span class="suggestion-name">${dept.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderQuickActions() {
        const actions = [
            { text: 'Book an Appointment' },
            { text: 'Emergency Help' },
            { text: 'Find a Specialist' },
            { text: 'Hospital Services' }
        ];
        
        return `
            <div class="quick-actions">
                <h4>Quick Actions</h4>
                <div class="actions-grid">
                    ${actions.map(action => `
                        <div class="action-button" onclick="hospitalAI.sendMessage('${action.text}')">
                            <span class="action-text">${action.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderEmergencyContacts() {
        return `
            <div class="emergency-section">
                <h4>Emergency Contacts</h4>
                <div class="emergency-grid">
                    <div class="emergency-card urgent">
                        <div class="emergency-title">Life-Threatening Emergency</div>
                        <div class="emergency-action">Call 911</div>
                    </div>
                    <div class="emergency-card">
                        <div class="emergency-title">Hospital Emergency</div>
                        <div class="emergency-action">(555) 123-HELP</div>
                    </div>
                    <div class="emergency-card">
                        <div class="emergency-title">24/7 Nurse Line</div>
                        <div class="emergency-action">(555) 456-NURSE</div>
                    </div>
                </div>
            </div>
        `;
    }

    async bookAppointment(appointmentId) {
        // Simple booking simulation - in real app, would show booking form
        try {
            const response = await fetch(`${this.apiBase}/book-appointment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId: appointmentId,
                    patientInfo: {
                        name: 'Patient', // In real app, would collect this
                        phone: '(555) 123-4567',
                        email: 'patient@email.com'
                    }
                })
            });
            
            const data = await response.json();
            
            if (data.type === 'booking_success') {
                this.addMessage('ai', data.message, 'success');
            } else {
                this.addMessage('ai', data.message, 'error');
                
                // Show alternative appointments if booking failed
                if (data.showAlternatives) {
                    this.sendMessage('Show me other available appointments');
                }
            }
            
        } catch (error) {
            console.error('Booking error:', error);
            this.addMessage('ai', '❌ Booking failed. Please try again or call us directly.', 'error');
        }
    }

    addMessage(sender, content, type = 'normal') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message ${type}`;
        
        if (sender === 'ai') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="ai-avatar">AI</div>
                </div>
                <div class="message-content">${content}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${content}</div>
                <div class="message-avatar">
                    <div class="user-avatar">You</div>
                </div>
            `;
        }
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.sendButton.disabled = true;
        this.sendButton.innerHTML = '⏳';
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <div class="ai-avatar">AI</div>
            </div>
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
        this.sendButton.disabled = false;
        this.sendButton.innerHTML = '➤';
        
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }, 100);
    }

    // Voice input (future feature)
    startVoiceInput() {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                this.sendMessage();
            };

            recognition.start();
        } else {
            alert('Voice recognition not supported in this browser');
        }
    }
}

// Initialize the application
let hospitalAI;

document.addEventListener('DOMContentLoaded', () => {
    hospitalAI = new HospitalAI();
});

// Export for global access
window.hospitalAI = hospitalAI;
