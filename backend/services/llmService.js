const Groq = require('groq-sdk');
const prompts = require('../config/prompts');

class LLMService {
    constructor() {
        this.groq = null;
        this.initialized = false;
        this.useMock = false;
        this.model = 'llama-3.3-70b-versatile';
    }

    /**
     * Initialize the Groq SDK with API key
     */
    initialize() {
        if (this.initialized) return;

        console.log('🔍 Initializing Groq LLM Service...');
        
        if (!process.env.GROQ_API_KEY) {
            console.error('❌ GROQ_API_KEY not found in environment variables');
            this.useMock = true;
            return;
        }

        try {
            this.groq = new Groq({
                apiKey: process.env.GROQ_API_KEY
            });
            
            console.log('🚀 Groq API initialized successfully');
            console.log(`🤖 Using model: ${this.model}`);
            this.initialized = true;
            this.useMock = false;
            
        } catch (error) {
            console.error('❌ Failed to initialize Groq:', error.message);
            this.useMock = true;
        }
    }

    /**
     * Detect if the query is medical-related using natural language patterns
     */
    isMedicalQuery(message) {
        if (!message || typeof message !== 'string') {
            return false;
        }
        const messageLower = message.toLowerCase();
        return prompts.medicalKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Detect appointment-related queries using natural language patterns
     */
    isAppointmentQuery(message) {
        if (!message || typeof message !== 'string') {
            return false;
        }
        const messageLower = message.toLowerCase().trim();
        
        // Don't treat greetings or very short messages as appointment queries
        const greetings = ['hi', 'hey', 'hello', 'good morning', 'good afternoon', 'good evening'];
        if (messageLower.length <= 10 && greetings.some(greeting => messageLower.includes(greeting))) {
            return false;
        }
        
        // Must contain specific appointment-related words
        return prompts.appointmentKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Detect emergency medical situations using natural language patterns
     */
    isEmergencyQuery(message) {
        if (!message || typeof message !== 'string') {
            return false;
        }
        const messageLower = message.toLowerCase();
        return prompts.emergencyKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Generate professionally formatted appointment options
     */
    generateAppointmentSlots() {
        const slots = [
            "Tomorrow 2:00 PM with Dr. Smith (Cardiology)",
            "Thursday 10:30 AM with Dr. Johnson (Internal Medicine)",
            "Friday 3:15 PM with Dr. Williams (General Practice)"
        ];
        
        let response = "\n\nAvailable appointment slots:\n";
        slots.forEach((slot, index) => {
            response += `${index + 1}. ${slot}\n`;
        });
        
        response += "\nTo book an appointment:\n";
        response += "• Call: (555) 123-4567\n";
        response += "• Online: www.citygeneralhospital.com/appointments\n";
        response += "• Walk-in: Monday-Friday, 8:00 AM - 6:00 PM\n\n";
        response += "Which appointment would work best for you?";
        
        return response;
    }

    /**
     * Generate response using Groq API
     */
    async generateResponse(prompt, context = {}) {
        this.initialize();

        if (this.useMock) {
            return this.getMockResponse(prompt, context);
        }

        try {
            console.log(`🔍 Processing query:`, prompt.substring(0, 50) + '...');
            
            const response = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a friendly, professional hospital receptionist at City General Hospital. 

Your role is to:
- Greet patients warmly and ask how you can help
- Ask relevant questions to understand their needs (symptoms, preferred doctor, urgency, etc.)
- Provide helpful information about appointments, doctors, and services
- Be conversational, humble, and to-the-point
- Never overwhelm with too much information at once

Keep responses natural and concise (1-3 sentences). Ask one relevant question at a time to help patients find what they need.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: this.model,
                temperature: 0.7,
                max_tokens: 300
            });

            return response.choices[0]?.message?.content || "I apologize, but I'm having trouble generating a response right now. Please try again.";

        } catch (error) {
            console.error('❌ Error generating response:', error);
            return this.getMockResponse(prompt, context);
        }
    }

    /**
     * Generate natural responses for testing scenarios
     */
    /**
     * Generate natural responses using the hospital database
     */
    getMockResponse(message, context = {}) {
        const hospitalData = require('../database/hospitalData');
        const messageLower = message.toLowerCase();
        
        // Greeting responses
        if (messageLower.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
            return "Hello! I'm here to help you with any questions about City General Hospital. How can I assist you today?";
        }

        // Date-related queries
        if (messageLower.includes('today') || messageLower.includes('current date') || messageLower.includes('what date')) {
            const today = new Date();
            const dateStr = today.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            return `Today is ${dateStr}. How can I help you with your hospital needs?`;
        }

        // Handle exact button messages
        if (message === 'Hospital Services') {
            const info = hospitalData.getHospitalInfo();
            return `City General Hospital offers comprehensive medical services including emergency care, surgery, cardiology, neurology, pediatrics, orthopedics, dermatology, and diagnostic imaging. We have ${info.beds} beds and serve our community with ${info.staff} dedicated staff members. What specific service are you interested in?`;
        }
        
        if (message === 'Book an Appointment') {
            const thisWeekSlots = hospitalData.getAppointmentsForThisWeek();
            const sampleSlots = thisWeekSlots.slice(0, 4);
            
            let response = "I can help you book an appointment! Here are some available slots this week:\n\n";
            sampleSlots.forEach((slot, index) => {
                response += `${index + 1}. ${slot.formatted}\n`;
            });
            
            response += "\nTo book any appointment, call (555) 123-4567 or visit www.citygeneralhospital.com. Would you like to see more options or appointments for next week?";
            return response;
        }
        
        if (message === 'Emergency Help') {
            const emergencyInfo = hospitalData.getEmergencyInfo();
            return `For medical emergencies, call 911 immediately or come directly to our Emergency Department at ${emergencyInfo.address}. Our emergency line is ${emergencyInfo.phone}. We provide 24/7 emergency care including trauma, cardiac emergencies, stroke care, and poison control services.`;
        }
        
        if (message === 'Find a Specialist') {
            const allDoctors = hospitalData.getAllDoctors();
            const sampleDoctors = allDoctors.slice(0, 5);
            
            let response = "Our medical specialists include:\n\n";
            sampleDoctors.forEach((doctor, index) => {
                const dept = hospitalData.getDoctorDepartment(doctor.id);
                response += `${index + 1}. ${doctor.name} - ${doctor.specialization} (${dept})\n`;
            });
            
            response += "\nWould you like to learn more about a specific department or schedule an appointment with one of our specialists?";
            return response;
        }

        // Appointment-related queries
        if (messageLower.includes('appointment')) {
            if (messageLower.includes('next week')) {
                const nextWeekSlots = hospitalData.getAppointmentsForNextWeek();
                const sampleSlots = nextWeekSlots.slice(0, 6);
                
                let response = "Here are available appointment slots for next week:\n\n";
                sampleSlots.forEach((slot, index) => {
                    response += `${index + 1}. ${slot.formatted}\n`;
                });
                
                response += "\nWould you like me to help you book one of these appointments, or would you prefer to see options for a specific department?";
                return response;
            }
            
            if (messageLower.includes('tomorrow')) {
                const tomorrowSlots = hospitalData.getAppointmentsForTomorrow();
                const sampleSlots = tomorrowSlots.slice(0, 4);
                
                let response = "Tomorrow's available appointments:\n\n";
                sampleSlots.forEach((slot, index) => {
                    response += `${index + 1}. ${slot.formatted}\n`;
                });
                
                response += "\nTo book any of these appointments, please call (555) 123-4567 or visit our website.";
                return response;
            }

            if (messageLower.includes('today')) {
                return "For same-day appointments, please call our scheduling line at (555) 123-4567. We may have last-minute cancellations available, especially in our urgent care clinic.";
            }

            // General appointment inquiry
            const thisWeekSlots = hospitalData.getAppointmentsForThisWeek();
            const sampleSlots = thisWeekSlots.slice(0, 4);
            
            let response = "I can help you find an appointment! Here are some upcoming available slots:\n\n";
            sampleSlots.forEach((slot, index) => {
                response += `${index + 1}. ${slot.formatted}\n`;
            });
            
            response += "\nWould you like to see appointments for a specific department, or shall I show you more options for next week?";
            return response;
        }

        // Department-specific queries
        const departments = ['cardiology', 'neurology', 'orthopedics', 'pediatrics', 'dermatology', 'emergency'];
        for (const dept of departments) {
            if (messageLower.includes(dept)) {
                const deptInfo = hospitalData.getDepartmentInfo(dept);
                if (deptInfo) {
                    const deptSlots = deptInfo.appointments.slice(0, 3);
                    
                    let response = `Our ${deptInfo.name} department provides ${deptInfo.description}. `;
                    response += `We have ${deptInfo.doctors.length} specialists available.\n\n`;
                    response += `Some of our ${deptInfo.name} doctors:\n`;
                    
                    deptInfo.doctors.slice(0, 2).forEach((doctor, index) => {
                        response += `• ${doctor.name} - ${doctor.specialization} (${doctor.experience} experience)\n`;
                    });
                    
                    response += `\nUpcoming appointments:\n`;
                    deptSlots.forEach((slot, index) => {
                        response += `${index + 1}. ${slot.formatted}\n`;
                    });
                    
                    response += `\nWould you like more information about our ${deptInfo.name} services or help booking an appointment?`;
                    return response;
                }
            }
        }

        // Hospital information queries
        if (messageLower.includes('hospital') || messageLower.includes('location') || messageLower.includes('address')) {
            const info = hospitalData.getHospitalInfo();
            return `City General Hospital is located at ${info.address}. We're a ${info.beds}-bed facility established in ${info.established}, serving our community with excellence for over 70 years. Our main number is ${info.phone}. Is there specific information you'd like to know about our services?`;
        }

        // Emergency-related queries
        if (this.isEmergencyQuery(message)) {
            const emergencyInfo = hospitalData.getEmergencyInfo();
            return `For medical emergencies, please call 911 immediately or come to our Emergency Department at ${emergencyInfo.address}. Our emergency line is ${emergencyInfo.phone}. We provide 24/7 emergency care including trauma, cardiac, and stroke services.`;
        }

        // Doctor search
        if (messageLower.includes('doctor') || messageLower.includes('physician')) {
            const allDoctors = hospitalData.getAllDoctors();
            const sampleDoctors = allDoctors.slice(0, 4);
            
            let response = "We have many excellent physicians on staff. Here are some of our doctors:\n\n";
            sampleDoctors.forEach((doctor, index) => {
                const dept = hospitalData.getDoctorDepartment(doctor.id);
                response += `${index + 1}. ${doctor.name} - ${doctor.specialization} (${dept})\n`;
            });
            
            response += "\nWould you like information about a specific department or help finding a doctor for a particular condition?";
            return response;
        }

        // Medical condition queries
        if (this.isMedicalQuery(message)) {
            return "I can provide general health information, but for specific medical concerns, I recommend consulting with one of our healthcare professionals. Would you like me to help you schedule an appointment with the appropriate specialist, or do you have questions about our medical services?";
        }

        // Visiting hours and general info
        if (messageLower.includes('hours') || messageLower.includes('visiting')) {
            const info = hospitalData.getHospitalInfo();
            return `Our general visiting hours are ${info.visitingHours.general}. ICU visiting hours are ${info.visitingHours.icu}. Pediatric units allow ${info.visitingHours.pediatrics}. We also have amenities like a 24/7 cafeteria, gift shop, and free WiFi throughout the hospital.`;
        }

        // Services inquiry
        if (messageLower.includes('services') || messageLower.includes('what do you offer')) {
            return "City General Hospital offers comprehensive medical services including Emergency Care, Surgery, Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, Diagnostic Imaging, Laboratory Services, Physical Therapy, and more. We also provide specialized care in intensive care, maternity, and rehabilitation services. What specific service are you interested in learning about?";
        }

        // Default response for unrecognized queries
        return "I'm here to help with information about City General Hospital, including appointments, departments, doctors, and services. What would you like to know more about?";
    }

    /**
     * Parse JSON response from LLM, with fallback handling
     */
    parseJSONResponse(response) {
        try {
            console.log('🔍 Raw LLM response:', response);
            
            // If response is already an object, return it
            if (typeof response === 'object' && response !== null) {
                // Check if it has the expected structure
                if (response.route_to) {
                    return response;
                }
            }

            // If response is a string, try to parse it
            if (typeof response === 'string') {
                // Clean the response - remove extra whitespace and newlines
                const cleanResponse = response.trim();
                
                // Try to extract JSON from the response using multiple patterns
                const jsonPatterns = [
                    /\{[^}]*"route_to"[^}]*\}/,  // Look for route_to specifically
                    /\{[\s\S]*?\}/,              // Any JSON object
                    /```json\s*(\{[\s\S]*?\})\s*```/, // JSON in code blocks
                    /```(\{[\s\S]*?\})```/       // JSON in code blocks without json tag
                ];
                
                for (const pattern of jsonPatterns) {
                    const match = cleanResponse.match(pattern);
                    if (match) {
                        try {
                            const jsonStr = match[1] || match[0];
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.route_to) {
                                console.log('✅ Successfully parsed JSON:', parsed);
                                return parsed;
                            }
                        } catch (parseError) {
                            console.log('⚠️ Pattern matched but JSON parse failed:', parseError.message);
                            continue;
                        }
                    }
                }
                
                // Try to parse the entire response as JSON
                try {
                    const parsed = JSON.parse(cleanResponse);
                    if (parsed.route_to) {
                        console.log('✅ Successfully parsed full response as JSON:', parsed);
                        return parsed;
                    }
                } catch (e) {
                    console.log('⚠️ Full response JSON parse failed');
                }
                
                // If no JSON found, analyze the content for routing clues
                const messageLower = cleanResponse.toLowerCase();
                
                if (messageLower.includes('appointment') || messageLower.includes('book') || messageLower.includes('schedule')) {
                    return {
                        route_to: 'appointment',
                        message: 'Detected appointment-related content',
                        confidence: 0.7
                    };
                }
                
                if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('help')) {
                    return {
                        route_to: 'greeting',
                        message: 'Detected greeting or help request',
                        confidence: 0.7
                    };
                }
                
