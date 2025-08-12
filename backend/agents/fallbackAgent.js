const llmService = require('../services/llmService');
const receptionistService = require('../services/llmService-receptionist');

/**
 * Fallback Agent - Handles unclear, unsupported, or problematic requests
 * This agent provides helpful responses when other agents cannot handle the request
 */
class FallbackAgent {
  constructor() {
    this.name = 'FallbackAgent';
    this.description = 'Handles unclear, unsupported, or unknown requests';
    
    // Available services to redirect to
    this.availableServices = {
      appointments: 'Doctor appointment scheduling and management',
      hr: 'HR policies, benefits, and employee support',
      general: 'General customer service inquiries'
    };
  }

  /**
   * Process unclear or unsupported messages
   * @param {string} message - User's message
   * @param {Object} session - Current conversation session
   * @returns {Promise<Object>} - Response object with message and context
   */
  async processMessage(message, session) {
    try {
      // First check if this is a medical/hospital-related query
      if (this.isMedicalOrHospitalQuery(message)) {
        console.log('🏥 Routing fallback to medical receptionist service');
        const response = await receptionistService.generateResponse(message, {
          conversationHistory: session.history || [],
          context: session.context || {}
        });
        
        return {
          message: response,
          agent: 'MedicalReceptionist',
          context: {
            medical_query_handled: true,
            department: session.context?.department || null
          }
        };
      }
      
      // Determine the type of fallback response needed
      const fallbackType = this.determineFallbackType(message, session);
      
      let response;
      let context = {};

      switch (fallbackType) {
        case 'unclear_request':
          response = await this.handleUnclearRequest(message, session);
          break;
        case 'unsupported_service':
          response = await this.handleUnsupportedService(message, session);
          break;
        case 'technical_issue':
          response = await this.handleTechnicalIssue(message, session);
          break;
        case 'redirect_to_human':
          response = await this.handleHumanRedirect(message, session);
          break;
        case 'language_barrier':
          response = await this.handleLanguageBarrier(message, session);
          break;
        default:
          response = await this.handleGeneralFallback(message, session);
      }

      return {
        message: response.message,
        agent: this.name,
        context: { 
          ...context, 
          ...response.context,
          fallback_handled: true
        }
      };
    } catch (error) {
      console.error(`❌ ${this.name} error:`, error);
      return {
        message: this.getEmergencyFallback(),
        agent: this.name,
        context: { error: true, emergency_fallback: true }
      };
    }
  }

  /**
   * Check if message is medical or hospital-related
   */
  isMedicalOrHospitalQuery(message) {
    if (!message || typeof message !== 'string') return false;
    
    const messageLower = message.toLowerCase();
    const medicalKeywords = [
      'doctor', 'appointment', 'hospital', 'medical', 'health', 'sick', 'pain', 
      'symptom', 'medicine', 'prescription', 'clinic', 'emergency', 'surgery',
      'diabetes', 'blood', 'heart', 'cancer', 'fever', 'headache', 'injury',
      'treatment', 'therapy', 'diagnosis', 'specialist', 'cardiology', 'neurology',
      'pediatrics', 'orthopedics', 'dermatology', 'urgent care', 'checkup'
    ];
    
    return medicalKeywords.some(keyword => messageLower.includes(keyword));
  }

  /**
   * Determine the type of fallback response needed
   * @param {string} message - User's message
   * @param {Object} session - Current session
   * @returns {string} - Fallback type
   */
  determineFallbackType(message, session) {
    const messageLower = message.toLowerCase();
    
    // Check for technical/system requests
    if (messageLower.includes('error') || messageLower.includes('bug') || 
        messageLower.includes('not working') || messageLower.includes('broken')) {
      return 'technical_issue';
    }

    // Check for requests to speak to human
    if (messageLower.includes('human') || messageLower.includes('person') || 
        messageLower.includes('representative') || messageLower.includes('manager') ||
        messageLower.includes('speak to someone')) {
      return 'redirect_to_human';
    }

    // Check for very short or unclear messages
    if (message.length < 3 || messageLower.match(/^[^a-z]*$/)) {
      return 'unclear_request';
    }

    // Check for potential language barriers (non-English content)
    if (this.detectNonEnglish(message)) {
      return 'language_barrier';
    }

    // Check for services we don't support
    if (this.isUnsupportedService(messageLower)) {
      return 'unsupported_service';
    }

    // Default to general fallback
    return 'general_fallback';
  }

