const express = require('express');
const router = express.Router();
const greetingAgent = require('../agents/greetingAgent');
const routerAgent = require('../agents/routerAgent');
const appointmentAgent = require('../agents/appointmentAgent');
const hrAgent = require('../agents/hrAgent');
const closingAgent = require('../agents/closingAgent');
const fallbackAgent = require('../agents/fallbackAgent');
const DatabaseService = require('../services/databaseService');

// Store conversation sessions (in production, use Redis or database)
const conversationSessions = new Map();

// Chat endpoint - main entry point for all conversations
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default', conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`📥 Received message: "${message}" [Session: ${sessionId}]`);

    // Get or create session
    let session = conversationSessions.get(sessionId) || {
      id: sessionId,
      history: conversationHistory,
      currentAgent: null,
      context: {}
    };

    // If this is the first message or no current agent, start with greeting
    if (!session.currentAgent || session.history.length === 0) {
      console.log('🎯 Routing to Greeting Agent');
      const response = await greetingAgent.processMessage(message, session);
      
      session.history.push({ role: 'user', content: message });
      session.history.push({ role: 'assistant', content: response.message });
      session.currentAgent = 'greeting';
      
      conversationSessions.set(sessionId, session);
      
      return res.json({
        message: response.message,
        agent: 'greeting',
        sessionId: sessionId,
        conversationHistory: session.history
      });
    }

    // Use router to determine next agent
    console.log('🎯 Using Router Agent to determine routing');
    const routingDecision = await routerAgent.processMessage(message, session);
    
    let agentResponse;
    let targetAgent = routingDecision.route_to;

    console.log(`🎯 Routing to: ${targetAgent}`);

    // Route to appropriate agent
    switch (targetAgent) {
      case 'appointment':
        agentResponse = await appointmentAgent.processMessage(message, session);
        break;
      case 'hr':
        agentResponse = await hrAgent.processMessage(message, session);
        break;
      case 'closing':
        agentResponse = await closingAgent.processMessage(message, session);
        break;
      case 'greeting':
        agentResponse = await greetingAgent.processMessage(message, session);
        break;
      default:
        agentResponse = await fallbackAgent.processMessage(message, session);
        targetAgent = 'fallback';
    }

    // Update session
    session.history.push({ role: 'user', content: message });
    session.history.push({ role: 'assistant', content: agentResponse.message });
    session.currentAgent = targetAgent;
    
    // Merge any context updates from the agent
    if (agentResponse.context) {
      session.context = { ...session.context, ...agentResponse.context };
    }

    conversationSessions.set(sessionId, session);

    res.json({
      message: agentResponse.message,
      agent: targetAgent,
      sessionId: sessionId,
      conversationHistory: session.history,
      context: session.context
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: 'I apologize, but I encountered an error. Please try again.'
    });
  }
});

// Get available appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await appointmentAgent.getAvailableAppointments();
    res.json(appointments);
  } catch (error) {
    console.error('❌ Error getting appointments:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

// Book an appointment
router.post('/appointments/book', async (req, res) => {
  try {
    const { doctor, slot, patientName, sessionId = 'default' } = req.body;
    
    if (!doctor || !slot || !patientName) {
      return res.status(400).json({ error: 'Doctor, slot, and patient name are required' });
    }

    const result = await appointmentAgent.bookAppointment(doctor, slot, patientName);
    
    // Update session context if booking was successful
    if (result.success) {
      const session = conversationSessions.get(sessionId);
      if (session) {
        session.context.lastBooking = { doctor, slot, patientName };
        conversationSessions.set(sessionId, session);
      }
    }

    res.json(result);
  } catch (error) {
    console.error('❌ Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Get session info (for debugging)
router.get('/session/:sessionId', (req, res) => {
  const session = conversationSessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// Clear session
router.delete('/session/:sessionId', (req, res) => {
  const deleted = conversationSessions.delete(req.params.sessionId);
  res.json({ success: deleted });
});

// Database endpoints for testing and data access
router.get('/doctors', (req, res) => {
  try {
    const doctors = DatabaseService.getDoctors();
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors', details: error.message });
  }
});

router.get('/appointments/available', (req, res) => {
  try {
    const { doctorId } = req.query;
    const availableSlots = DatabaseService.getAvailableSlots(doctorId ? parseInt(doctorId) : null);
    res.json({ success: true, data: availableSlots });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available slots', details: error.message });
  }
});

router.post('/appointments/book', (req, res) => {
  try {
    const { patientName, doctorId, appointmentTime, reason, sessionId } = req.body;
    const result = DatabaseService.bookAppointment(patientName, doctorId, appointmentTime, reason, sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to book appointment', details: error.message });
  }
});

router.get('/hr/policies', (req, res) => {
  try {
    const policies = DatabaseService.getHRPolicies();
    res.json({ success: true, data: policies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch HR policies', details: error.message });
  }
});

router.get('/company/info', (req, res) => {
  try {
    const info = DatabaseService.getCompanyInfo();
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company info', details: error.message });
  }
});

module.exports = router;
