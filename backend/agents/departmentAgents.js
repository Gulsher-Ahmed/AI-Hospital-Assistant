/**
 * Department-Specific AI Agents
 * Each department has specialized knowledge and conversation patterns
 */

const HospitalDatabase = require('../database/hospitalDB');

class DepartmentAgents {
    constructor(llmService) {
        this.llmService = llmService;
        this.hospitalDB = new HospitalDatabase();
    }

    // Route message to appropriate department agent
    async routeToSpecialist(message, context = {}) {
        try {
            // Detect department from message
            const department = this.hospitalDB.detectDepartment(message);
            
            if (department) {
                return await this.handleDepartmentQuery(message, department, context);
            }
            
            // If no specific department detected, use general medical AI
            return await this.handleGeneralMedical(message, context);
            
        } catch (error) {
            console.error('Error routing to specialist:', error);
            return {
                type: 'error',
                message: "I'm having trouble processing your request. Please try again or contact our support team.",
                department: null
            };
        }
    }

    // Handle department-specific queries
    async handleDepartmentQuery(message, department, context) {
        try {
            // Get specialized prompt for this department
            const departmentPrompt = this.hospitalDB.getDepartmentPrompt(department.id);
            
            // Check if user wants appointments
            const needsAppointment = this.detectAppointmentIntent(message);
            
            let response = {
                type: 'medical_response',
                department: department,
                message: '',
                showAppointments: needsAppointment,
                appointments: []
            };

            if (needsAppointment) {
                // Get available appointments for this department
                const appointments = this.hospitalDB.getAvailableAppointments(department.id, 6);
                response.appointments = appointments;
            }

            // Generate AI response using department-specific prompt
            const aiPrompt = `Answer this ${department.name} question in 1-2 sentences:

"${message}"

${needsAppointment ? 
'Briefly mention appointments available and key medical info.' : 
'Give essential medical information only.'}

Be concise and professional.`;

            const aiResponse = await this.llmService.generateResponse(aiPrompt);
            response.message = aiResponse;

            return response;

        } catch (error) {
            console.error('Error in department query:', error);
            return this.getErrorResponse();
        }
    }

    // Handle general medical queries
    async handleGeneralMedical(message, context) {
        try {
            // Handle exact button messages with very brief responses
            if (message === 'Hospital Services') {
                return {
                    type: 'general_medical',
                    department: null,
                    message: "We offer emergency care, surgery, cardiology, neurology, pediatrics, and diagnostic imaging.",
                    showAppointments: false,
                    appointments: [],
                    suggestedDepartments: this.suggestDepartments('services')
                };
            } else if (message === 'Book an Appointment') {
                const currentDate = new Date();
                const today = currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                });
                const tomorrow = new Date(currentDate);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowString = tomorrow.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                return {
                    type: 'general_medical',
                    department: null,
                    message: `Available today (${today}): 2:00 PM Cardiology, 4:00 PM Dermatology. Tomorrow (${tomorrowString}): 9:00 AM Neurology. Call (555) 123-4567 to book.`,
                    showAppointments: true,
                    appointments: this.hospitalDB.getAvailableAppointments(null, 4),
                    suggestedDepartments: []
                };
            } else if (message === 'Emergency Help') {
                return {
                    type: 'general_medical',
                    department: null,
                    message: "For emergencies: Call 911 or visit our ER. For urgent care: (555) 911-HELP.",
                    showAppointments: false,
                    appointments: [],
                    suggestedDepartments: []
                };
            } else if (message === 'Find a Specialist') {
                return {
                    type: 'general_medical',
                    department: null,
                    message: "Our specialists: Cardiology, Neurology, Dermatology, Pediatrics. Call (555) 123-4567.",
                    showAppointments: false,
                    appointments: [],
                    suggestedDepartments: this.suggestDepartments('specialist')
                };
            }

            const needsAppointment = this.detectAppointmentIntent(message);
            
            let response = {
                type: 'general_medical',
                department: null,
                message: '',
                showAppointments: needsAppointment,
                appointments: [],
                suggestedDepartments: []
            };

            if (needsAppointment) {
                // Get general appointments from all departments
                response.appointments = this.hospitalDB.getAvailableAppointments(null, 6);
            }

            // Suggest relevant departments based on keywords
            response.suggestedDepartments = this.suggestDepartments(message);

            const aiPrompt = `Answer this hospital query in 1-2 sentences only:

"${message}"

${needsAppointment ? 
'Briefly mention appointments are available and ask what department they need.' : 
'Give a brief, direct answer.'}

Be concise and professional.`;

