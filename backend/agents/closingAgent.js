const llmService = require('../services/llmService');

/**
 * Closing Agent - Handles conversation endings and wrap-up
 * This agent provides polite closures and ensures customer satisfaction
 */
class ClosingAgent {
  constructor() {
    this.name = 'ClosingAgent';
    this.description = 'Handles conversation endings and wrap-up';
  }

  /**
   * Process conversation closing messages
   * @param {string} message - User's message
   * @param {Object} session - Current conversation session
   * @returns {Promise<Object>} - Response object with message and context
   */
  async processMessage(message, session) {
    try {
      // Determine the type of closing interaction
      const closingType = this.determineClosingType(message, session);
      
      let response;
      let context = {};

      switch (closingType) {
        case 'satisfaction_check':
          response = await this.handleSatisfactionCheck(message, session);
          break;
        case 'feedback_request':
          response = await this.handleFeedbackRequest(message, session);
          break;
        case 'final_goodbye':
          response = await this.handleFinalGoodbye(message, session);
          break;
        case 'offer_additional_help':
          response = await this.handleAdditionalHelp(message, session);
          break;
        default:
          response = await this.handleGeneralClosing(message, session);
      }

      return {
        message: response.message,
        agent: this.name,
        context: { 
          ...context, 
          ...response.context,
          conversation_ending: true
        }
      };
    } catch (error) {
      console.error(`❌ ${this.name} error:`, error);
      return {
        message: this.getFallbackClosing(),
        agent: this.name,
        context: { error: true, conversation_ending: true }
      };
    }
  }

  /**
   * Determine the type of closing interaction needed
   * @param {string} message - User's message
   * @param {Object} session - Current session
   * @returns {string} - Closing type
   */
  determineClosingType(message, session) {
    const messageLower = message.toLowerCase();
    const conversationLength = session.history ? session.history.length : 0;

    // Check if user explicitly said goodbye
    if (messageLower.includes('bye') || messageLower.includes('goodbye') || 
        messageLower.includes('see you') || messageLower.includes('have a good')) {
      return 'final_goodbye';
    }

    // Check if user said thank you (might want to offer more help)
    if (messageLower.includes('thank') || messageLower.includes('thanks')) {
      return 'offer_additional_help';
    }

    // Check if user indicated they're done
    if (messageLower.includes('done') || messageLower.includes('that\'s all') || 
        messageLower.includes('finished') || messageLower.includes('nothing else')) {
      return 'satisfaction_check';
    }

    // If it's been a longer conversation, ask for feedback
    if (conversationLength > 8) {
      return 'feedback_request';
    }

    // Default general closing
    return 'general_closing';
  }

  /**
   * Handle satisfaction check
   */
  async handleSatisfactionCheck(message, session) {
    const conversationSummary = this.buildConversationSummary(session);
    
    const prompt = `You are a customer service closing agent. The user indicated they're done: "${message}"

Conversation summary: ${conversationSummary}

Respond by:
1. Acknowledging their completion
2. Briefly summarizing what was accomplished
3. Asking if they're satisfied with the assistance
4. Offering any final help
5. Providing a warm closing

Keep it professional but friendly.`;

    const response = await llmService.generateResponse(
      'closing',
      prompt, 
      {
        temperature: 0.7,
        max_tokens: 200
      },
      session.history || [] // Pass conversation history
    );

    return {
      message: response,
      context: { 
        closing_type: 'satisfaction_check',
        satisfaction_check_performed: true
      }
    };
  }

  /**
   * Handle feedback request
   */
  async handleFeedbackRequest(message, session) {
    const prompt = `You are a customer service closing agent. The conversation is ending: "${message}"

This has been a longer conversation. Politely:
1. Thank them for their time
2. Ask if there's anything else you can help with
3. Mention that their feedback is valuable for improving service
4. Provide contact information if they need future assistance
5. Give a warm closing

Keep it concise and appreciative.`;

    const response = await llmService.generateResponse(prompt, {
      agentType: 'closing',
      temperature: 0.7,
      max_tokens: 200
    });

    return {
      message: response,
      context: { 
        closing_type: 'feedback_request',
        feedback_requested: true
      }
    };
  }

  /**
   * Handle final goodbye
   */
  async handleFinalGoodbye(message, session) {
    const prompt = `The user is saying goodbye: "${message}"

Respond with a warm, professional farewell that:
1. Thanks them for contacting the call center
2. Wishes them well
3. Mentions they can contact again if needed
4. Ends on a positive note

Keep it brief and sincere.`;

    const response = await llmService.generateResponse(prompt, {
      agentType: 'closing',
      temperature: 0.8,
      max_tokens: 150
    });

    return {
      message: response,
      context: { 
        closing_type: 'final_goodbye',
        conversation_completed: true
      }
    };
  }

