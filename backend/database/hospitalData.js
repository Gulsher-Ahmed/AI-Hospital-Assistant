/**
 * Comprehensive Hospital Database
 * Contains realistic data for appointments, doctors, departments, patients, and hospital information
 */

class HospitalDatabase {
    constructor() {
        this.currentDate = new Date();
        this.initializeData();
    }

    initializeData() {
        this.departments = {
            cardiology: {
                name: "Cardiology",
                description: "Heart and cardiovascular system care",
                doctors: [
                    { id: 1, name: "Dr. Sarah Martinez", experience: "15 years", specialization: "Interventional Cardiology" },
                    { id: 2, name: "Dr. Michael Chen", experience: "12 years", specialization: "Cardiac Surgery" },
                    { id: 3, name: "Dr. Emily Johnson", experience: "8 years", specialization: "Preventive Cardiology" },
                    { id: 4, name: "Dr. Robert Wilson", experience: "20 years", specialization: "Heart Failure" }
                ],
                equipment: ["ECG Machine", "Echocardiogram", "Cardiac Catheterization Lab", "Stress Test Equipment"]
            },
            neurology: {
                name: "Neurology",
                description: "Brain and nervous system disorders",
                doctors: [
                    { id: 5, name: "Dr. Jennifer Kim", experience: "14 years", specialization: "Stroke Care" },
                    { id: 6, name: "Dr. David Brown", experience: "18 years", specialization: "Epilepsy" },
                    { id: 7, name: "Dr. Lisa Thompson", experience: "10 years", specialization: "Movement Disorders" },
                    { id: 8, name: "Dr. James Anderson", experience: "16 years", specialization: "Headache Medicine" }
                ],
                equipment: ["MRI Scanner", "CT Scanner", "EEG Machine", "Nerve Conduction Study Equipment"]
            },
            orthopedics: {
                name: "Orthopedics",
                description: "Bone, joint, and muscle care",
                doctors: [
                    { id: 9, name: "Dr. Maria Rodriguez", experience: "13 years", specialization: "Sports Medicine" },
                    { id: 10, name: "Dr. Kevin Lee", experience: "19 years", specialization: "Joint Replacement" },
                    { id: 11, name: "Dr. Amanda White", experience: "11 years", specialization: "Spine Surgery" },
                    { id: 12, name: "Dr. Thomas Garcia", experience: "9 years", specialization: "Trauma Surgery" }
                ],
                equipment: ["X-Ray Machine", "Arthroscopy Equipment", "Physical Therapy Tools", "Bone Density Scanner"]
            },
            pediatrics: {
                name: "Pediatrics",
                description: "Children's healthcare",
                doctors: [
                    { id: 13, name: "Dr. Rachel Adams", experience: "12 years", specialization: "General Pediatrics" },
                    { id: 14, name: "Dr. Christopher Taylor", experience: "15 years", specialization: "Pediatric Cardiology" },
                    { id: 15, name: "Dr. Susan Miller", experience: "8 years", specialization: "Developmental Pediatrics" },
                    { id: 16, name: "Dr. Daniel Davis", experience: "10 years", specialization: "Pediatric Emergency Medicine" }
                ],
                equipment: ["Pediatric Ventilators", "Infant Monitors", "Growth Charts", "Child-friendly Medical Tools"]
            },
            dermatology: {
                name: "Dermatology",
                description: "Skin, hair, and nail conditions",
                doctors: [
                    { id: 17, name: "Dr. Nicole Harris", experience: "11 years", specialization: "Medical Dermatology" },
                    { id: 18, name: "Dr. Alexander Clark", experience: "14 years", specialization: "Dermatologic Surgery" },
                    { id: 19, name: "Dr. Stephanie Lewis", experience: "7 years", specialization: "Cosmetic Dermatology" },
                    { id: 20, name: "Dr. Brandon Young", experience: "13 years", specialization: "Pediatric Dermatology" }
                ],
                equipment: ["Dermoscopy", "Laser Equipment", "Cryotherapy Tools", "Biopsy Equipment"]
            },
            emergency: {
                name: "Emergency Department",
                description: "24/7 emergency medical care",
                doctors: [
                    { id: 21, name: "Dr. Michelle Parker", experience: "16 years", specialization: "Emergency Medicine" },
                    { id: 22, name: "Dr. Jonathan Scott", experience: "12 years", specialization: "Trauma Medicine" },
                    { id: 23, name: "Dr. Laura Martinez", experience: "9 years", specialization: "Emergency Pediatrics" },
                    { id: 24, name: "Dr. Ryan Cooper", experience: "14 years", specialization: "Critical Care" }
                ],
                equipment: ["Defibrillators", "Ventilators", "Trauma Bay Equipment", "Mobile X-Ray"]
            }
        };

        this.hospitalInfo = {
            name: "City General Hospital",
            address: "123 Medical Center Drive, Downtown City, DC 12345",
            phone: "(555) 123-4567",
            emergencyPhone: "(555) 911-HELP",
            email: "info@citygeneralhospital.com",
            website: "www.citygeneralhospital.com",
            established: "1952",
            beds: 450,
            staff: 2800,
            accreditation: ["Joint Commission", "American Hospital Association"],
            parking: {
                visitor: "Level 1-3, $5/hour, $25/day maximum",
                patient: "Valet service available, $10/day",
                handicapped: "Reserved spaces near main entrance"
            },
            amenities: [
                "24/7 Cafeteria",
                "Gift Shop",
                "Chapel",
                "WiFi throughout hospital",
                "Family lounges",
                "ATM services"
            ],
            visitingHours: {
                general: "8:00 AM - 8:00 PM",
                icu: "12:00 PM - 2:00 PM, 6:00 PM - 8:00 PM",
                pediatrics: "24/7 for parents/guardians"
            }
        };

        this.services = [
            "Emergency Care", "Surgery", "Maternity", "Intensive Care",
            "Diagnostic Imaging", "Laboratory Services", "Pharmacy",
            "Physical Therapy", "Occupational Therapy", "Speech Therapy",
            "Nutrition Counseling", "Social Services", "Chaplain Services"
        ];

        this.insurance = [
            "Medicare", "Medicaid", "Blue Cross Blue Shield", "Aetna",
            "Cigna", "United Healthcare", "Kaiser Permanente", "Humana",
            "Anthem", "Most major insurance plans accepted"
        ];
    }

