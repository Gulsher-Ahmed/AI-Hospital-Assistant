const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import new AI-driven system
const llmService = require('./services/llmService-receptionist');
const departmentAgents = require('./agents/departmentAgents-new');
const hospitalData = require('./database/hospitalData');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve the new ChatGPT-style interface as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/chatgpt-style-receptionist.html'));
});

// Helper functions for AI routing
function isEmergency(message) {
    const emergencyKeywords = ['emergency', 'urgent', 'help', 'pain', 'bleeding', 'cant breathe', 'heart attack', 'stroke'];
    return emergencyKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

function isGreeting(message) {
    const greetingKeywords = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetingKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        console.log('📨 Raw request body:', req.body);
        console.log('📨 Request headers:', req.headers);
        
        const { message, context = {} } = req.body;
        console.log('📨 Received message:', message);
        console.log('🗂️ Received context:', JSON.stringify(context, null, 2));

        let response;
        
        // Check for emergency
        if (isEmergency(message)) {
            response = await departmentAgents.routeQuery(message, context);
        }
        // Check for greeting
        else if (isGreeting(message)) {
            response = await departmentAgents.routeQuery(message, context);
        }
        // Route to appropriate department specialist
        else {
            response = await departmentAgents.routeQuery(message, context);
        }

        res.json({ 
            response: response,
            type: 'ai_response',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error in chat endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to process message',
            details: error.message 
        });
    }
});

// Appointment booking endpoint
app.post('/api/book-appointment', async (req, res) => {
    try {
        const { appointmentId, patientInfo } = req.body;
        console.log('📅 Booking appointment:', appointmentId);

        // Generate a realistic booking response
        const response = `✅ Appointment successfully booked!

**Appointment Details:**
• ID: ${appointmentId}
• Patient: ${patientInfo.name}
• Phone: ${patientInfo.phone}
• Email: ${patientInfo.email}

You will receive a confirmation email shortly. Please arrive 15 minutes early for check-in.

If you need to reschedule or cancel, please call (555) 123-4567 at least 24 hours in advance.`;

        res.json({ 
            success: true,
            message: response,
            appointmentId: appointmentId
        });
        
    } catch (error) {
        console.error('❌ Error booking appointment:', error);
        res.status(500).json({ 
            error: 'Booking failed',
            details: error.message 
        });
    }
});

// Search appointments endpoint
app.get('/api/search-appointments', async (req, res) => {
    try {
        const { query, department, date } = req.query;
        console.log('🔍 Searching appointments with criteria:', { query, department, date });

        // For demo purposes, return some sample appointments
        const sampleAppointments = [
            { id: 1, doctor: 'Dr. Smith', department: 'Cardiology', time: '2:00 PM', date: 'Tomorrow' },
            { id: 2, doctor: 'Dr. Johnson', department: 'Internal Medicine', time: '10:30 AM', date: 'Thursday' },
            { id: 3, doctor: 'Dr. Williams', department: 'General Practice', time: '3:15 PM', date: 'Friday' }
        ];

        res.json({ 
            appointments: sampleAppointments,
            searchCriteria: { query, department, date }
        });
        
    } catch (error) {
        console.error('❌ Error searching appointments:', error);
        res.status(500).json({ 
            error: 'Search failed',
            details: error.message 
        });
    }
});

// Get all departments endpoint
app.get('/api/departments', (req, res) => {
    try {
        const departments = Object.values(hospitalData.departments);
        res.json({ departments });
    } catch (error) {
        console.error('❌ Error getting departments:', error);
        res.status(500).json({ 
            error: 'Failed to get departments',
            details: error.message 
        });
    }
});

// Get appointments by department
app.get('/api/appointments/:department?', (req, res) => {
    try {
        const { department } = req.params;
        const { limit = 6 } = req.query;
        
        const appointments = department ? 
            hospitalData.generateAppointmentSlots(department, 2).slice(0, parseInt(limit)) :
            hospitalData.generateAppointmentSlots(null, 2).slice(0, parseInt(limit));
        
        res.json({ 
            appointments,
            department: department || 'all'
        });
    } catch (error) {
        console.error('❌ Error getting appointments:', error);
        res.status(500).json({ 
            error: 'Failed to get appointments',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const llmHealth = await llmService.healthCheck();
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                llm: llmHealth,
                database: { status: 'healthy', service: 'hospitalData' },
                server: { status: 'healthy', port: PORT }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        availableRoutes: [
            'GET /',
            'POST /api/chat',
            'POST /api/book-appointment',
            'GET /api/search-appointments',
            'GET /api/departments',
            'GET /api/appointments/:department?',
            'GET /api/health'
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        details: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🏥 AI-Driven Hospital Management Server running on port ${PORT}`);
    console.log(`💬 Chat API available at http://localhost:${PORT}/api/chat`);
    console.log(`📅 Booking API available at http://localhost:${PORT}/api/book-appointment`);
    console.log(`🌐 ChatGPT-style Frontend available at http://localhost:${PORT}`);
    console.log(`🤖 Powered by Groq AI with department specialists`);
});

module.exports = app;
