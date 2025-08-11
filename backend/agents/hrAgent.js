const llmService = require('../services/llmService');

/**
 * HR Agent - Handles human resources queries and employee support
 * This agent provides information about company policies, benefits, and HR procedures
 */
class HRAgent {
  constructor() {
    this.name = 'HRAgent';
    this.description = 'Handles HR policy questions, benefits, and employee support';
    
    // Mock HR knowledge base
    this.hrPolicies = {
      leave: {
        vacation: "Employees receive 20 days of paid vacation per year. Vacation time accrues monthly and can be carried over up to 5 days to the next year.",
        sick: "10 sick days per year are provided. Sick leave can be used for personal illness or caring for immediate family members.",
        personal: "3 personal days per year for personal matters that cannot be scheduled outside work hours.",
        parental: "12 weeks of paid parental leave for new parents, both biological and adoptive."
      },
      benefits: {
        health: "Comprehensive health insurance including medical, dental, and vision. Company covers 80% of premiums.",
        retirement: "401(k) plan with 4% company match. Vesting occurs immediately.",
        life: "Basic life insurance equal to 2x annual salary provided at no cost.",
        disability: "Short-term and long-term disability insurance available."
      },
      timesheet: {
        submission: "Timesheets must be submitted weekly by Friday 5 PM through the employee portal.",
        overtime: "Overtime must be pre-approved by your manager. Time and a half pay for hours over 40 per week.",
        remote: "Remote work hours should be logged the same as office hours."
      },
      policies: {
        dress_code: "Business casual attire. Remote workers should dress appropriately for video calls.",
        remote_work: "Hybrid work policy allows up to 3 days remote per week with manager approval.",
        harassment: "Zero tolerance policy for harassment. Report incidents to HR immediately.",
        training: "Annual mandatory training includes harassment prevention, security awareness, and safety."
      }
    };
  }

  /**
   * Process HR-related messages
   * @param {string} message - User's message
   * @param {Object} session - Current conversation session
   * @returns {Promise<Object>} - Response object with message and context
   */
  async processMessage(message, session) {
    try {
      // Determine the type of HR query
      const queryType = this.determineQueryType(message);
      
      let response;
      let context = {};

      switch (queryType) {
        case 'leave_policy':
          response = await this.handleLeaveQuery(message, session);
          break;
        case 'benefits':
          response = await this.handleBenefitsQuery(message, session);
          break;
        case 'timesheet':
          response = await this.handleTimesheetQuery(message, session);
          break;
        case 'company_policy':
          response = await this.handlePolicyQuery(message, session);
          break;
        case 'contact_hr':
          response = await this.handleContactRequest(message, session);
          break;
        default:
          response = await this.handleGeneralHRQuery(message, session);
      }

      return {
        message: response.message,
        agent: this.name,
        context: { ...context, ...response.context }
      };
    } catch (error) {
      console.error(`❌ ${this.name} error:`, error);
      return {
        message: "I apologize, but I'm having trouble accessing the HR information right now. Please contact HR directly at hr@company.com or extension 1234 for immediate assistance.",
        agent: this.name,
        context: { error: true }
      };
    }
  }

  /**
   * Determine the type of HR query
   * @param {string} message - User's message
   * @returns {string} - Query type
   */
  determineQueryType(message) {
    const messageLower = message.toLowerCase();

    if (messageLower.includes('leave') || messageLower.includes('vacation') || 
        messageLower.includes('sick day') || messageLower.includes('time off') ||
        messageLower.includes('pto') || messageLower.includes('parental leave')) {
      return 'leave_policy';
    }
    
    if (messageLower.includes('benefits') || messageLower.includes('insurance') || 
        messageLower.includes('401k') || messageLower.includes('health') ||
        messageLower.includes('dental') || messageLower.includes('retirement')) {
      return 'benefits';
    }
    
    if (messageLower.includes('timesheet') || messageLower.includes('hours') || 
        messageLower.includes('overtime') || messageLower.includes('time tracking')) {
      return 'timesheet';
    }
    
    if (messageLower.includes('policy') || messageLower.includes('handbook') || 
        messageLower.includes('dress code') || messageLower.includes('remote work') ||
        messageLower.includes('harassment') || messageLower.includes('training')) {
      return 'company_policy';
    }
    
    if (messageLower.includes('contact hr') || messageLower.includes('speak to hr') || 
        messageLower.includes('hr department') || messageLower.includes('hr representative')) {
      return 'contact_hr';
    }
    
    return 'general_hr';
  }

