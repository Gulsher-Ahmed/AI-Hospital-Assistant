const LLMService = require('../services/llmService-receptionist');
const hospitalData = require('../database/hospitalData');

class DepartmentAgents {
    constructor() {
        this.llmService = LLMService;
    }

    /**
     * Route queries to appropriate department or provide general hospital information
     */
    async routeQuery(message, context = {}) {
        const messageLower = message.toLowerCase();

        // Handle specific button clicks
        if (message === 'Hospital Services') {
            return await this.handleHospitalServices();
        } else if (message === 'Book an Appointment') {
            return await this.handleAppointmentBooking();
        } else if (message === 'Emergency Help') {
            return await this.handleEmergencyHelp();
        } else if (message === 'Find a Specialist') {
            return await this.handleFindSpecialist();
        }

        // Handle department-specific queries
        if (messageLower.includes('cardiology') || messageLower.includes('heart')) {
            return await this.handleCardiologyQuery(message);
        } else if (messageLower.includes('neurology') || messageLower.includes('brain') || messageLower.includes('neurological')) {
            return await this.handleNeurologyQuery(message);
        } else if (messageLower.includes('orthopedics') || messageLower.includes('bone') || messageLower.includes('joint')) {
            return await this.handleOrthopedicsQuery(message);
        } else if (messageLower.includes('pediatrics') || messageLower.includes('child') || messageLower.includes('kids')) {
            return await this.handlePediatricsQuery(message);
        } else if (messageLower.includes('dermatology') || messageLower.includes('skin')) {
            return await this.handleDermatologyQuery(message);
        } else if (messageLower.includes('emergency')) {
            return await this.handleEmergencyQuery(message);
        }

        // Handle appointment-related queries
        if (messageLower.includes('appointment')) {
            return await this.handleGeneralAppointmentQuery(message, context);
        }

        // Default to general medical assistance
        return await this.llmService.generateResponse(message, context);
    }

    async handleHospitalServices() {
        const info = hospitalData.getHospitalInfo();
        return `City General Hospital offers comprehensive medical care with the following departments:

🏥 **Emergency Department** - 24/7 emergency care
❤️ **Cardiology** - Heart and cardiovascular care
🧠 **Neurology** - Brain and nervous system disorders
🦴 **Orthopedics** - Bone, joint, and muscle care
👶 **Pediatrics** - Children's healthcare
🔬 **Dermatology** - Skin, hair, and nail conditions

We also provide diagnostic imaging, laboratory services, physical therapy, and surgical services. Our ${info.beds}-bed facility has been serving the community since ${info.established}.

Would you like more information about any specific department?`;
    }

    async handleAppointmentBooking() {
        // Use the LLM receptionist service for "Book an Appointment" button
        // This will return appointment slots in clickable container format
        return await this.llmService.getMockResponse('Book an Appointment');
    }

    async handleEmergencyHelp() {
        const emergencyInfo = hospitalData.getEmergencyInfo();
        return `🚨 **Emergency Information**

**For Life-Threatening Emergencies:** Call 911 immediately

**Hospital Emergency Department:**
📍 Address: ${emergencyInfo.address}
📞 Emergency Line: ${emergencyInfo.phone}
🕐 Available: 24/7

**Emergency Services:**
• Trauma Care
• Cardiac Emergency
• Stroke Care
• Poison Control

**For Non-Life-Threatening Urgent Care:**
• Call our main line: (555) 123-4567
• Visit our urgent care clinic (8 AM - 10 PM daily)

If you're experiencing a medical emergency, please don't delay - call 911 or come to our Emergency Department immediately.`;
    }

    async handleFindSpecialist() {
        const departments = Object.values(hospitalData.departments);
        
        let response = "🏥 **Find a Specialist at City General Hospital**\n\n";
        
        departments.forEach(dept => {
            response += `**${dept.name}**\n`;
            response += `${dept.description}\n`;
            response += `Doctors available: ${dept.doctors.length}\n\n`;
        });
        
        response += "To schedule an appointment with any specialist:\n";
        response += "📞 Call: (555) 123-4567\n";
        response += "🌐 Online: www.citygeneralhospital.com\n\n";
        response += "Which department would you like to learn more about?";
        
        return response;
    }