            const aiResponse = await this.llmService.generateResponse(aiPrompt);
            response.message = aiResponse;

            return response;

        } catch (error) {
            console.error('Error in general medical query:', error);
            return this.getErrorResponse();
        }
    }

    // Detect if user wants to book an appointment
    detectAppointmentIntent(message) {
        const appointmentKeywords = [
            'appointment', 'book', 'schedule', 'see doctor', 'visit', 
            'consultation', 'checkup', 'meet', 'available slots',
            'when can i', 'doctor available', 'appointment available'
        ];
        
        const messageLower = message.toLowerCase();
        return appointmentKeywords.some(keyword => messageLower.includes(keyword));
    }

    // Suggest relevant departments
    suggestDepartments(message) {
        const suggestions = [];
        const messageLower = message.toLowerCase();
        
        // Find departments with matching keywords
        this.hospitalDB.getAllDepartments().forEach(dept => {
            const matchCount = dept.keywords.filter(keyword => 
                messageLower.includes(keyword)
            ).length;
            
            if (matchCount > 0) {
                suggestions.push({
                    ...dept,
                    relevance: matchCount
                });
            }
        });
        
        // Sort by relevance and return top 3
        return suggestions
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 3);
    }

    // Handle emergency queries
    async handleEmergency(message, context) {
        return {
            type: 'emergency',
            message: `🚨 **EMERGENCY DETECTED** 🚨

If this is a life-threatening emergency, please:
- Call 911 immediately
- Go to the nearest emergency room
- Contact emergency services

For urgent but non-life-threatening concerns:
- Visit our Emergency Department at City General Hospital
- Call our emergency hotline: (555) 123-HELP

Our emergency department is open 24/7 and equipped to handle all medical emergencies.

**Location**: 123 Health Street, Medical District
**Emergency Contact**: (555) 911-HELP`,
            priority: 'high',
            showEmergencyContacts: true
        };
    }

    // Handle greeting messages
    async handleGreeting(message, context) {
        const greetingPrompts = [
            "Hello! I'm your AI medical assistant at City General Hospital. How can I help you today?",
            "Hi there! Welcome to City General Hospital. I'm here to assist you with medical questions or appointment booking.",
            "Good day! I'm your healthcare AI assistant. Whether you have medical questions or need to schedule an appointment, I'm here to help.",
            "Hello and welcome! I can help you with medical information, appointment scheduling, or direct you to the right specialist."
        ];
        
        const randomGreeting = greetingPrompts[Math.floor(Math.random() * greetingPrompts.length)];
        
        return {
            type: 'greeting',
            message: randomGreeting,
            showDepartments: true,
            departments: this.hospitalDB.getAllDepartments().slice(0, 4), // Show first 4 departments
            showQuickActions: true
        };
    }

    // Handle appointment booking
    async handleAppointmentBooking(appointmentId, patientInfo) {
        try {
            const bookedAppointment = this.hospitalDB.bookAppointment(appointmentId, patientInfo);
            
            if (bookedAppointment) {
                return {
                    type: 'booking_success',
                    message: `✅ **Appointment Confirmed!**

**Doctor**: ${bookedAppointment.doctor}
**Department**: ${bookedAppointment.specialty}
**Date**: ${bookedAppointment.date}
**Time**: ${bookedAppointment.time}

**What to bring:**
- Valid ID
- Insurance card
- List of current medications
- Any relevant medical records

You'll receive a confirmation email shortly. If you need to reschedule, please call us at (555) 123-APPT.`,
                    appointment: bookedAppointment
                };
            } else {
                return {
                    type: 'booking_failed',
                    message: "Sorry, that appointment slot is no longer available. Please choose another time slot.",
                    showAlternatives: true
                };
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            return {
                type: 'error',
                message: "There was an error booking your appointment. Please try again or call us directly."
            };
        }
    }

    // Search appointments with specific criteria
    async searchAppointments(criteria) {
        try {
            const appointments = this.hospitalDB.searchAppointments(criteria);
            
            return {
                type: 'appointment_search',
                message: `Found ${appointments.length} available appointments matching your criteria:`,
                appointments: appointments,
                searchCriteria: criteria
            };
        } catch (error) {
            console.error('Error searching appointments:', error);
            return this.getErrorResponse();
        }
    }

    // Get error response
    getErrorResponse() {
        return {
            type: 'error',
            message: "I'm experiencing some technical difficulties. Please try again in a moment, or contact our support team if the issue persists.",
            showContactInfo: true
        };
    }

    // Refresh appointment data
    refreshData() {
        this.hospitalDB.refreshAppointments();
    }
}

module.exports = DepartmentAgents;
