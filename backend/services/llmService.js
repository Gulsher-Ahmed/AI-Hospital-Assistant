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
                        content: "You are a concise medical AI assistant at City General Hospital. ALWAYS respond in 1-2 sentences maximum. For hospital information: give brief facts only. For appointments: briefly ask what department they need. For medical questions: give essential symptoms/info only. Never elaborate unless specifically asked for more details."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: this.model,
                temperature: 0.5,
                max_tokens: 150
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
    getMockResponse(message, context = {}) {
        const messageLower = message.toLowerCase();
        
        // Handle exact button messages with very concise responses
        if (message === 'Hospital Services') {
            return "We offer emergency care, surgery, cardiology, neurology, pediatrics, and diagnostic imaging.";
        } else if (message === 'Book an Appointment') {
            return "Available slots today: 2:00 PM Cardiology, 3:30 PM Internal Medicine. Call (555) 123-4567 to book.";
        } else if (message === 'Emergency Help') {
            return "For emergencies: Call 911 or visit our ER immediately. For urgent care: (555) 911-HELP.";
        } else if (message === 'Find a Specialist') {
            return "Our specialists: Cardiology, Neurology, Dermatology, Pediatrics. Call (555) 123-4567 for appointments.";
        }
        
        // Handle general queries
        if (messageLower.includes('services does the hospital provide') || messageLower.includes('what services')) {
            return "We provide emergency care, surgery, cardiology, internal medicine, neurology, dermatology, pediatrics, and diagnostic imaging.";
        } else if (messageLower.includes('visiting hours') || messageLower.includes('visit hours')) {
            return "Visiting hours: 8:00 AM to 8:00 PM daily. ICU visits restricted to immediate family.";
        } else if (this.isEmergencyQuery(message)) {
            return "For medical emergencies, please call 911 immediately or visit our emergency department. For urgent non-emergency concerns, call (555) 911-HELP.";
        } else if (this.isAppointmentQuery(message)) {
            return "I can help you schedule an appointment. Please let me know which department you need and your preferred time. Call (555) 123-4567 or visit our website to book online.";
        } else if (this.isMedicalQuery(message)) {
            return this.getMedicalMockResponse(message);
        } else {
            return "Hello! I'm your AI medical assistant. I can help with medical questions, appointment scheduling, or hospital information. How can I assist you?";
        }
    }

    /**
     * Get specific medical mock responses
     */
    getMedicalMockResponse(message) {
        const messageLower = message.toLowerCase();
        
        if (messageLower.includes('diabetes')) {
            return `Common diabetes symptoms include excessive thirst, frequent urination, unexplained weight loss, and fatigue. Type 1 develops quickly (weeks), while Type 2 develops gradually (months/years). See a doctor if you have multiple symptoms, especially increased thirst and urination.`;
        } else if (messageLower.includes('heart') || messageLower.includes('cardiovascular')) {
            return `Cardiovascular disease includes conditions like coronary artery disease, heart failure, and arrhythmias. Warning signs are chest pain, shortness of breath, fatigue, and swelling in legs. Risk factors include high blood pressure, smoking, and family history. Prevention involves regular exercise, healthy diet, and not smoking.`;
        } else {
            return `I can provide general health information, but for specific concerns, please consult with our medical specialists. We have cardiology, endocrinology, internal medicine, and other departments available. Would you like to schedule an appointment?`;
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