  /**
   * Handle unclear or ambiguous requests
   */
  async handleUnclearRequest(message, session) {
    const prompt = `The user sent an unclear message: "${message}"

You are a helpful customer service agent. The message is unclear or too brief to understand what they need.

Respond by:
1. Politely acknowledging their message
2. Asking them to clarify what they need help with
3. Mentioning the main services available (appointments, HR, general support)
4. Encouraging them to be more specific

Be patient and helpful, not critical of their unclear message.`;

    const response = await llmService.generateResponse('fallback', prompt, {
      temperature: 0.7,
      max_tokens: 200
    });

    return {
      message: response,
      context: { 
        fallback_type: 'unclear_request',
        clarification_requested: true
      }
    };
  }

  /**
   * Handle requests for unsupported services
   */
  async handleUnsupportedService(message, session) {
    const prompt = `The user is asking about a service we don't currently support: "${message}"

You are a customer service agent. Respond by:
1. Acknowledging their request
2. Explaining that this specific service isn't available through this channel
3. Suggesting alternative ways they might get help (other departments, websites, etc.)
4. Redirecting to services you can help with (appointments, HR, general inquiries)

Be helpful and suggest alternatives where possible.`;

    const response = await llmService.generateResponse('fallback', prompt, {
      temperature: 0.7,
      max_tokens: 250
    });

    return {
      message: response,
      context: { 
        fallback_type: 'unsupported_service',
        alternatives_suggested: true
      }
    };
  }

  /**
   * Handle technical issues or system problems
   */
  async handleTechnicalIssue(message, session) {
    const prompt = `The user is reporting a technical issue: "${message}"

Respond as a helpful customer service agent by:
1. Acknowledging the technical issue
2. Apologizing for any inconvenience
3. Suggesting basic troubleshooting if appropriate
4. Providing alternative contact methods (phone, email)
5. Offering to help with other matters while they resolve the technical issue

Be empathetic and provide practical alternatives.`;

    const response = await llmService.generateResponse('fallback', prompt, {
      temperature: 0.6,
      max_tokens: 250
    });

    return {
      message: response,
      context: { 
        fallback_type: 'technical_issue',
        alternatives_provided: true
      }
    };
  }

  /**
   * Handle requests to speak with a human
   */
  async handleHumanRedirect(message, session) {
    const conversationSummary = this.buildConversationSummary(session);
    
    const prompt = `The user wants to speak with a human representative: "${message}"

Conversation context: ${conversationSummary}

Respond by:
1. Understanding their preference for human assistance
2. Providing contact information for speaking with a human
3. Explaining what information they should have ready
4. Offering to help with anything urgent while they wait
5. Being supportive of their choice

Contact information to provide:
- Phone: (555) 123-4567
- Email: support@company.com
- Office hours: Monday-Friday, 9:00 AM - 5:00 PM`;

    const response = await llmService.generateResponse('fallback', prompt, {
      temperature: 0.6,
      max_tokens: 250
    });

    return {
      message: response,
      context: { 
        fallback_type: 'human_redirect',
        human_contact_provided: true
      }
    };
  }

  /**
   * Handle potential language barrier issues
   */
  async handleLanguageBarrier(message, session) {
    const response = `I understand you may be more comfortable communicating in a different language. 

For assistance in languages other than English, please contact:
- Phone: (555) 123-4567 (multilingual support available)
- Email: support@company.com

Our phone support can assist you in Spanish, French, and several other languages during business hours (Monday-Friday, 9:00 AM - 5:00 PM).

If you'd like to continue in English, I'm happy to help with:
- Doctor appointments
- HR questions  
- General inquiries

Please let me know how you'd prefer to proceed.`;

    return {
      message: response,
      context: { 
        fallback_type: 'language_barrier',
        multilingual_options_provided: true
      }
    };
  }