    /**
     * Generate realistic appointment slots for the next 14 days
     */
    generateAppointmentSlots(department = null, weeksAhead = 2) {
        const slots = [];
        const startDate = new Date(this.currentDate);
        const endDate = new Date(startDate.getTime() + (weeksAhead * 7 * 24 * 60 * 60 * 1000));

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            // Skip Sundays
            if (date.getDay() === 0) continue;

            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Generate time slots for each day
            const timeSlots = this.generateDayTimeSlots(date);
            
            timeSlots.forEach(time => {
                const availableDoctors = department ? 
                    this.departments[department]?.doctors || [] : 
                    this.getAllDoctors();

                // Randomly assign doctors to slots
                const doctor = availableDoctors[Math.floor(Math.random() * availableDoctors.length)];
                const deptName = department ? this.departments[department].name : this.getDoctorDepartment(doctor.id);

                slots.push({
                    date: new Date(date),
                    time: time,
                    doctor: doctor,
                    department: deptName,
                    available: Math.random() > 0.3, // 70% chance of being available
                    formatted: `${dayName}, ${dateStr} at ${time} with ${doctor.name} (${deptName})`
                });
            });
        }

        return slots.filter(slot => slot.available);
    }

    generateDayTimeSlots(date) {
        const slots = [];
        const isWeekend = date.getDay() === 6; // Saturday
        
        if (isWeekend) {
            // Limited weekend hours
            return ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM"];
        }

        // Weekday slots
        const times = [
            "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
            "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
            "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
        ];

        // Randomly select 8-12 slots per day
        const numSlots = Math.floor(Math.random() * 5) + 8;
        const selectedTimes = [];
        
        for (let i = 0; i < numSlots; i++) {
            const randomTime = times[Math.floor(Math.random() * times.length)];
            if (!selectedTimes.includes(randomTime)) {
                selectedTimes.push(randomTime);
            }
        }

        return selectedTimes.sort();
    }

    getAllDoctors() {
        const allDoctors = [];
        Object.values(this.departments).forEach(dept => {
            allDoctors.push(...dept.doctors);
        });
        return allDoctors;
    }

    getDoctorDepartment(doctorId) {
        for (const [key, dept] of Object.entries(this.departments)) {
            if (dept.doctors.some(doc => doc.id === doctorId)) {
                return dept.name;
            }
        }
        return "General Medicine";
    }

    /**
     * Get appointments for specific time periods
     */
    getAppointmentsForToday() {
        return this.generateAppointmentSlots(null, 0).filter(slot => {
            const today = new Date();
            return slot.date.toDateString() === today.toDateString();
        });
    }

    getAppointmentsForTomorrow() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return this.generateAppointmentSlots(null, 0).filter(slot => {
            return slot.date.toDateString() === tomorrow.toDateString();
        });
    }

    getAppointmentsForThisWeek() {
        const today = new Date();
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

        return this.generateAppointmentSlots(null, 1).filter(slot => {
            return slot.date >= today && slot.date <= endOfWeek;
        });
    }

    getAppointmentsForNextWeek() {
        const nextMonday = new Date();
        nextMonday.setDate(nextMonday.getDate() + (7 - nextMonday.getDay() + 1));
        
        const nextSunday = new Date(nextMonday);
        nextSunday.setDate(nextMonday.getDate() + 6);

        return this.generateAppointmentSlots(null, 2).filter(slot => {
            return slot.date >= nextMonday && slot.date <= nextSunday;
        });
    }

    /**
     * Get department-specific information
     */
    getDepartmentInfo(departmentName) {
        const dept = this.departments[departmentName.toLowerCase()];
        if (!dept) return null;

        return {
            ...dept,
            appointments: this.generateAppointmentSlots(departmentName.toLowerCase(), 2)
        };
    }

    /**
     * Search for doctors by name or specialization
     */
    searchDoctors(query) {
        const allDoctors = this.getAllDoctors();
        const searchTerm = query.toLowerCase();

        return allDoctors.filter(doctor => 
            doctor.name.toLowerCase().includes(searchTerm) ||
            doctor.specialization.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Get hospital general information
     */
    getHospitalInfo() {
        return this.hospitalInfo;
    }

    /**
     * Get emergency contact information
     */
    getEmergencyInfo() {
        return {
            phone: this.hospitalInfo.emergencyPhone,
            address: this.hospitalInfo.address,
            available24x7: true,
            services: ["Trauma Care", "Cardiac Emergency", "Stroke Care", "Poison Control"]
        };
    }

    /**
     * Mock patient data for realistic conversations
     */
    getPatientScenarios() {
        return [
            {
                scenario: "chest_pain",
                symptoms: "chest discomfort, shortness of breath",
                urgency: "high",
                department: "cardiology",
                recommendedAction: "Visit emergency department immediately"
            },
            {
                scenario: "headache",
                symptoms: "persistent headache, vision changes",
                urgency: "medium",
                department: "neurology",
                recommendedAction: "Schedule appointment within 1-2 days"
            },
            {
                scenario: "skin_rash",
                symptoms: "itchy red rash, spreading",
                urgency: "low",
                department: "dermatology",
                recommendedAction: "Schedule appointment within 1 week"
            }
        ];
    }
}

module.exports = new HospitalDatabase();
