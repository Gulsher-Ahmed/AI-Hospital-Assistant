const llmService = require('../services/llmService');
const receptionistService = require('../services/llmService-receptionist');
const DatabaseService = require('../services/databaseService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Appointment Scheduler Agent - Manages doctor appointment booking and scheduling
 * This agent handles all appointment-related requests including availability checks and bookings
 */
class AppointmentAgent {
  constructor() {
    this.name = 'AppointmentAgent';
    this.description = 'Manages doctor appointment scheduling and booking';
    this.dataPath = path.join(__dirname, '../data/appointments.json');
    this.database = DatabaseService;
  }

  /**
   * Process appointment-related messages
   * @param {string} message - User's message
   * @param {Object} session - Current conversation session
   * @returns {Promise<Object>} - Response object with message and context
   */
  async processMessage(message, session) {
    try {
      console.log('🏥 AppointmentAgent processing:', message);
      
      // Use the enhanced medical receptionist service for appointment-related queries
      const response = await receptionistService.generateResponse(message, {
        conversationHistory: session.history || [],
        context: session.context || {},
        department: session.context?.department || null,
        appointmentContext: true
      });
      
      // Check if this should return appointment slots
      const shouldShowSlots = this.shouldReturnAppointmentSlots(message, session);
      
      if (shouldShowSlots) {
        // Generate appointment slots using the receptionist service
        const slots = receptionistService.generateContextualAppointmentSlots(
          session.context?.preferredDepartment || 'General Practice',
          session.context?.urgencyLevel || 'routine'
        );
        
        return {
          message: response,
          agent: this.name,
          context: { 
            appointment_slots_provided: true,
            department: session.context?.preferredDepartment || 'General Practice'
          },
          slots: slots // Add slots for frontend to display
        };
      }
      
      return {
        message: response,
        agent: this.name,
        context: { 
          appointment_query_handled: true,
          department: session.context?.department || null
        }
      };
    } catch (error) {
      console.error(`❌ ${this.name} error:`, error);
      return {
        message: "I apologize, but I'm having trouble accessing the appointment system right now. Please try again in a moment or contact our office directly.",
        agent: this.name,
        context: { error: true }
      };
    }
  }

  /**
   * Check if we should return appointment slots
   */
  shouldReturnAppointmentSlots(message, session) {
    const messageLower = message.toLowerCase();
    const recentHistory = session.history?.slice(-4) || [];
    
    // Show slots if user has specified a department or doctor type
    const hasDepartmentContext = session.context?.preferredDepartment || 
                                 messageLower.includes('cardiologist') ||
                                 messageLower.includes('neurologist') ||
                                 messageLower.includes('pediatrician') ||
                                 messageLower.includes('dermatologist') ||
                                 messageLower.includes('orthopedic');
    
    // Show slots if conversation has progressed enough
    const hasEnoughContext = recentHistory.length >= 2;
    
    // Show slots for direct appointment requests
    const isDirectRequest = messageLower.includes('book') || 
                           messageLower.includes('schedule') || 
                           messageLower.includes('appointment') ||
                           messageLower.includes('see a doctor');
    
    return hasDepartmentContext && (hasEnoughContext || isDirectRequest);
  }

  /**
   * Determine the type of appointment request
   * @param {string} message - User's message
   * @returns {string} - Request type
   */
  determineRequestType(message) {
    const messageLower = message.toLowerCase();

    if (messageLower.includes('available') || messageLower.includes('slots') || 
        messageLower.includes('free') || messageLower.includes('open')) {
      return 'check_availability';
    }
    
    if (messageLower.includes('book') || messageLower.includes('schedule') || 
        messageLower.includes('make appointment') || messageLower.includes('reserve')) {
      return 'book_appointment';
    }
    
    if (messageLower.includes('cancel') || messageLower.includes('delete')) {
      return 'cancel_appointment';
    }
    
    if (messageLower.includes('reschedule') || messageLower.includes('change') || 
        messageLower.includes('move')) {
      return 'reschedule_appointment';
    }
    
    return 'general_query';
  }

  /**
   * Handle availability check requests
   */
  async handleAvailabilityCheck(message, appointmentData, session) {
    const prompt = `You are an appointment scheduling assistant. The user asked: "${message}"

Available doctors and their slots:
${this.formatAvailableSlots(appointmentData.doctors)}

Provide a helpful response showing available appointments. Be specific about doctors, dates, and times. Ask if they'd like to book any of these slots.

Keep your response conversational and helpful.`;

    const response = await llmService.generateResponse(
      'appointment', 
      prompt, 
      {
        temperature: 0.7,
        max_tokens: 300
      },
      session.history || [] // Pass conversation history
    );

    return {
      message: response,
      context: { 
        requested_availability: true,
        available_doctors: appointmentData.doctors.map(d => d.name)
      }
    };
  }

  /**
   * Handle booking requests
   */
  async handleBookingRequest(message, appointmentData, session) {
    // Extract potential booking details from message
    const bookingDetails = this.extractBookingDetails(message);
    
    if (!bookingDetails.doctor || !bookingDetails.slot) {
      // Need more information
      const prompt = `The user wants to book an appointment: "${message}"

Available options:
${this.formatAvailableSlots(appointmentData.doctors)}

The user hasn't specified a complete doctor and time slot. Ask them to choose a specific doctor and time slot from the available options. Be helpful and specific.`;

      const response = await llmService.generateResponse(
        'appointment', 
        prompt, 
        {
          temperature: 0.7,
          max_tokens: 250
        },
        session.history || [] // Pass conversation history
      );

      return {
        message: response,
        context: { 
          booking_in_progress: true,
          needs_details: ['doctor', 'slot', 'patient_name']
        }
      };
    }

    // If we have enough details, confirm the booking
    const confirmationMessage = await this.confirmBooking(bookingDetails, appointmentData);
    
    return {
      message: confirmationMessage,
      context: { 
        booking_confirmed: true,
        booking_details: bookingDetails
      }
    };
  }

  /**
   * Handle cancellation requests
   */
  async handleCancellationRequest(message, appointmentData, session) {
    const response = await llmService.generateResponse(
      'appointment',
      `The user wants to cancel an appointment: "${message}"
      
      Respond helpfully asking for their name and appointment details so you can help them cancel. Mention that they need to provide cancellation notice as per policy.`,
      { max_tokens: 200 },
      session.history || [] // Pass conversation history
    );

    return {
      message: response,
      context: { cancellation_requested: true }
    };
  }

  /**
   * Handle reschedule requests
   */
  async handleRescheduleRequest(message, appointmentData, session) {
    const prompt = `The user wants to reschedule an appointment: "${message}"

Available new slots:
${this.formatAvailableSlots(appointmentData.doctors)}

Ask for their current appointment details and help them choose a new time from the available slots.`;

    const response = await llmService.generateResponse(
      'appointment', 
      prompt, 
      {
        temperature: 0.7,
        max_tokens: 250
      },
      session.history || [] // Pass conversation history
    );

    return {
      message: response,
      context: { reschedule_requested: true }
    };
  }

  /**
   * Handle general appointment queries
   */
  async handleGeneralAppointmentQuery(message, appointmentData, session) {
    const prompt = `You are an appointment scheduling assistant. The user said: "${message}"

Available services:
- Check appointment availability
- Book new appointments
- Cancel existing appointments
- Reschedule appointments

Current available doctors: ${appointmentData.doctors.map(d => d.name).join(', ')}

Respond helpfully and ask how you can assist with their appointment needs.`;

    const response = await llmService.generateResponse(
      'appointment', 
      prompt, 
      {
        temperature: 0.7,
        max_tokens: 200
      },
      session.history || [] // Pass conversation history
    );

    return {
      message: response,
      context: { general_appointment_query: true }
    };
  }

  /**
   * Format available slots for display
   */
  formatAvailableSlots(doctors) {
    return doctors.map(doctor => {
      const slots = doctor.available_slots.slice(0, 3); // Show first 3 slots
      return `${doctor.name} (${doctor.specialty}): ${slots.join(', ')}${doctor.available_slots.length > 3 ? '...' : ''}`;
    }).join('\n');
  }

  /**
   * Extract booking details from message
   */
  extractBookingDetails(message) {
    const details = {
      doctor: null,
      slot: null,
      patient_name: null
    };

    // Simple extraction - in production, use more sophisticated NLP
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('dr. smith') || messageLower.includes('dr smith')) {
      details.doctor = 'Dr. Smith';
    } else if (messageLower.includes('dr. khan') || messageLower.includes('dr khan')) {
      details.doctor = 'Dr. Khan';
    } else if (messageLower.includes('dr. johnson') || messageLower.includes('dr johnson')) {
      details.doctor = 'Dr. Johnson';
    } else if (messageLower.includes('dr. williams') || messageLower.includes('dr williams')) {
      details.doctor = 'Dr. Williams';
    }

    // Extract time patterns (basic)
    const timePattern = /\d{1,2}:\d{2}/;
    const timeMatch = message.match(timePattern);
    if (timeMatch) {
      details.slot = timeMatch[0];
    }

    return details;
  }

  /**
   * Confirm booking (mock implementation)
   */
  async confirmBooking(bookingDetails, appointmentData) {
    // In a real system, this would update the database
    return `Perfect! I'd be happy to book your appointment with ${bookingDetails.doctor} for ${bookingDetails.slot}. 

To complete the booking, I'll need your full name. Once you provide that, I'll confirm your appointment and send you the details.

Please note: Appointments can be cancelled with 24 hours notice if needed.`;
  }

  /**
   * Load appointment data from JSON file
   */
  async loadAppointmentData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading appointment data:', error);
      // Return mock data if file can't be read
      return this.getMockAppointmentData();
    }
  }

  /**
   * Get mock appointment data as fallback
   */
  getMockAppointmentData() {
    return {
      doctors: [
        {
          id: 'dr-smith',
          name: 'Dr. Smith',
          specialty: 'General Medicine',
          available_slots: ['2025-08-09 10:00', '2025-08-09 14:00', '2025-08-10 09:00']
        },
        {
          id: 'dr-khan',
          name: 'Dr. Khan',
          specialty: 'Cardiology',
          available_slots: ['2025-08-09 09:00', '2025-08-09 13:00', '2025-08-10 10:00']
        }
      ]
    };
  }

  /**
   * Public method to get available appointments (for API endpoint)
   */
  async getAvailableAppointments() {
    const data = await this.loadAppointmentData();
    return data.doctors;
  }

  /**
   * Public method to book an appointment (for API endpoint)
   */
  async bookAppointment(doctor, slot, patientName) {
    try {
      const data = await this.loadAppointmentData();
      
      // Find the doctor
      const doctorData = data.doctors.find(d => d.name === doctor);
      if (!doctorData) {
        return { success: false, message: 'Doctor not found' };
      }

      // Check if slot is available
      if (!doctorData.available_slots.includes(slot)) {
        return { success: false, message: 'Time slot not available' };
      }

      // In a real system, this would update the database
      // For now, just return success
      return {
        success: true,
        message: `Appointment booked successfully for ${patientName} with ${doctor} at ${slot}`,
        appointment: {
          doctor,
          slot,
          patientName,
          confirmationNumber: 'CONF-' + Date.now()
        }
      };
    } catch (error) {
      console.error('Booking error:', error);
      return { success: false, message: 'Failed to book appointment' };
    }
  }

  /**
   * Get agent information
   */
  getAgentInfo() {
    return {
      name: this.name,
      description: this.description,
      capabilities: [
        'Check appointment availability',
        'Book new appointments',
        'Cancel appointments',
        'Reschedule appointments',
        'Provide doctor information'
      ],
      supportedActions: [
        'availability_check',
        'booking',
        'cancellation',
        'rescheduling'
      ]
    };
  }
}

module.exports = new AppointmentAgent();