  /**
   * Handle general fallback cases
   */
  async handleGeneralFallback(message, session) {
    const prompt = `The user sent a message that doesn't clearly fit our available services: "${message}"

You are a customer service agent. Respond by:
1. Acknowledging their message
2. Explaining what services you can help with
3. Asking them to clarify their needs
4. Being patient and helpful

Available services:
- Doctor appointment scheduling
- HR policy questions and support
- General customer service inquiries

Encourage them to rephrase their request or ask about one of these specific areas.`;

    const response = await llmService.generateResponse('fallback', prompt, {
      temperature: 0.7,
      max_tokens: 200
    });

    return {
      message: response,
      context: { 
        fallback_type: 'general_fallback',
        services_explained: true
      }
    };
  }

  /**
   * Build conversation summary for human redirect
   */
  buildConversationSummary(session) {
    if (!session.history || session.history.length === 0) {
      return "New conversation, no prior context.";
    }

    const topics = [];
    if (session.context) {
      if (session.context.booking_in_progress) topics.push("appointment booking");
      if (session.context.query_type === 'hr') topics.push("HR inquiry");
      if (session.context.greeted) topics.push("general assistance");
    }

    return topics.length > 0 
      ? `Previous topics discussed: ${topics.join(', ')}`
      : "General conversation in progress.";
  }

  /**
   * Detect if message might be in a non-English language
   */
  detectNonEnglish(message) {
    // Simple heuristic - look for non-ASCII characters or common non-English patterns
    const nonAsciiPattern = /[^\x00-\x7F]/;
    const commonNonEnglishWords = [
      'hola', 'bonjour', 'guten tag', 'ciao', 'konnichiwa', 
      'привет', 'مرحبا', '你好', 'namaste'
    ];
    
    if (nonAsciiPattern.test(message)) {
      return true;
    }
    
    const messageLower = message.toLowerCase();
    return commonNonEnglishWords.some(word => messageLower.includes(word));
  }

  /**
   * Check if request is for an unsupported service
   */
  isUnsupportedService(messageLower) {
    const unsupportedKeywords = [
      'billing', 'payment', 'invoice', 'account balance',
      'technical support', 'it help', 'password reset',
      'product return', 'shipping', 'delivery',
      'legal advice', 'financial advice', 'medical advice',
      'emergency', 'urgent medical', '911'
    ];
    
    return unsupportedKeywords.some(keyword => messageLower.includes(keyword));
  }

  /**
   * Emergency fallback when everything else fails
   */
  getEmergencyFallback() {
    return `I apologize, but I'm experiencing some technical difficulties right now. 

For immediate assistance, please contact our support team:
- Phone: (555) 123-4567
- Email: support@company.com
- Office Hours: Monday-Friday, 9:00 AM - 5:00 PM

For urgent matters, please call our main number. Thank you for your patience.`;
  }

  /**
   * Provide escalation options
   */
  getEscalationOptions() {
    return {
      phone: '(555) 123-4567',
      email: 'support@company.com',
      hours: 'Monday-Friday, 9:00 AM - 5:00 PM',
      emergency: 'For urgent medical matters, please contact your healthcare provider or call 911',
      supervisor: 'Ask to speak with a supervisor when calling'
    };
  }

  /**
   * Get agent information
   */
  getAgentInfo() {
    return {
      name: this.name,
      description: this.description,
      capabilities: [
        'Handle unclear requests',
        'Manage unsupported services',
        'Provide human escalation',
        'Technical issue guidance',
        'Language barrier assistance'
      ],
      fallbackTypes: [
        'unclear_request',
        'unsupported_service', 
        'technical_issue',
        'human_redirect',
        'language_barrier',
        'general_fallback'
      ],
      escalationOptions: this.getEscalationOptions()
    };
  }
}

module.exports = new FallbackAgent();
