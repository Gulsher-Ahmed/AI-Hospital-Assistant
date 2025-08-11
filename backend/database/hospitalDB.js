/**
 * Dynamic Hospital Database
 * Stores real-time appointment data, doctor schedules, and department information
 */

class HospitalDatabase {
    constructor() {
        this.appointments = [];
        this.doctors = [];
        this.departments = [];
        this.initializeData();
    }

    initializeData() {
        // Initialize departments with specialized AI capabilities
        this.departments = [
            {
                id: 'cardiology',
                name: 'Cardiology',
                description: 'Heart and cardiovascular system specialists',
                keywords: ['heart', 'chest pain', 'blood pressure', 'cardiac', 'cardiovascular', 'arrhythmia', 'palpitations'],
                aiPrompt: 'You are a specialized Cardiology AI assistant. Help patients with heart-related concerns, symptoms, and guidance.'
            },
            {
                id: 'dermatology',
                name: 'Dermatology',
                description: 'Skin, hair, and nail specialists',
                keywords: ['skin', 'rash', 'acne', 'mole', 'itching', 'dermatitis', 'eczema', 'psoriasis'],
                aiPrompt: 'You are a specialized Dermatology AI assistant. Help patients with skin, hair, and nail concerns.'
            },
            {
                id: 'neurology',
                name: 'Neurology',
                description: 'Brain and nervous system specialists',
                keywords: ['headache', 'migraine', 'seizure', 'memory', 'dizziness', 'neurological', 'brain', 'nerve'],
                aiPrompt: 'You are a specialized Neurology AI assistant. Help patients with brain and nervous system concerns.'
            },
            {
                id: 'orthopedics',
                name: 'Orthopedics',
                description: 'Bone, joint, and muscle specialists',
                keywords: ['bone', 'joint', 'muscle', 'fracture', 'arthritis', 'back pain', 'knee', 'shoulder', 'orthopedic'],
                aiPrompt: 'You are a specialized Orthopedics AI assistant. Help patients with bone, joint, and muscle concerns.'
            },
            {
                id: 'pediatrics',
                name: 'Pediatrics',
                description: 'Children and adolescent specialists',
                keywords: ['child', 'baby', 'pediatric', 'infant', 'teenager', 'vaccination', 'growth', 'development'],
                aiPrompt: 'You are a specialized Pediatrics AI assistant. Help parents and caregivers with children\'s health concerns.'
            },
            {
                id: 'psychiatry',
                name: 'Psychiatry',
                description: 'Mental health specialists',
                keywords: ['anxiety', 'depression', 'mental health', 'stress', 'therapy', 'counseling', 'psychiatric'],
                aiPrompt: 'You are a specialized Psychiatry AI assistant. Help patients with mental health concerns and provide supportive guidance.'
            },
            {
                id: 'gastroenterology',
                name: 'Gastroenterology',
                description: 'Digestive system specialists',
                keywords: ['stomach', 'digestive', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'abdomen', 'gastro'],
                aiPrompt: 'You are a specialized Gastroenterology AI assistant. Help patients with digestive system concerns.'
            },
            {
                id: 'pulmonology',
                name: 'Pulmonology',
                description: 'Lung and respiratory specialists',
                keywords: ['lung', 'breathing', 'cough', 'asthma', 'respiratory', 'shortness of breath', 'pneumonia'],
                aiPrompt: 'You are a specialized Pulmonology AI assistant. Help patients with lung and respiratory concerns.'
            }
        ];

        // Initialize doctors
        this.doctors = [
            // Cardiology
            { id: 1, name: 'Dr. Sarah Chen', department: 'cardiology', specialty: 'Interventional Cardiology', experience: '15 years' },
            { id: 2, name: 'Dr. Michael Rodriguez', department: 'cardiology', specialty: 'Heart Surgery', experience: '20 years' },
            
            // Dermatology
            { id: 3, name: 'Dr. Emily Watson', department: 'dermatology', specialty: 'Dermatopathology', experience: '12 years' },
            { id: 4, name: 'Dr. James Kim', department: 'dermatology', specialty: 'Cosmetic Dermatology', experience: '10 years' },
            
            // Neurology
            { id: 5, name: 'Dr. Lisa Thompson', department: 'neurology', specialty: 'Epilepsy', experience: '18 years' },
            { id: 6, name: 'Dr. Robert Johnson', department: 'neurology', specialty: 'Stroke Care', experience: '22 years' },
            
            // Orthopedics
            { id: 7, name: 'Dr. David Wilson', department: 'orthopedics', specialty: 'Sports Medicine', experience: '14 years' },
            { id: 8, name: 'Dr. Maria Garcia', department: 'orthopedics', specialty: 'Joint Replacement', experience: '16 years' },
            
            // Pediatrics
            { id: 9, name: 'Dr. Jennifer Lee', department: 'pediatrics', specialty: 'Pediatric Cardiology', experience: '13 years' },
            { id: 10, name: 'Dr. Thomas Brown', department: 'pediatrics', specialty: 'General Pediatrics', experience: '11 years' },
            
            // Psychiatry
            { id: 11, name: 'Dr. Amanda Davis', department: 'psychiatry', specialty: 'Adult Psychiatry', experience: '17 years' },
            { id: 12, name: 'Dr. Christopher Taylor', department: 'psychiatry', specialty: 'Child Psychiatry', experience: '19 years' },
            
            // Gastroenterology
            { id: 13, name: 'Dr. Rachel Martinez', department: 'gastroenterology', specialty: 'Endoscopy', experience: '15 years' },
            { id: 14, name: 'Dr. Steven Anderson', department: 'gastroenterology', specialty: 'Hepatology', experience: '21 years' },
            
            // Pulmonology
            { id: 15, name: 'Dr. Nicole White', department: 'pulmonology', specialty: 'Critical Care', experience: '16 years' },
            { id: 16, name: 'Dr. Kevin Miller', department: 'pulmonology', specialty: 'Sleep Medicine', experience: '12 years' }
        ];

        // Generate dynamic appointment slots
        this.generateAppointmentSlots();
    }