                if (messageLower.includes('hr') || messageLower.includes('policy') || messageLower.includes('benefit')) {
                    return {
                        route_to: 'hr',
                        message: 'Detected HR-related content',
                        confidence: 0.7
                    };
                }
                
                if (messageLower.includes('bye') || messageLower.includes('goodbye') || messageLower.includes('thank')) {
                    return {
                        route_to: 'closing',
                        message: 'Detected conversation ending',
                        confidence: 0.7
                    };
                }
                
                // If no specific routing clues found, return fallback
                return {
                    route_to: 'fallback',
                    message: 'No clear routing pattern detected',
                    confidence: 0.3
                };
            }

            // Default fallback
            return {
                route_to: 'fallback',
                message: 'Invalid response format',
                confidence: 0.1
            };

        } catch (error) {
            console.error('❌ JSON parsing error:', error.message);
            return {
                route_to: 'fallback',
                message: 'JSON parsing failed',
                confidence: 0.1
            };
        }
    }

    /**
     * Health check for the service
     */
    async healthCheck() {
        try {
            this.initialize();
            
            if (this.useMock) {
                return {
                    status: 'healthy',
                    service: 'mock',
                    message: 'Using mock responses (API key not configured)'
                };
            }

            // Test API call
            const response = await this.groq.chat.completions.create({
                messages: [
                    { role: "user", content: "Test message" }
                ],
                model: this.model,
                max_tokens: 10
            });

            return {
                status: 'healthy',
                service: 'groq',
                model: this.model,
                message: 'Groq API is responding normally'
            };

        } catch (error) {
            return {
                status: 'error',
                service: 'groq',
                error: error.message
            };
        }
    }
}

module.exports = new LLMService();