    async handleCardiologyQuery(message) {
        const cardiology = hospitalData.getDepartmentInfo('cardiology');
        
        let response = `**Cardiology Department**\n\n${cardiology.description}\n\n`;
        response += "**Our Cardiologists:**\n";
        cardiology.doctors.forEach(doctor => {
            response += `• ${doctor.name} - ${doctor.specialization} (${doctor.experience} experience)\n`;
        });
        
        const appointments = cardiology.appointments.slice(0, 3);
        response += "\n**Available Appointments:**\n";
        appointments.forEach((slot, index) => {
            response += `${index + 1}. ${slot.formatted}\n`;
        });
        
        response += "\nWould you like to book an appointment or learn more about our cardiac services?";
        return response;
    }

    async handleNeurologyQuery(message) {
        const neurology = hospitalData.getDepartmentInfo('neurology');
        
        let response = `**Neurology Department**\n\n${neurology.description}\n\n`;
        response += "**Our Neurologists:**\n";
        neurology.doctors.forEach(doctor => {
            response += `• ${doctor.name} - ${doctor.specialization} (${doctor.experience} experience)\n`;
        });
        
        const appointments = neurology.appointments.slice(0, 3);
        response += "\n**Available Appointments:**\n";
        appointments.forEach((slot, index) => {
            response += `${index + 1}. ${slot.formatted}\n`;
        });
        
        response += "\nWould you like to schedule an appointment or have questions about neurological conditions?";
        return response;
    }

    async handleOrthopedicsQuery(message) {
        const orthopedics = hospitalData.getDepartmentInfo('orthopedics');
        
        let response = `**Orthopedics Department**\n\n${orthopedics.description}\n\n`;
        response += "**Our Orthopedic Specialists:**\n";
        orthopedics.doctors.forEach(doctor => {
            response += `• ${doctor.name} - ${doctor.specialization} (${doctor.experience} experience)\n`;
        });
        
        const appointments = orthopedics.appointments.slice(0, 3);
        response += "\n**Available Appointments:**\n";
        appointments.forEach((slot, index) => {
            response += `${index + 1}. ${slot.formatted}\n`;
        });
        
        response += "\nWould you like to book an appointment or learn about our orthopedic services?";
        return response;
    }

    async handlePediatricsQuery(message) {
        const pediatrics = hospitalData.getDepartmentInfo('pediatrics');
        
        let response = `**Pediatrics Department**\n\n${pediatrics.description}\n\n`;
        response += "**Our Pediatricians:**\n";
        pediatrics.doctors.forEach(doctor => {
            response += `• ${doctor.name} - ${doctor.specialization} (${doctor.experience} experience)\n`;
        });
        
        const appointments = pediatrics.appointments.slice(0, 3);
        response += "\n**Available Appointments:**\n";
        appointments.forEach((slot, index) => {
            response += `${index + 1}. ${slot.formatted}\n`;
        });
        
        response += "\nWould you like to schedule an appointment for your child or learn more about our pediatric services?";
        return response;
    }

    async handleDermatologyQuery(message) {
        const dermatology = hospitalData.getDepartmentInfo('dermatology');
        
        let response = `**Dermatology Department**\n\n${dermatology.description}\n\n`;
        response += "**Our Dermatologists:**\n";
        dermatology.doctors.forEach(doctor => {
            response += `• ${doctor.name} - ${doctor.specialization} (${doctor.experience} experience)\n`;
        });
        
        const appointments = dermatology.appointments.slice(0, 3);
        response += "\n**Available Appointments:**\n";
        appointments.forEach((slot, index) => {
            response += `${index + 1}. ${slot.formatted}\n`;
        });
        
        response += "\nWould you like to book a dermatology appointment or have questions about skin conditions?";
        return response;
    }

    async handleEmergencyQuery(message) {
        return await this.handleEmergencyHelp();
    }

    async handleGeneralAppointmentQuery(message, context = {}) {
        // Use the LLM receptionist service for all appointment queries
        // This will return appointment slots in clickable container format
        return await this.llmService.generateResponse(message, context);
    }
}

module.exports = new DepartmentAgents();