  /**
   * Handle leave policy queries
   */
  async handleLeaveQuery(message, session) {
    const leaveInfo = this.getRelevantLeaveInfo(message);
    
    const prompt = `You are an HR assistant. The user asked about leave policies: "${message}"

Available leave information:
${leaveInfo}

Provide a helpful response about the leave policy. Be specific about the details and mention how to request leave through the employee portal or by contacting HR.

Keep your response informative but conversational.`;

    const response = await llmService.generateResponse(
      'hr',
      prompt, 
      {
        temperature: 0.6,
        max_tokens: 300
      },
      session.history || [] // Pass conversation history
    );

    return {
      message: response,
      context: { 
        query_type: 'leave_policy',
        information_provided: true
      }
    };
  }

  /**
   * Handle benefits queries
   */
  async handleBenefitsQuery(message, session) {
    const benefitsInfo = this.getRelevantBenefitsInfo(message);
    
    const prompt = `You are an HR assistant. The user asked about benefits: "${message}"

Benefits information:
${benefitsInfo}

Provide a helpful response about the benefits. Mention enrollment periods and how to access more detailed information.

Keep your response informative and helpful.`;

    const response = await llmService.generateResponse(
      'hr',
      prompt, 
      {
        temperature: 0.6,
        max_tokens: 300
      },
      session.history || [] // Pass conversation history
    );

    return {
      message: response,
      context: { 
        query_type: 'benefits',
        information_provided: true
      }
    };
  }

  /**
   * Handle timesheet queries
   */
  async handleTimesheetQuery(message, session) {
    const timesheetInfo = Object.values(this.hrPolicies.timesheet).join('\n');
    
    const prompt = `You are an HR assistant. The user asked about timesheets: "${message}"

Timesheet policies:
${timesheetInfo}

Provide helpful guidance about timesheet submission, deadlines, and procedures. Mention the employee portal and any relevant contact information.`;

    const response = await llmService.generateResponse(
      'hr',
      prompt, 
      {
        temperature: 0.6,
        max_tokens: 250
      },
      session.history || [] // Pass conversation history
    );

    return {
      message: response,
      context: { 
        query_type: 'timesheet',
        information_provided: true
      }
    };
  }

  /**
   * Handle company policy queries
   */
  async handlePolicyQuery(message, session) {
    const policyInfo = this.getRelevantPolicyInfo(message);
    
    const prompt = `You are an HR assistant. The user asked about company policies: "${message}"

Relevant policy information:
${policyInfo}

Provide helpful information about the policy. Mention where they can find the complete employee handbook and any relevant procedures.`;

    const response = await llmService.generateResponse(
      'hr',
      prompt, 
      {
        temperature: 0.6,
        max_tokens: 300
      },
      session.history || [] // Pass conversation history
    );

    return {
      message: response,
      context: { 
        query_type: 'company_policy',
        information_provided: true
      }
    };
  }

  /**
   * Handle requests to contact HR directly
   */
  async handleContactRequest(message, session) {
    const contactInfo = `
HR Department Contact Information:
- Email: hr@company.com
- Phone: (555) 123-4567
- Extension: 1234
- Office Hours: Monday-Friday, 9:00 AM - 5:00 PM
- Office Location: Building A, 2nd Floor, Room 205

For urgent matters outside business hours, you can leave a voicemail or send an email, and we'll respond within 24 hours.`;

    const prompt = `The user wants to contact HR directly: "${message}"

${contactInfo}

Provide the contact information and ask if there's anything specific you can help them with first before they contact HR directly.`;

    const response = await llmService.generateResponse(
      'hr',
      prompt, 
      {
        temperature: 0.6,
        max_tokens: 200
      },
      session.history || [] // Pass conversation history
    );

    return {
      message: response,
      context: { 
        query_type: 'contact_hr',
        contact_info_provided: true
      }
    };
  }

