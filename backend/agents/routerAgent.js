const llmService = require('../services/llmService');

/**
 * Router Agent - Intelligent request routing based on user intent
 * This agent classifies incoming requests and determines which specialized agent should handle them
 */
class RouterAgent {
  constructor() {
    this.name = 'RouterAgent';
    this.description = 'Classifies requests and routes to appropriate agents';
    this.availableAgents = {
      greeting: 'Handles welcome messages and general greetings',
      appointment: 'Manages doctor appointment scheduling and booking',
      hr: 'Answers HR policy questions, benefits, and employee support',
      closing: 'Handles conversation endings and goodbyes',
      fallback: 'Handles unclear or unsupported requests'
    };
  }

  /**
   * Process incoming message and determine routing
   * @param {string} message - User's message
   * @param {Object} session - Current conversation session
   * @returns {Promise<Object>} - Routing decision with target agent and processed message
   */
  async processMessage(message, session) {
    try {
      // Build context-aware routing prompt
      const prompt = this.buildRoutingPrompt(message, session);
      
      const response = await llmService.generateResponse(
        'router', 
        prompt, 
        {
          temperature: 0.3, // Lower temperature for more consistent routing decisions
          max_tokens: 100
        },
        session.history || [] // Pass conversation history
      );

      // Parse the JSON response
      const routingDecision = llmService.parseJSONResponse(response);
      
      // Validate routing decision
      const validatedDecision = this.validateRoutingDecision(routingDecision, message);
      
      console.log(`🎯 Router decision: ${validatedDecision.route_to} (${validatedDecision.message})`);
      
      return validatedDecision;
    } catch (error) {
      console.error(`❌ ${this.name} error:`, error);
      return this.getFallbackRouting(message);
    }
  }

  /**
   * Build a context-aware prompt for routing decisions
   * @param {string} message - User's message
   * @param {Object} session - Current session with history and context
   * @returns {string} - Formatted routing prompt
   */
  buildRoutingPrompt(message, session) {
    const conversationContext = this.buildConversationContext(session);
    
    return `You are an intelligent router for an AI call center system. Your job is to analyze the user's message and determine which specialized agent should handle their request.

Available agents and their responsibilities:
- "greeting": Welcome messages, general help requests, service overviews
- "appointment": Doctor appointment scheduling, booking, canceling, availability checks
- "hr": HR policies, employee benefits, leave requests, timesheet questions, company policies
- "closing": Conversation endings, goodbyes, thank you messages, satisfaction confirmations
- "fallback": Unclear requests, unsupported topics, when no other agent fits

User's current message: "${message}"

${conversationContext}


Respond with ONLY a JSON object in this exact format:
{"route_to": "agent_name", "message": "brief reason for routing"}

Example: {"route_to": "appointment", "message": "user wants to schedule appointment"}`;
  }

  /**
   * Build conversation context for better routing decisions
   * @param {Object} session - Current session
   * @returns {string} - Formatted context string
   */
  buildConversationContext(session) {
    if (!session.history || session.history.length === 0) {
      return "This is the first message in the conversation.";
    }

    const recentMessages = session.history.slice(-4); // Last 4 messages for context
    const contextLines = recentMessages.map(msg => 
      `${msg.role}: "${msg.content}"`
    ).join('\n');

    return `Recent conversation context:
${contextLines}

Current agent: ${session.currentAgent || 'none'}
Session context: ${JSON.stringify(session.context || {})}`;
  }

  /**
   * Validate and ensure routing decision is correct
   * @param {Object} decision - Parsed routing decision
   * @param {string} originalMessage - Original user message for fallback analysis
   * @returns {Object} - Validated routing decision
   */
  validateRoutingDecision(decision, originalMessage) {
    // Check if decision has required fields
    if (!decision.route_to || !this.availableAgents[decision.route_to]) {
      console.warn('⚠️  Invalid routing decision, using rule-based fallback');
      return this.getRuleBasedRouting(originalMessage);
    }

    // Ensure message field exists
    if (!decision.message) {
      decision.message = `routed to ${decision.route_to}`;
    }

    return decision;
  }

  /**
   * Rule-based routing fallback when LLM routing fails
   * @param {string} message - User's message
   * @returns {Object} - Routing decision based on keywords
   */
  getRuleBasedRouting(message) {
    const messageLower = message.toLowerCase();

    // Appointment keywords
    if (this.containsKeywords(messageLower, [
      'appointment', 'doctor', 'schedule', 'book', 'available', 'slot', 
      'medical', 'visit', 'consultation', 'dr.', 'physician'
    ])) {
      return { route_to: 'appointment', message: 'appointment-related keywords detected' };
    }

    // HR keywords
    if (this.containsKeywords(messageLower, [
      'hr', 'human resources', 'policy', 'leave', 'vacation', 'sick day',
      'benefits', 'insurance', 'timesheet', 'payroll', 'employee', 'handbook'
    ])) {
      return { route_to: 'hr', message: 'hr-related keywords detected' };
    }

    // Closing keywords
    if (this.containsKeywords(messageLower, [
      'bye', 'goodbye', 'thank you', 'thanks', 'done', 'finished', 
      'end', 'that\'s all', 'have a good'
    ])) {
      return { route_to: 'closing', message: 'conversation ending detected' };
    }

    // Greeting keywords
    if (this.containsKeywords(messageLower, [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 
      'help', 'start', 'greetings'
    ])) {
      return { route_to: 'greeting', message: 'greeting or help request detected' };
    }

    // Default to fallback
    return { route_to: 'fallback', message: 'no clear intent detected' };
  }

  /**
   * Check if message contains any of the specified keywords
   * @param {string} message - Message to check
   * @param {Array<string>} keywords - Keywords to look for
   * @returns {boolean} - Whether any keyword was found
   */
  containsKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Fallback routing when all else fails
   * @param {string} message - User's message
   * @returns {Object} - Fallback routing decision
   */
  getFallbackRouting(message) {
    return {
      route_to: 'fallback',
      message: 'routing system error - using fallback'
    };
  }

  /**
   * Get routing statistics for analytics
   * @returns {Object} - Available agents and their descriptions
   */
  getRoutingInfo() {
    return {
      name: this.name,
      description: this.description,
      availableAgents: this.availableAgents,
      routingMethod: 'LLM-based with rule-based fallback'
    };
  }
}

module.exports = new RouterAgent();