  /**
   * Handle offering additional help
   */
  async handleAdditionalHelp(message, session) {
    const prompt = `The user thanked you: "${message}"

Respond warmly by:
1. Acknowledging their thanks
2. Expressing that you were happy to help
3. Asking if there's anything else they need
4. Mentioning available services (appointments, HR, etc.)
5. Providing a friendly closing

Be helpful and check if they need anything else.`;

    const response = await llmService.generateResponse(prompt, {
      agentType: 'closing',
      temperature: 0.7,
      max_tokens: 200
    });

    return {
      message: response,
      context: { 
        closing_type: 'additional_help_offered',
        additional_help_offered: true
      }
    };
  }

  /**
   * Handle general closing
   */
  async handleGeneralClosing(message, session) {
    const prompt = `You are a customer service closing agent. The user said: "${message}"

This seems like a closing conversation. Respond appropriately by:
1. Acknowledging their message
2. Checking if they need anything else
3. Summarizing available services briefly
4. Providing a professional closing

Available services to mention: appointment scheduling, HR support, general inquiries.`;

    const response = await llmService.generateResponse(prompt, {
      agentType: 'closing',
      temperature: 0.7,
      max_tokens: 200
    });

    return {
      message: response,
      context: { 
        closing_type: 'general_closing',
        services_mentioned: true
      }
    };
  }

  /**
   * Build a summary of the conversation for context
   */
  buildConversationSummary(session) {
    if (!session.history || session.history.length === 0) {
      return "Brief conversation";
    }

    const topics = [];
    
    // Analyze conversation context
    if (session.context) {
      if (session.context.booking_confirmed || session.context.booking_in_progress) {
        topics.push("appointment scheduling");
      }
      if (session.context.query_type === 'hr' || session.context.information_provided) {
        topics.push("HR assistance");
      }
      if (session.context.greeted) {
        topics.push("general inquiry");
      }
    }

    if (topics.length === 0) {
      return "General assistance provided";
    }

    return `Assistance provided with: ${topics.join(', ')}`;
  }

  /**
   * Fallback closing when LLM service fails
   */
  getFallbackClosing() {
    const closings = [
      "Thank you for contacting us today! Is there anything else I can help you with? Have a wonderful day!",
      "It's been my pleasure assisting you. If you need anything else, please don't hesitate to reach out. Take care!",
      "Thank you for your time today. I hope I was able to help you with your questions. Feel free to contact us again if you need anything. Have a great day!"
    ];
    
    return closings[Math.floor(Math.random() * closings.length)];
  }

  /**
   * Check if a message indicates the user wants to end the conversation
   */
  isEndingMessage(message) {
    const endingKeywords = [
      'bye', 'goodbye', 'thank you', 'thanks', 'done', 'finished', 
      'that\'s all', 'nothing else', 'end', 'complete', 'see you later'
    ];
    
    const messageLower = message.toLowerCase();
    return endingKeywords.some(keyword => messageLower.includes(keyword));
  }

  /**
   * Generate a conversation summary for records
   */
  generateConversationSummary(session) {
    const summary = {
      session_id: session.id,
      duration_messages: session.history ? session.history.length : 0,
      topics_covered: [],
      services_used: [],
      satisfaction_checked: false,
      feedback_requested: false
    };

    // Analyze session context for summary
    if (session.context) {
      if (session.context.booking_confirmed) {
        summary.services_used.push('appointment_booking');
        summary.topics_covered.push('medical_appointment');
      }
      if (session.context.query_type === 'hr') {
        summary.services_used.push('hr_assistance');
        summary.topics_covered.push('hr_policy');
      }
      if (session.context.satisfaction_check_performed) {
        summary.satisfaction_checked = true;
      }
      if (session.context.feedback_requested) {
        summary.feedback_requested = true;
      }
    }

    return summary;
  }

  /**
   * Get agent information
   */
  getAgentInfo() {
    return {
      name: this.name,
      description: this.description,
      capabilities: [
        'Conversation wrap-up',
        'Satisfaction checks',
        'Final assistance offers',
        'Professional goodbyes',
        'Conversation summaries'
      ],
      closingTypes: [
        'satisfaction_check',
        'feedback_request',
        'final_goodbye',
        'additional_help_offer',
        'general_closing'
      ]
    };
  }
}

module.exports = new ClosingAgent();