    generateAppointmentSlots() {
        this.appointments = [];
        const today = new Date();
        
        // Generate slots for the next 14 days
        for (let day = 1; day <= 14; day++) {
            const date = new Date(today);
            date.setDate(today.getDate() + day);
            
            // Generate slots for each doctor
            this.doctors.forEach(doctor => {
                // Each doctor has 4-6 slots per day
                const slotsPerDay = 4 + Math.floor(Math.random() * 3);
                
                for (let slot = 0; slot < slotsPerDay; slot++) {
                    // Random times between 9 AM and 5 PM
                    const hour = 9 + Math.floor(Math.random() * 8);
                    const minutes = Math.random() > 0.5 ? 0 : 30;
                    
                    const slotTime = new Date(date);
                    slotTime.setHours(hour, minutes, 0, 0);
                    
                    // Random availability (80% available)
                    const isAvailable = Math.random() > 0.2;
                    
                    this.appointments.push({
                        id: `${doctor.id}_${date.toISOString().split('T')[0]}_${hour}_${minutes}`,
                        doctorId: doctor.id,
                        doctor: doctor.name,
                        department: doctor.department,
                        specialty: doctor.specialty,
                        date: this.formatDate(date),
                        time: this.formatTime(slotTime),
                        datetime: slotTime,
                        available: isAvailable,
                        duration: 30 // minutes
                    });
                }
            });
        }
        
        // Sort by datetime
        this.appointments.sort((a, b) => a.datetime - b.datetime);
    }

    formatDate(date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    // Get available appointments by department
    getAvailableAppointments(department = null, limit = 6) {
        let appointments = this.appointments.filter(apt => apt.available);
        
        if (department) {
            appointments = appointments.filter(apt => apt.department === department);
        }
        
        // Get upcoming appointments only
        const now = new Date();
        appointments = appointments.filter(apt => apt.datetime > now);
        
        return appointments.slice(0, limit);
    }

    // Get department by ID
    getDepartment(departmentId) {
        return this.departments.find(dept => dept.id === departmentId);
    }

    // Get doctor by ID
    getDoctor(doctorId) {
        return this.doctors.find(doctor => doctor.id === doctorId);
    }

    // Book an appointment
    bookAppointment(appointmentId, patientInfo) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (appointment && appointment.available) {
            appointment.available = false;
            appointment.patientInfo = patientInfo;
            appointment.bookedAt = new Date();
            return appointment;
        }
        return null;
    }

    // Detect department from message
    detectDepartment(message) {
        const messageLower = message.toLowerCase();
        
        for (const dept of this.departments) {
            if (dept.keywords.some(keyword => messageLower.includes(keyword))) {
                return dept;
            }
        }
        
        return null;
    }

    // Get all departments
    getAllDepartments() {
        return this.departments;
    }

    // Get department-specific AI prompt
    getDepartmentPrompt(departmentId) {
        const department = this.getDepartment(departmentId);
        return department ? department.aiPrompt : null;
    }

    // Search appointments by criteria
    searchAppointments(criteria) {
        let results = this.appointments.filter(apt => apt.available);
        
        if (criteria.department) {
            results = results.filter(apt => apt.department === criteria.department);
        }
        
        if (criteria.doctor) {
            results = results.filter(apt => 
                apt.doctor.toLowerCase().includes(criteria.doctor.toLowerCase())
            );
        }
        
        if (criteria.date) {
            const targetDate = new Date(criteria.date);
            results = results.filter(apt => 
                apt.datetime.toDateString() === targetDate.toDateString()
            );
        }
        
        if (criteria.timePreference) {
            // morning, afternoon, evening
            results = results.filter(apt => {
                const hour = apt.datetime.getHours();
                if (criteria.timePreference === 'morning') return hour < 12;
                if (criteria.timePreference === 'afternoon') return hour >= 12 && hour < 17;
                if (criteria.timePreference === 'evening') return hour >= 17;
                return true;
            });
        }
        
        return results.slice(0, 10); // Limit results
    }

    // Update appointment availability (for real-time updates)
    refreshAppointments() {
        // Simulate real-time updates
        this.appointments.forEach(apt => {
            // Randomly book some appointments (simulate other patients booking)
            if (apt.available && Math.random() < 0.01) {
                apt.available = false;
                apt.bookedAt = new Date();
            }
        });
    }
}

module.exports = HospitalDatabase;
