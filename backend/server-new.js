const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import new AI-driven system
const llmService = require('./services/llmService');
const DepartmentAgents = require('./agents/departmentAgents');
const HospitalDatabase = require('./database/hospitalDB');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize AI-driven system
const departmentAgents = new DepartmentAgents(llmService);
const hospitalDB = new HospitalDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve the new ChatGPT-style interface as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/chatgpt-style.html'));
});

// Chat endpoint - AI-driven routing
app.post('/api/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }

        console.log('📨 Received message:', message);

        // Detect message type and route appropriately
        let response;

        // Check for emergency keywords first
        if (isEmergency(message)) {
            response = await departmentAgents.handleEmergency(message, context);
        }
        // Check for greeting
        else if (isGreeting(message)) {
            response = await departmentAgents.handleGreeting(message, context);
        }
        // Route to appropriate department specialist
        else {
            response = await departmentAgents.routeToSpecialist(message, context);
        }
        
        console.log('🤖 AI Response:', response.type);
        
        res.json(response);
    } catch (error) {
        console.error('❌ Error in chat endpoint:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Appointment booking endpoint
app.post('/api/book-appointment', async (req, res) => {
    try {
        const { appointmentId, patientInfo } = req.body;
        
        if (!appointmentId || !patientInfo) {
            return res.status(400).json({ 
                error: 'Appointment ID and patient info are required' 
            });
        }

        console.log('📅 Booking appointment:', appointmentId);

        const response = await departmentAgents.handleAppointmentBooking(appointmentId, patientInfo);
        
        res.json(response);
    } catch (error) {
        console.error('❌ Error booking appointment:', error);
        res.status(500).json({ 
            error: 'Booking failed',
            details: error.message 
        });
    }
});

// Search appointments endpoint
app.post('/api/search-appointments', async (req, res) => {
    try {
        const criteria = req.body;
        
        console.log('🔍 Searching appointments with criteria:', criteria);

        const response = await departmentAgents.searchAppointments(criteria);
        
        res.json(response);
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
        const departments = hospitalDB.getAllDepartments();
        res.json({ departments });
    } catch (error) {
        console.error('❌ Error getting departments:', error);
        res.status(500).json({ 
            error: 'Failed to get departments',
            details: error.message 
        });
    }
});

// Get available appointments endpoint
app.get('/api/appointments/:department?', (req, res) => {
    try {
        const { department } = req.params;
        const { limit = 6 } = req.query;
        
        const appointments = hospitalDB.getAvailableAppointments(department, parseInt(limit));
        
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
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        system: 'AI-Driven Hospital Management'
    });
});

// Serve the new ChatGPT-style frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve static files from frontend
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// Catch all other routes and serve the ChatGPT interface
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Utility functions for message classification
function isEmergency(message) {
    const emergencyKeywords = [
        'emergency', 'urgent', 'help', 'pain', 'bleeding', 'can\'t breathe',
        'chest pain', 'heart attack', 'stroke', 'unconscious', 'severe',
        'ambulance', '911', 'dying', 'critical', 'serious injury'
    ];
    
    const messageLower = message.toLowerCase();
    return emergencyKeywords.some(keyword => messageLower.includes(keyword));
}

function isGreeting(message) {
    const greetingKeywords = [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
        'how are you', 'what can you do', 'help me', 'start', 'welcome'
    ];
    
    const messageLower = message.toLowerCase().trim();
    
    // Simple greeting detection
    if (messageLower.length < 20) {
        return greetingKeywords.some(keyword => messageLower.includes(keyword));
    }
    
    return false;
}

// Auto-refresh appointment data every 5 minutes
setInterval(() => {
    departmentAgents.refreshData();
    console.log('🔄 Refreshed appointment data');
}, 5 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`🏥 AI-Driven Hospital Management Server running on port ${PORT}`);
    console.log(`💬 Chat API available at http://localhost:${PORT}/api/chat`);
    console.log(`📅 Booking API available at http://localhost:${PORT}/api/book-appointment`);
    console.log(`🌐 ChatGPT-style Frontend available at http://localhost:${PORT}`);
    console.log(`🤖 Powered by Groq AI with department specialists`);
});
