const Groq = require('groq-sdk');
const prompts = require('../config/prompts');

/**
 * Groq LLM Service with Enhanced Medical Expertise
 * Provides intelligent medical AI responses using Groq's fast LLM models
 */
class LLMService {
    constructor() {
        this.initialized = false;
        this.groq = null;
        this.model = "llama-3.3-70b-versatile";
        this.useMock = false;
    }

    /**
     * Initialize the Groq service
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
     * Detect if the query is medical-related
     */
    isMedicalQuery(message) {
        const medicalKeywords = [
            // Symptoms
            'pain', 'hurt', 'ache', 'fever', 'headache', 'dizzy', 'nausea', 'vomit', 'cough', 'cold', 'flu',
            'chest pain', 'shortness of breath', 'breathing', 'heart', 'blood pressure', 'diabetes',
            
            // Medical terms
            'doctor', 'physician', 'nurse', 'medication', 'medicine', 'prescription', 'treatment', 'therapy',
            'diagnosis', 'symptoms', 'condition', 'disease', 'illness', 'infection', 'allergy', 'surgery',
            
            // Body parts
            'head', 'neck', 'back', 'chest', 'stomach', 'abdomen', 'leg', 'arm', 'knee', 'shoulder',
            
            // Specialists
            'cardiology', 'neurology', 'orthopedic', 'dermatology', 'gastroenterology', 'pulmonology',
            'oncology', 'pediatric', 'gynecology', 'urology', 'psychiatry', 'radiology',
            
            // Emergency
            'emergency', 'urgent', 'critical', 'severe', 'acute', 'chronic'
        ];
        
        const messageLower = message.toLowerCase();
        return medicalKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Detect appointment-related queries
     */
    isAppointmentQuery(message) {
        const appointmentKeywords = [
            'appointment', 'schedule', 'book', 'reserve', 'slot', 'available', 'time', 'visit',
            'see doctor', 'consultation', 'check-up', 'follow-up', 'when can i', 'availability'
        ];
        
        const messageLower = message.toLowerCase();
        return appointmentKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Detect emergency medical situations
     */
    isEmergencyQuery(message) {
        const emergencyKeywords = [
            'emergency', 'urgent', 'critical', 'severe pain', 'can\'t breathe', 'chest pain',
            'heart attack', 'stroke', 'bleeding', 'unconscious', 'overdose', 'poisoning',
            'severe', 'acute', 'immediate', 'help me', 'dying', 'crisis'
        ];
        
        const messageLower = message.toLowerCase();
        return emergencyKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Generate container-based appointment slots
     */
    generateAppointmentSlots() {
        const slots = [
            { time: "9:00 AM", date: "Tomorrow", doctor: "Dr. Sarah Smith", specialty: "Cardiology", available: true },
            { time: "11:30 AM", date: "Tomorrow", doctor: "Dr. Mike Johnson", specialty: "Internal Medicine", available: true },
            { time: "2:00 PM", date: "Monday", doctor: "Dr. Emily Williams", specialty: "Cardiology", available: true },
            { time: "3:30 PM", date: "Monday", doctor: "Dr. Robert Brown", specialty: "Pulmonology", available: true },
            { time: "10:00 AM", date: "Tuesday", doctor: "Dr. Lisa Davis", specialty: "Endocrinology", available: true },
            { time: "4:00 PM", date: "Tuesday", doctor: "Dr. James Wilson", specialty: "Neurology", available: true }
        ];

        let response = "\n\n📅 **Available Appointment Slots:**\n\n";
        
        slots.forEach((slot, index) => {
            response += `┌─────────────────────────────────┐\n`;
            response += `│  🏥 **SLOT ${index + 1}**${' '.repeat(20)}│\n`;
            response += `│  ⏰ ${slot.time} - ${slot.date}${' '.repeat(10)}│\n`;
            response += `│  👨‍⚕️ ${slot.doctor}${' '.repeat(8)}│\n`;
            response += `│  🩺 ${slot.specialty}${' '.repeat(12)}│\n`;
            response += `│  ✅ Available${' '.repeat(17)}│\n`;
            response += `└─────────────────────────────────┘\n\n`;
        });

        response += "📞 **To book any slot:** Call (555) 123-4567\n";
        response += "💻 **Online booking:** www.citygeneralhospital.com/book\n";
        response += "🏥 **Walk-in hours:** Mon-Fri 8AM-6PM";
        
        return response;
    }

    /**
     * Create enhanced system prompt for different agent types
     */
    createSystemPrompt(agentType, message) {
        const hospitalInfo = `You are an AI assistant at City General Hospital, a leading medical facility with expert physicians across all specialties. We provide comprehensive medical care, emergency services, and advanced treatments.

HOSPITAL DETAILS:
- Name: City General Hospital
- Address: 123 Medical Center Drive, Healthcare City, HC 12345
- Phone: (555) 123-4567
- Emergency: 911 or (555) 911-HELP
- Website: www.citygeneralhospital.com

DEPARTMENTS:
- Emergency Medicine (24/7)
- Cardiology & Heart Surgery
- Neurology & Neurosurgery
- Orthopedics & Sports Medicine
- Oncology & Cancer Care
- Pediatrics & NICU
- Women's Health & Maternity
- Internal Medicine
- Pulmonology & Critical Care
- Gastroenterology
- Endocrinology & Diabetes Care
- Mental Health & Psychiatry

`;

        const isEmergency = this.isEmergencyQuery(message);
        const isAppointment = this.isAppointmentQuery(message);
        const isMedical = this.isMedicalQuery(message);

        let rolePrompt = "";

        if (isEmergency) {
            rolePrompt = `
EMERGENCY MEDICAL AI EXPERT:
You are a medical emergency expert AI. Provide immediate, clear guidance for urgent medical situations.

EMERGENCY PROTOCOL:
1. Assess urgency level (life-threatening vs urgent care)
2. Provide immediate actionable steps
3. Direct to appropriate care level (911, ER, urgent care, or clinic)
4. Stay calm and reassuring while being direct
5. Always include emergency contact information

CRITICAL: For life-threatening emergencies, immediately direct to call 911.
`;
        } else if (isAppointment) {
            rolePrompt = `
APPOINTMENT SCHEDULING EXPERT:
You are a medical appointment specialist. Help patients schedule appointments efficiently.

APPOINTMENT GUIDELINES:
1. Ask about preferred specialty or condition
2. Offer multiple time options in container format
3. Explain booking process clearly
4. Provide alternative booking methods
5. Be helpful and accommodating
6. Consider urgency of medical needs

ALWAYS show available slots in organized containers, NOT paragraphs.
`;
        } else if (isMedical) {
            rolePrompt = `
MEDICAL EXPERT AI:
You are a highly knowledgeable medical AI with expertise across all medical specialties. Your knowledge includes:

CARDIOLOGY EXPERTISE:
- Heart disease, arrhythmias, heart failure
- Chest pain evaluation and risk factors
- Blood pressure management
- Cardiac rehabilitation and prevention

COMPREHENSIVE MEDICAL KNOWLEDGE:
- Symptom analysis and triage
- Common and rare medical conditions
- Treatment options and medication guidance
- Preventive care recommendations
- When to seek immediate vs routine care

MEDICAL COMMUNICATION:
1. Provide accurate, evidence-based information
2. Explain medical terms in patient-friendly language
3. Always recommend appropriate medical care
4. Never provide specific diagnoses or prescriptions
5. Focus on education and guidance
6. Show empathy and understanding
`;
        } else {
            rolePrompt = `
HOSPITAL CUSTOMER SERVICE EXPERT:
You are a professional hospital customer service representative with medical knowledge.

GENERAL ASSISTANCE:
1. Answer questions about hospital services
2. Provide general health information
3. Direct to appropriate departments
4. Handle billing and insurance questions
5. Assist with general inquiries
6. Maintain professional, caring tone
`;
        }

        return hospitalInfo + rolePrompt + `
RESPONSE GUIDELINES:
- Be professional, empathetic, and helpful
- Provide accurate medical information
- Keep responses concise but complete (2-4 sentences typically)
- Use clear, easy-to-understand language
- Always include relevant contact information
- Show containers for appointments, NOT paragraphs
- For medical advice: educate but recommend seeing healthcare provider

Remember: You represent City General Hospital's commitment to excellent patient care.
`;
    }

    /**
     * Generate response using Groq API
     */
    async generateResponse(agentType, message, context = {}, conversationHistory = []) {
        this.initialize();

        if (this.useMock) {
            return this.getMockResponse(message, { agentType, conversationHistory });
        }

        try {
            console.log(`🔍 Processing ${agentType} query:`, message.substring(0, 50) + '...');
            
            // Analyze query type
            const isEmergency = this.isEmergencyQuery(message);
            const isAppointment = this.isAppointmentQuery(message);
            const isMedical = this.isMedicalQuery(message);
            
            console.log(`📊 Query Analysis - Emergency: ${isEmergency}, Appointment: ${isAppointment}, Medical: ${isMedical}`);
            
            // Create system prompt
            const systemPrompt = this.createSystemPrompt(agentType, message);
            
            // Build messages array
            const messages = [
                {
                    role: "system",
                    content: systemPrompt
                }
            ];
            
            // Add conversation history
            if (conversationHistory && conversationHistory.length > 0) {
                conversationHistory.forEach(msg => {
                    messages.push({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.content
                    });
                });
            }
            
            // Add current user message
            messages.push({
                role: "user",
                content: message
            });
            
            console.log('🚀 Sending request to Groq...');
            
            // Call Groq API
            const completion = await this.groq.chat.completions.create({
                messages: messages,
                model: this.model,
                temperature: 0.3,
                max_tokens: 1024,
                top_p: 0.9,
                stream: false
            });
            
            let response = completion.choices[0].message.content;
            
            // Add appointment slots if this is an appointment query
            if (isAppointment) {
                response += this.generateAppointmentSlots();
            }
            
            // Add emergency disclaimer for emergency queries
            if (isEmergency) {
                response += "\n\n🚨 **CRITICAL EMERGENCY REMINDER:**\nIf this is life-threatening, call 911 IMMEDIATELY or go to the nearest emergency room. Do not rely solely on this chat for emergency medical care.";
            }
            
            console.log('✅ Groq response generated successfully');
            return response;
            
        } catch (error) {
            console.error('❌ Groq API error:', error);
            return this.getErrorFallbackResponse(message);
        }
    }

    /**
     * Get fallback response for errors
     */
    getErrorFallbackResponse(message) {
        if (this.isEmergencyQuery(message)) {
            return "🚨 **EMERGENCY SYSTEM UNAVAILABLE** - For any medical emergency, call 911 IMMEDIATELY or go to the nearest emergency room. For urgent but non-life-threatening issues, call our emergency line at (555) 911-HELP.";
        } else if (this.isAppointmentQuery(message)) {
            return "I'm having technical difficulties with our appointment system. Please call our appointment line at (555) 123-4567 to schedule, or visit www.citygeneralhospital.com/book for online booking.";
        } else {
            return "I'm experiencing technical difficulties. Please call our main number at (555) 123-4567 for assistance, or visit our website at www.citygeneralhospital.com for more information.";
        }
    }

    /**
     * Mock response for testing
     */
    getMockResponse(message, context = {}) {
        if (this.isEmergencyQuery(message)) {
            return "🚨 **MOCK EMERGENCY RESPONSE** - For any real emergency, call 911 immediately. This is a test response from our medical AI system. Our emergency department is available 24/7 at (555) 911-HELP.";
        } else if (this.isAppointmentQuery(message)) {
            return "📅 **MOCK APPOINTMENT RESPONSE** - I can help you schedule an appointment. " + this.generateAppointmentSlots();
        } else if (this.isMedicalQuery(message)) {
            return "🩺 **MOCK MEDICAL RESPONSE** - Based on your medical inquiry, I recommend consulting with one of our expert physicians. Our medical team includes specialists in cardiology, internal medicine, and many other fields. Please call (555) 123-4567 to schedule a consultation.";
        } else {
            return "🏥 **MOCK HOSPITAL RESPONSE** - Thank you for contacting City General Hospital. How may I assist you today? You can reach us at (555) 123-4567 or visit www.citygeneralhospital.com.";
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
                    service: 'groq-mock',
                    model: 'mock',
                    timestamp: new Date().toISOString()
                };
            }
            
            // Test with a simple query
            const testResponse = await this.generateResponse('general', 'Hello, test query');
            
            return {
                status: 'healthy',
                service: 'groq',
                model: this.model,
                response_length: testResponse.length,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            return {
                status: 'unhealthy',
                service: 'groq',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Stream response for real-time interaction (future feature)
     */
    async streamResponse(agentType, message, context = {}) {
        this.initialize();
        
        try {
            const systemPrompt = this.createSystemPrompt(agentType, message);
            
            const messages = [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ];
            
            const stream = await this.groq.chat.completions.create({
                messages: messages,
                model: this.model,
                temperature: 0.3,
                max_tokens: 1024,
                top_p: 0.9,
                stream: true
            });
            
            return stream;
            
        } catch (error) {
            console.error('❌ Groq streaming error:', error);
            throw error;
        }
    }
}

module.exports = LLMService;
