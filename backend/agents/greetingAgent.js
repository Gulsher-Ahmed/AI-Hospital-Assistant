const llmService = require('../services/llmService');

/**
 * Greeting Agent - Handles welcome messages and initial user interaction
 * This agent is responsible for making a good first impression and guiding users
 */
class GreetingAgent {
  constructor() {
    this.name = 'GreetingAgent';
    this.description = 'Welcomes users and captures initial intent';
  }

  /**
   * Process incoming messages for greeting and initial interaction
   * @param {string} message - User's message
   * @param {Object} session - Current conversation session
   * @returns {Promise<Object>} - Response object with message and context
   */
  async processMessage(message, session) {
    try {
      // Create a context-aware prompt for the greeting agent
      const response = await llmService.generateResponse(
        'greeting', 
        message, 
        {
          temperature: 0.8, // Slightly more creative for friendly greetings
          max_tokens: 200
        },
        session.history || [] // Pass conversation history
      );

      return {
        message: response,
        agent: this.name,
        context: {
          greeted: true,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`❌ ${this.name} error:`, error);
      return {
        message: this.getFallbackGreeting(),
        agent: this.name,
        context: { greeted: true, error: true }
      };
    }
  }

  /**
   * Build a context-aware prompt for the greeting agent
   * @param {string} message - User's message
   * @param {Object} session - Current session
   * @returns {string} - Formatted prompt
   */
  buildGreetingPrompt(message, session) {
    const isFirstMessage = !session.history || session.history.length === 0;
    
    if (isFirstMessage) {
      return `You are a friendly and professional AI assistant for a call center. This is the user's first message: "${message}"

Your role is to:
1. Warmly welcome the user
2. Acknowledge their message
3. Briefly explain what services are available (appointment scheduling, HR questions, general inquiries)
4. Ask how you can help them today

Keep your response friendly, professional, and concise (2-3 sentences max).

Available services to mention:
- Doctor appointment scheduling
- HR policy questions and support
- General customer service inquiries

Respond in a helpful and welcoming tone.`;
    } else {
      return `You are a friendly AI assistant. The user said: "${message}"

This appears to be a greeting or general message during an ongoing conversation. Respond appropriately while staying in your role as a helpful call center assistant.

Keep your response brief and redirect them to how you can help with appointments, HR questions, or other services.`;
    }
  }

  /**
   * Fallback greeting when LLM service fails
   * @returns {string} - Default greeting message
   */
  getFallbackGreeting() {
    const greetings = [
      "Hello! Welcome to our AI call center. I'm here to help you today. How can I assist you with appointments, HR questions, or other inquiries?",
      "Hi there! Thank you for contacting us. I can help you with doctor appointments, HR policy questions, or any other services you need. What can I do for you?",
      "Welcome! I'm your AI assistant and I'm ready to help. Whether you need to schedule an appointment, have HR questions, or need other assistance, I'm here for you. How may I help you today?"
    ];
    
    // Return a random greeting for variety
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Check if a message is a greeting-type message
   * @param {string} message - User's message
   * @returns {boolean} - Whether the message is a greeting
   */
  isGreetingMessage(message) {
    const greetingKeywords = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 
      'good evening', 'howdy', 'greetings', 'what\'s up'
    ];
    
    const messageLower = message.toLowerCase();
    return greetingKeywords.some(keyword => messageLower.includes(keyword));
  }

  /**
   * Get agent information
   * @returns {Object} - Agent metadata
   */
  getAgentInfo() {
    return {
      name: this.name,
      description: this.description,
      capabilities: [
        'Welcome new users',
        'Provide service overview',
        'Capture initial intent',
        'Route to appropriate services'
      ],
      responseStyle: 'Friendly and professional'
    };
  }
}

module.exports = new GreetingAgent();
