import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '../services/api';
import './ChatInterface.css';

/**
 * Enhanced ChatInterface Component - Modern chat UI for the AI call center
 * 
 * Features: Dark mode support, voice input, message reactions, enhanced UX
 */
const ChatInterface = ({ isDarkMode }) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [messageReactions, setMessageReactions] = useState({});

  // Refs for auto-scrolling and voice
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsVoiceInputActive(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsVoiceInputActive(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsVoiceInputActive(false);
      };
    }
  }, []);

  // Send welcome message on component mount
  useEffect(() => {
    const sendWelcomeMessage = async () => {
      try {
        setMessages([{
          id: Date.now(),
          text: "👋 Welcome to AI Call Center! I'm here to help you with appointments, HR questions, and general support. How can I assist you today?",
          sender: 'ai',
          agent: 'system',
          timestamp: new Date(),
          isWelcome: true
        }]);
      } catch (error) {
        console.error('Failed to send welcome message:', error);
      }
    };

    sendWelcomeMessage();
  }, []);

  /**
   * Handle sending a message to the AI system
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate typing indicator
    setTypingUsers(['AI Assistant']);

    try {
      // Send message to backend
      const response = await sendMessage({
        message: inputMessage.trim(),
        sessionId: sessionId,
        conversationHistory: messages
      });

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'ai',
        agent: response.agent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentAgent(response.agent);
      setIsConnected(true);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm experiencing some technical difficulties. Please try again in a moment, or refresh the page if the problem persists.",
        sender: 'ai',
        agent: 'error',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      setTypingUsers([]);
    }
  };

  /**
   * Handle voice input
   */
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isVoiceInputActive) {
      recognitionRef.current.stop();
    } else {
      setIsVoiceInputActive(true);
      recognitionRef.current.start();
    }
  };

  /**
   * Handle message reactions
   */
  const handleMessageReaction = (messageId, emoji) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: emoji
    }));
  };

  /**
   * Handle Enter key press in input
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle input change with auto-resize
   */
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Get agent display name and emoji
   */
  const getAgentInfo = (agent) => {
    const agentMap = {
      'greeting': { name: 'Welcome Agent', emoji: '👋', color: '#10b981' },
      'appointment': { name: 'Appointments', emoji: '📅', color: '#3b82f6' },
      'hr': { name: 'HR Support', emoji: '👥', color: '#8b5cf6' },
      'closing': { name: 'Support', emoji: '✨', color: '#f59e0b' },
      'fallback': { name: 'General Assistant', emoji: '🤖', color: '#6366f1' },
      'system': { name: 'System', emoji: '⚡', color: '#06b6d4' },
      'error': { name: 'System Alert', emoji: '⚠️', color: '#ef4444' }
    };
    
    return agentMap[agent] || { name: 'AI Assistant', emoji: '🤖', color: '#6366f1' };
  };

  /**
   * Get quick action buttons based on conversation state
   */
  const getQuickActions = () => {
    const actions = [];
    
    if (messages.length <= 2) {
      actions.push(
        { text: "📅 Book Appointment", action: "I'd like to book a doctor appointment", icon: "📅" },
        { text: "👥 HR Questions", action: "I have a question about HR policies", icon: "👥" },
        { text: "💬 General Help", action: "I need help with something", icon: "💬" },
        { text: "⏰ Office Hours", action: "What are your office hours?", icon: "⏰" }
      );
    } else if (currentAgent === 'appointment') {
      actions.push(
        { text: "📋 Check Availability", action: "What appointment slots are available?", icon: "📋" },
        { text: "❌ Cancel Appointment", action: "I need to cancel my appointment", icon: "❌" },
        { text: "📞 Contact Doctor", action: "How can I contact my doctor?", icon: "📞" }
      );
    } else if (currentAgent === 'hr') {
      actions.push(
        { text: "🏖️ Leave Policy", action: "What's the leave policy?", icon: "🏖️" },
        { text: "💰 Benefits Info", action: "Tell me about benefits", icon: "💰" },
        { text: "📋 Policies", action: "What are the company policies?", icon: "📋" }
      );
    }

    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div className={`chat-interface ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Enhanced Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              <span className="status-text">
                {isConnected ? 'Connected' : 'Connection issues'}
              </span>
            </div>
            <div className="session-info">
              Session: {sessionId.split('-')[1]}
            </div>
          </div>
          
          {currentAgent && (
            <div className="current-agent" style={{ '--agent-color': getAgentInfo(currentAgent).color }}>
              <span className="agent-emoji">{getAgentInfo(currentAgent).emoji}</span>
              <span className="agent-name">{getAgentInfo(currentAgent).name}</span>
              <div className="agent-indicator"></div>
            </div>
          )}
        </div>
        
        <div className="chat-actions">
          <button 
            className="action-button"
            onClick={() => setMessages(messages.filter(m => m.isWelcome))}
            title="Clear chat"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Enhanced Messages Container */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'} ${message.isError ? 'error-message' : ''} ${message.isWelcome ? 'welcome-message' : ''}`}
            >
              <div className="message-content">
                {message.sender === 'ai' && (
                  <div className="message-header">
                    <div className="agent-badge" style={{ '--agent-color': getAgentInfo(message.agent).color }}>
                      <span className="agent-emoji">{getAgentInfo(message.agent).emoji}</span>
                      <span className="agent-name">{getAgentInfo(message.agent).name}</span>
                    </div>
                  </div>
                )}
                
                <div className="message-text">
                  {message.text}
                </div>
                
                <div className="message-footer">
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                  
                  {message.sender === 'ai' && !message.isError && (
                    <div className="message-reactions">
                      <button 
                        className={`reaction-btn ${messageReactions[message.id] === '👍' ? 'active' : ''}`}
                        onClick={() => handleMessageReaction(message.id, '👍')}
                      >
                        👍
                      </button>
                      <button 
                        className={`reaction-btn ${messageReactions[message.id] === '👎' ? 'active' : ''}`}
                        onClick={() => handleMessageReaction(message.id, '👎')}
                      >
                        👎
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Enhanced Loading indicator */}
          {isLoading && (
            <div className="message ai-message loading-message">
              <div className="message-content">
                <div className="message-header">
                  <div className="agent-badge">
                    <span className="agent-emoji">🤖</span>
                    <span className="agent-name">AI Assistant</span>
                  </div>
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <span className="typing-text">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Typing indicator for other users */}
          {typingUsers.length > 0 && !isLoading && (
            <div className="typing-users">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      {quickActions.length > 0 && (
        <div className="quick-actions">
          <div className="quick-actions-header">
            <span className="quick-actions-label">💡 Suggested actions</span>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-card"
                onClick={() => {
                  setInputMessage(action.action);
                  inputRef.current?.focus();
                }}
                disabled={isLoading}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-text">{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Input Area */}
      <div className="input-area">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... 💬"
              className="message-input"
              rows="1"
              disabled={isLoading}
              maxLength={1000}
            />
            
            <div className="input-actions">
              {recognitionRef.current && (
                <button
                  className={`voice-button ${isVoiceInputActive ? 'active' : ''}`}
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  title="Voice input"
                >
                  {isVoiceInputActive ? '🎙️' : '🎤'}
                </button>
              )}
              
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="send-button"
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className="send-loading">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <div className="send-icon">✈️</div>
                )}
              </button>
            </div>
          </div>
          
          <div className="input-footer">
            <div className="input-hint">
              <span>Press Enter to send • Shift+Enter for new line</span>
              {recognitionRef.current && <span> • Click 🎤 for voice input</span>}
            </div>
            <div className="character-count">
              {inputMessage.length}/1000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
