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
     * Detect if the query is appointment-related
     */
    isAppointmentQuery(message) {
        if (!message || typeof message !== 'string') {
            return false;
        }
        const messageLower = message.toLowerCase();
        return prompts.appointmentKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Detect if the query is emergency-related
     */
    isEmergencyQuery(message) {
        if (!message || typeof message !== 'string') {
            return false;
        }
        const messageLower = message.toLowerCase();
        return prompts.emergencyKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Generate response using Groq API with conversation context
     */
    async generateResponse(prompt, context = {}) {
        this.initialize();

        console.log('🔍 Processing query:', prompt);
        console.log('📋 Context received in LLM service:', JSON.stringify(context, null, 2));
        
        // Extract conversation history
        const conversationHistory = context.conversationHistory || [];
        console.log('💬 Conversation history length:', conversationHistory.length);
        console.log('💬 Conversation history:', JSON.stringify(conversationHistory, null, 2));

        // Check if this should return appointment slots regardless of API
        const shouldReturnSlots = this.shouldReturnAppointmentSlots(prompt, context);
        
        if (this.useMock || shouldReturnSlots) {
            return this.getMockResponse(prompt, context);
        }

        try {
            console.log(`🔍 Processing query:`, prompt.substring(0, 50) + '...');
            
            // Build conversation messages with context
            const messages = [
                {
                    role: "system",
                    content: `You are a friendly, professional hospital receptionist at City General Hospital. 

Your role is to:
- Remember previous conversation context and build upon it
- Use the patient's name if they've introduced themselves
- Reference their previous medical concerns or requests
- Greet patients warmly and ask how you can help
- Ask relevant follow-up questions based on previous messages
- Provide helpful information about appointments, doctors, and services
- Be conversational, humble, and to-the-point
- Never overwhelm with too much information at once

IMPORTANT: If someone asks for appointments, appointment slots, scheduling, or booking, respond with: "I'll show you our available appointment slots" and nothing else.

Keep responses natural and concise (1-3 sentences). Ask one relevant question at a time to help patients find what they need.

If the conversation shows the patient has already indicated what they need, provide specific help rather than asking basic questions again.`
                }
            ];

            // Add conversation history if available
            if (context.conversationHistory && context.conversationHistory.length > 0) {
                // Add last 5 exchanges for context
                const recentHistory = context.conversationHistory.slice(-5);
                for (const exchange of recentHistory) {
                    messages.push({
                        role: "user",
                        content: exchange.user
                    });
                    messages.push({
                        role: "assistant", 
                        content: typeof exchange.ai === 'string' ? exchange.ai : exchange.ai.message || JSON.stringify(exchange.ai)
                    });
                }
            }

            // Add current message
            messages.push({
                role: "user",
                content: prompt
            });
            
            const response = await this.groq.chat.completions.create({
                messages: messages,
                model: this.model,
                temperature: 0.7,
                max_tokens: 200
            });

            const aiResponse = response.choices[0]?.message?.content || "I apologize, but I'm having trouble generating a response right now. Please try again.";
            
            // Check if the AI response indicates appointment slots should be shown
            if (aiResponse.includes("I'll show you our available appointment slots") || shouldReturnSlots) {
                return this.getMockResponse(prompt, context);
            }
            
            return aiResponse;

        } catch (error) {
            console.error('❌ Error generating response:', error);
            return this.getMockResponse(prompt, context);
        }
    }

    /**
     * Determine if the request should return appointment slots
     */
    shouldReturnAppointmentSlots(message, context = {}) {
        if (!message || typeof message !== 'string') {
            return false;
        }
        
        const messageLower = message.toLowerCase();
        const appointmentKeywords = [
            'appointment', 'schedule', 'book', 'slot', 'available', 'time',
            'book an appointment', 'schedule an appointment', 'available slots',
            'time slots', 'available times', 'booking'
        ];
        
        return appointmentKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Generate natural receptionist responses with clickable appointment slots and conversation context
     */
    getMockResponse(message, context = {}) {
        const hospitalData = require('../database/hospitalData');
        
        // Safety check for message parameter
        if (!message || typeof message !== 'string') {
            console.log('⚠️ Invalid message parameter:', message);
            return "I'm sorry, I didn't receive your message properly. Could you please try again?";
        }
        
        const messageLower = message.toLowerCase();
        
        // Extract comprehensive user information from conversation history
        let userName = '';
        let userAge = '';
        let medicalConcerns = [];
        let preferredDepartment = '';
        let hasAppointmentRequest = false;
        let urgencyLevel = 'normal';
        let symptoms = [];
        let preferredTimeframe = '';
        
        if (context.conversationHistory && context.conversationHistory.length > 0) {
            for (const exchange of context.conversationHistory) {
                // Skip if not a user message
                if (exchange.role !== 'user') continue;
                
                const userMsg = exchange.content?.toLowerCase() || '';
                
                // Extract name
                const namePatterns = [
                    /(?:my name is|i'm|i am|call me)\s+(\w+)/i,
                    /(?:hello|hi)\s+(?:i'm|i am)\s+(\w+)/i,
                ];
                
                for (const pattern of namePatterns) {
                    const match = exchange.content?.match(pattern);
                    if (match && !userName) {
                        userName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
                    }
                }
                
                // Extract age
                const agePatterns = [
                    /(?:i'm|i am)\s+(\d+)\s+(?:years old|year old)/i,
                    /(?:my age is|age)\s+(\d+)/i,
                ];
                
                for (const pattern of agePatterns) {
                    const match = exchange.content?.match(pattern);
                    if (match && !userAge) {
                        userAge = match[1];
                    }
                }
                
                // Extract medical concerns and symptoms
                const medicalKeywords = ['pain', 'headache', 'fever', 'cough', 'chest pain', 'back pain', 'knee pain', 'dizzy', 'nausea', 'infection', 'broken', 'sprain', 'cut', 'burn', 'rash', 'allergy'];
                medicalKeywords.forEach(keyword => {
                    if (userMsg.includes(keyword) && !medicalConcerns.includes(keyword)) {
                        medicalConcerns.push(keyword);
                        symptoms.push(keyword);
                    }
                });
                
                // Extract department preferences
                const departments = ['cardiology', 'neurology', 'orthopedics', 'pediatrics', 'dermatology', 'emergency'];
                departments.forEach(dept => {
                    if (userMsg.includes(dept) && !preferredDepartment) {
                        preferredDepartment = dept;
                    }
                });
                
                // Check for appointment requests
                if (userMsg.includes('appointment') || userMsg.includes('schedule') || userMsg.includes('book')) {
                    hasAppointmentRequest = true;
                }
                
                // Extract urgency level
                if (userMsg.includes('urgent') || userMsg.includes('emergency') || userMsg.includes('asap') || userMsg.includes('immediately')) {
                    urgencyLevel = 'urgent';
                } else if (userMsg.includes('soon') || userMsg.includes('quickly')) {
                    urgencyLevel = 'high';
                }
                
                // Extract timeframe preferences
                if (userMsg.includes('today')) preferredTimeframe = 'today';
                else if (userMsg.includes('tomorrow')) preferredTimeframe = 'tomorrow';
                else if (userMsg.includes('next week')) preferredTimeframe = 'next week';
                else if (userMsg.includes('this week')) preferredTimeframe = 'this week';
            }
        }
        
        // Handle name-related queries with context
        if (messageLower.includes('what is my name') || messageLower.includes("what's my name")) {
            if (userName) {
                return `Your name is ${userName}. How can I assist you further today?`;
            } else {
                return "I don't have your name yet. Could you please tell me your name so I can help you better?";
            }
        }
        
        // Greeting responses - use name if available
        if (messageLower.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
            if (userName && !messageLower.includes("i'm") && !messageLower.includes("i am")) {
                return `Hello ${userName}! How can I help you today at City General Hospital?`;
            } else {
                return "Hello! Welcome to City General Hospital. How may I help you today?";
            }
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
            const namePrefix = userName ? `${userName}, t` : 'T';
            return `${namePrefix}oday is ${dateStr}. Are you looking to schedule an appointment?`;
        }

        // Handle button messages - be context-aware and intelligent
        if (message === 'Hospital Services') {
            if (medicalConcerns.length > 0) {
                return `Based on what you mentioned about ${medicalConcerns.join(' and ')}, I can help you find the right department. What specific information would you like about our services?`;
            }
            return "We offer a full range of medical services including emergency care, cardiology, neurology, pediatrics, and more. What type of care are you looking for today?";
        }
        
        if (message === 'Book an Appointment') {
            let contextualMessage = '';
            const namePrefix = userName ? `${userName}, ` : "";
            
            if (preferredDepartment && medicalConcerns.length > 0) {
                contextualMessage = `${namePrefix}I see you're interested in ${preferredDepartment} for your ${medicalConcerns.join(' and ')}. Here are available appointments:`;
            } else if (medicalConcerns.length > 0) {
                contextualMessage = `${namePrefix}I'll help you find appointments for your ${medicalConcerns.join(' and ')} concerns. Here are our next available slots:`;
            } else if (preferredDepartment) {
                contextualMessage = `${namePrefix}Here are available ${preferredDepartment} appointments:`;
            } else {
                contextualMessage = `${namePrefix}I'd be happy to help you schedule an appointment. Here are our next available slots:`;
            }
            
            return {
                type: 'appointment_slots',
                message: contextualMessage,
                slots: this.generateContextualAppointmentSlots(hospitalData, preferredDepartment, urgencyLevel, preferredTimeframe)
            };
        }
        
        if (message === 'Emergency Help') {
            const namePrefix = userName ? `${userName}, ` : "";
            if (urgencyLevel === 'urgent' || medicalConcerns.some(concern => ['chest pain', 'broken', 'emergency'].includes(concern))) {
                return `${namePrefix}for serious medical emergencies, please call 911 IMMEDIATELY or go to our Emergency Department right away. Don't wait! Do you need emergency assistance now?`;
            }
            return `${namePrefix}for medical emergencies, please call 911 immediately or come to our Emergency Department. For urgent but non-emergency care, call (555) 123-4567. Is this an emergency?`;
        }
        
        if (message === 'Find a Specialist') {
            const namePrefix = userName ? `${userName}, ` : "";
            if (medicalConcerns.length > 0) {
                const suggestedDept = this.suggestDepartmentForConcerns(medicalConcerns);
                return `${namePrefix}based on your ${medicalConcerns.join(' and ')} concerns, I'd recommend our ${suggestedDept} department. Would you like me to schedule an appointment there?`;
            }
            return `${namePrefix}I can help you find the right specialist. What type of medical concern do you have, or which department are you interested in?`;
        }

        // Appointment queries - fully context-aware like a smart receptionist
        if (messageLower.includes('appointment')) {
            let contextualMessage = '';
            const namePrefix = userName ? `${userName}, ` : "";
            
            if (messageLower.includes('next week')) {
                if (preferredDepartment && medicalConcerns.length > 0) {
                    contextualMessage = `${namePrefix}I have ${preferredDepartment} openings next week for your ${medicalConcerns.join(' and ')} concerns. Here are the available times:`;
                } else if (medicalConcerns.length > 0) {
                    contextualMessage = `${namePrefix}I have several openings next week that would work for your ${medicalConcerns.join(' and ')} concerns:`;
                } else {
                    contextualMessage = `${namePrefix}I have several openings next week. Here are the available appointments:`;
                }
                return {
                    type: 'appointment_slots',
                    message: contextualMessage,
                    slots: this.generateContextualAppointmentSlots(hospitalData, preferredDepartment, urgencyLevel, 'next week')
                };
            }
            
            if (messageLower.includes('tomorrow')) {
                if (urgencyLevel === 'urgent') {
                    contextualMessage = `${namePrefix}I understand this is urgent. Let me check our priority slots for tomorrow:`;
                } else if (medicalConcerns.length > 0) {
                    contextualMessage = `${namePrefix}let me check tomorrow's availability for your ${medicalConcerns.join(' and ')} concerns:`;
                } else {
                    contextualMessage = `${namePrefix}let me check tomorrow's availability:`;
                }
                return {
                    type: 'appointment_slots',
                    message: contextualMessage,
                    slots: this.generateContextualAppointmentSlots(hospitalData, preferredDepartment, urgencyLevel, 'tomorrow')
                };
            }

            // General appointment inquiry with full context awareness
            if (hasAppointmentRequest && medicalConcerns.length > 0 && preferredDepartment) {
                contextualMessage = `${namePrefix}I see you've mentioned ${medicalConcerns.join(' and ')} and are interested in ${preferredDepartment}. Here are the best available appointments:`;
            } else if (medicalConcerns.length > 0) {
                const suggestedDept = this.suggestDepartmentForConcerns(medicalConcerns);
                contextualMessage = `${namePrefix}based on your ${medicalConcerns.join(' and ')} concerns, I'd recommend ${suggestedDept} appointments. Here are available slots:`;
            } else if (hasAppointmentRequest) {
                contextualMessage = `${namePrefix}I'd be happy to help you schedule that appointment! Here are our next available slots:`;
            } else {
                contextualMessage = `${namePrefix}I'd be happy to help you schedule an appointment! Here are our next available slots:`;
            }
            
            return {
                type: 'appointment_slots',
                message: contextualMessage,
                slots: this.generateContextualAppointmentSlots(hospitalData, preferredDepartment, urgencyLevel, preferredTimeframe)
            };
        }

        // Doctor queries with enhanced context
        if (messageLower.includes('doctor') || messageLower.includes('physician')) {
            const namePrefix = userName ? `${userName}, ` : "";
            if (medicalConcerns.length > 0) {
                const suggestedDept = this.suggestDepartmentForConcerns(medicalConcerns);
                return `${namePrefix}for your ${medicalConcerns.join(' and ')} concerns, I'd recommend Dr. ${this.getSuggestedDoctor(suggestedDept)} in our ${suggestedDept} department. Would you like me to schedule an appointment?`;
            }
            return `${namePrefix}are you looking for a specific type of specialist, or do you have a particular medical concern I can help match you with the right doctor?`;
        }

        // Department queries with context
        const departments = ['cardiology', 'neurology', 'orthopedics', 'pediatrics', 'dermatology'];
        for (const dept of departments) {
            if (messageLower.includes(dept)) {
                const namePrefix = userName ? `${userName}, I` : "I";
                return `${namePrefix} can definitely help you with our ${dept} department. Are you looking to schedule an appointment, or do you have questions about the services we offer?`;
            }
        }

        // Medical condition queries
        if (this.isMedicalQuery(message)) {
            return "I understand you have some health concerns. While I can help you schedule an appointment with the right specialist, I'd recommend speaking with one of our doctors for medical advice. Would you like me to help you find an appointment?";
        }

        // Default receptionist response with context awareness
        const namePrefix = userName ? `${userName}, ` : "";
        if (medicalConcerns.length > 0) {
            return `${namePrefix}I understand you have concerns about ${medicalConcerns.join(' and ')}. I'm here to help you with appointments, finding the right doctors, or answering questions about our hospital services. What can I assist you with today?`;
        }
        return `${namePrefix}I'm here to help you with appointments, finding doctors, or answering questions about our hospital services. What can I assist you with today?`;
    }

    /**
     * Suggest appropriate department based on medical concerns
     */
    suggestDepartmentForConcerns(concerns) {
        const departmentMapping = {
            'chest pain': 'cardiology',
            'heart': 'cardiology',
            'headache': 'neurology',
            'back pain': 'orthopedics',
            'knee pain': 'orthopedics',
            'broken': 'orthopedics',
            'sprain': 'orthopedics',
            'rash': 'dermatology',
            'skin': 'dermatology',
            'allergy': 'dermatology',
            'fever': 'general medicine',
            'cough': 'general medicine',
            'infection': 'general medicine'
        };
        
        for (const concern of concerns) {
            if (departmentMapping[concern]) {
                return departmentMapping[concern];
            }
        }
        return 'general medicine';
    }

    /**
     * Get suggested doctor name for department
     */
    getSuggestedDoctor(department) {
        const doctorNames = {
            'cardiology': 'Smith (Cardiologist)',
            'neurology': 'Johnson (Neurologist)', 
            'orthopedics': 'Brown (Orthopedic Surgeon)',
            'dermatology': 'Davis (Dermatologist)',
            'general medicine': 'Wilson (General Practitioner)'
        };
        return doctorNames[department] || 'Wilson (General Practitioner)';
    }

    /**
     * Generate contextual appointment slots based on user's conversation history
     */
    generateContextualAppointmentSlots(hospitalData, preferredDepartment, urgencyLevel, timeframe) {
        let slots = [];
        
        if (timeframe === 'tomorrow') {
            slots = hospitalData.getAppointmentsForNextWeek().slice(0, 6);
        } else if (timeframe === 'next week') {
            slots = hospitalData.getAppointmentsForNextWeek();
        } else {
            const thisWeekSlots = hospitalData.getAppointmentsForThisWeek();
            const nextWeekSlots = hospitalData.getAppointmentsForNextWeek();
            slots = [...thisWeekSlots.slice(0, 2), ...nextWeekSlots.slice(0, 4)];
        }
        
        // Filter by department if specified
        if (preferredDepartment) {
            slots = slots.filter(slot => 
                slot.department.toLowerCase().includes(preferredDepartment.toLowerCase())
            );
        }
        
        // Prioritize urgent slots
        if (urgencyLevel === 'urgent') {
            slots = slots.filter(slot => {
                const slotHour = parseInt(slot.time.split(':')[0]);
                return slotHour >= 8 && slotHour <= 17; // Priority hours
            });
        }
        
        return slots.slice(0, 6).map(slot => ({
            id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            time: slot.time,
            date: slot.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            doctor: slot.doctor.name,
            department: slot.department,
            formatted: `${slot.time}`
        }));
    }

    /**
     * Generate appointment slots in clickable container format
     */
    generateAppointmentSlots(hospitalData) {
        const thisWeekSlots = hospitalData.getAppointmentsForThisWeek();
        const nextWeekSlots = hospitalData.getAppointmentsForNextWeek();
        const combinedSlots = [...thisWeekSlots.slice(0, 2), ...nextWeekSlots.slice(0, 4)];
        
        return combinedSlots.map(slot => ({
            id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            time: slot.time,
            date: slot.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            doctor: slot.doctor.name,
            department: slot.department,
            formatted: `${slot.time}`
        }));
    }

    generateNextWeekSlots(hospitalData) {
        const nextWeekSlots = hospitalData.getAppointmentsForNextWeek();
        return nextWeekSlots.slice(0, 6).map(slot => ({
            id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            time: slot.time,
            date: slot.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            doctor: slot.doctor.name,
            department: slot.department,
            formatted: `${slot.time}`
        }));
    }

    generateTomorrowSlots(hospitalData) {
        const tomorrowSlots = hospitalData.getAppointmentsForTomorrow();
        return tomorrowSlots.slice(0, 4).map(slot => ({
            id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            time: slot.time,
            date: slot.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            doctor: slot.doctor.name,
            department: slot.department,
            formatted: `${slot.time}`
        }));
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