  /**
   * Handle general HR queries
   */
  async handleGeneralHRQuery(message, session) {
    const prompt = `You are an HR assistant. The user has an HR-related question: "${message}"

You can help with:
- Leave policies (vacation, sick leave, personal days)
- Benefits information (health insurance, 401k, life insurance)
- Timesheet and hour tracking questions
- Company policies and procedures
- HR contact information

Respond helpfully and ask what specific HR topic they need assistance with.`;

    const response = await llmService.generateResponse(
      'hr',
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
        query_type: 'general_hr',
        assistance_offered: true
      }
    };
  }

  /**
   * Get relevant leave information based on message content
   */
  getRelevantLeaveInfo(message) {
    const messageLower = message.toLowerCase();
    let info = [];

    if (messageLower.includes('vacation') || messageLower.includes('pto')) {
      info.push(`Vacation Leave: ${this.hrPolicies.leave.vacation}`);
    }
    if (messageLower.includes('sick')) {
      info.push(`Sick Leave: ${this.hrPolicies.leave.sick}`);
    }
    if (messageLower.includes('personal')) {
      info.push(`Personal Days: ${this.hrPolicies.leave.personal}`);
    }
    if (messageLower.includes('parental') || messageLower.includes('maternity') || messageLower.includes('paternity')) {
      info.push(`Parental Leave: ${this.hrPolicies.leave.parental}`);
    }

    // If no specific leave type mentioned, provide all
    if (info.length === 0) {
      info = Object.values(this.hrPolicies.leave).map((policy, index) => {
        const types = ['Vacation', 'Sick', 'Personal', 'Parental'];
        return `${types[index]}: ${policy}`;
      });
    }

    return info.join('\n\n');
  }

  /**
   * Get relevant benefits information based on message content
   */
  getRelevantBenefitsInfo(message) {
    const messageLower = message.toLowerCase();
    let info = [];

    if (messageLower.includes('health') || messageLower.includes('medical') || 
        messageLower.includes('dental') || messageLower.includes('vision')) {
      info.push(`Health Benefits: ${this.hrPolicies.benefits.health}`);
    }
    if (messageLower.includes('401k') || messageLower.includes('retirement')) {
      info.push(`Retirement Plan: ${this.hrPolicies.benefits.retirement}`);
    }
    if (messageLower.includes('life insurance')) {
      info.push(`Life Insurance: ${this.hrPolicies.benefits.life}`);
    }
    if (messageLower.includes('disability')) {
      info.push(`Disability Insurance: ${this.hrPolicies.benefits.disability}`);
    }

    // If no specific benefit mentioned, provide overview
    if (info.length === 0) {
      info = Object.values(this.hrPolicies.benefits).map((benefit, index) => {
        const types = ['Health Insurance', 'Retirement (401k)', 'Life Insurance', 'Disability Insurance'];
        return `${types[index]}: ${benefit}`;
      });
    }

    return info.join('\n\n');
  }

  /**
   * Get relevant policy information based on message content
   */
  getRelevantPolicyInfo(message) {
    const messageLower = message.toLowerCase();
    let info = [];

    if (messageLower.includes('dress') || messageLower.includes('attire')) {
      info.push(`Dress Code: ${this.hrPolicies.policies.dress_code}`);
    }
    if (messageLower.includes('remote') || messageLower.includes('work from home')) {
      info.push(`Remote Work: ${this.hrPolicies.policies.remote_work}`);
    }
    if (messageLower.includes('harassment')) {
      info.push(`Harassment Policy: ${this.hrPolicies.policies.harassment}`);
    }
    if (messageLower.includes('training')) {
      info.push(`Training Requirements: ${this.hrPolicies.policies.training}`);
    }

    // If no specific policy mentioned, provide overview
    if (info.length === 0) {
      info = Object.values(this.hrPolicies.policies).map((policy, index) => {
        const types = ['Dress Code', 'Remote Work', 'Harassment Policy', 'Training'];
        return `${types[index]}: ${policy}`;
      });
    }

    return info.join('\n\n');
  }

  /**
   * Get agent information
   */
  getAgentInfo() {
    return {
      name: this.name,
      description: this.description,
      capabilities: [
        'Leave policy information',
        'Benefits explanations',
        'Timesheet procedures',
        'Company policy guidance',
        'HR contact information'
      ],
      supportedTopics: [
        'vacation_leave',
        'sick_leave',
        'benefits',
        'timesheets',
        'company_policies',
        'hr_contact'
      ]
    };
  }
}

module.exports = new HRAgent();
