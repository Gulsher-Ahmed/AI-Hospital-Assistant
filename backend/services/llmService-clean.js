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
                        content: "You are a professional medical AI assistant at City General Hospital. Provide helpful, accurate, and empathetic medical guidance while being conversational and professional."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: this.model,
                temperature: 0.7,
                max_tokens: 1000
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
        if (this.isEmergencyQuery(message)) {
            return "This is a test response from our medical AI system. In a real emergency, please call 911 immediately or visit our emergency department at City General Hospital. Our emergency team is available 24/7 to provide immediate care. For urgent but non-emergency situations, you can reach our consultation line at (555) 911-HELP.";
        } else if (this.isAppointmentQuery(message)) {
            return "I'd be happy to help you schedule an appointment. Let me show you our available options: " + this.generateAppointmentSlots();
        } else if (this.isMedicalQuery(message)) {
            return this.getMedicalMockResponse(message);
        } else {
            return "Hello! Welcome to City General Hospital. I'm here to help with any questions you might have about our services, scheduling appointments, or general health information. How can I assist you today?";
        }
    }

    /**
     * Get specific medical mock responses
     */
    getMedicalMockResponse(message) {
        const messageLower = message.toLowerCase();
        
        if (messageLower.includes('diabetes')) {
            return `The main symptoms of diabetes include:

**Common Early Symptoms:**
• Excessive thirst and frequent urination
• Unexplained weight loss
• Increased hunger
• Fatigue and weakness
• Blurred vision
• Slow healing cuts or bruises
• Frequent infections

**Type 1 vs Type 2:**
• Type 1 symptoms often develop quickly over weeks
• Type 2 symptoms may develop gradually over months or years

**When to See a Doctor:**
If you're experiencing multiple symptoms, especially frequent urination and excessive thirst, please schedule an appointment for proper testing. Early diagnosis and treatment are crucial for managing diabetes effectively.

Would you like me to help you schedule an appointment with our endocrinology department for diabetes screening?`;
        } else if (messageLower.includes('heart') || messageLower.includes('cardiovascular')) {
            return `Cardiovascular disease encompasses several heart and blood vessel conditions:

**Common Types:**
• Coronary artery disease (blocked heart arteries)
• Heart failure (heart can't pump effectively)
• Arrhythmias (irregular heartbeat)
• Heart valve disease
• Peripheral artery disease

**Warning Signs:**
• Chest pain or discomfort
• Shortness of breath
• Fatigue during normal activities
• Swelling in legs, ankles, or feet
• Rapid or irregular heartbeat

**Risk Factors:**
• High blood pressure and cholesterol
• Smoking and diabetes
• Family history
• Sedentary lifestyle

**Prevention:**
• Regular exercise and healthy diet
• Maintain healthy weight
• Don't smoke
• Manage stress
• Regular check-ups

Our cardiology department offers comprehensive heart health services. Would you like information about scheduling a cardiovascular screening?`;
        } else {
            return `Thank you for your medical question. While I can provide general health information, I'd recommend discussing your specific concerns with one of our experienced physicians. 

Our medical team includes specialists in:
• Cardiology (heart conditions)
• Endocrinology (diabetes, hormones)
• Internal Medicine (general health)
• Neurology (brain and nervous system)
• Dermatology (skin conditions)
• Orthopedics (bones and joints)

For the most accurate diagnosis and personalized treatment plan, please consider scheduling a consultation with the appropriate specialist. Would you like me to help you book an appointment?`;
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
