# AI Call Center POC - Complete Setup Guide

## 🚀 Complete End-to-End AI Call Center System

This is a fully functional multi-agent, router-based, LLM-powered AI call center system built with React and Node.js.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

3. **OpenAI API Key** (optional - can use mock mode)
   - Sign up at: https://platform.openai.com/
   - Create API key at: https://platform.openai.com/api-keys

## 🏗️ Project Structure

```
ai-call-center-poc/
├── backend/                 # Node.js + Express API server
│   ├── agents/             # AI agent implementations
│   │   ├── greetingAgent.js    # Welcome & initial interaction
│   │   ├── routerAgent.js      # Intelligent request routing  
│   │   ├── appointmentAgent.js # Appointment scheduling
│   │   ├── hrAgent.js          # HR policy questions
│   │   ├── closingAgent.js     # Conversation wrap-up
│   │   └── fallbackAgent.js    # Unknown request handling
│   ├── services/
│   │   └── llmService.js       # OpenAI API integration
│   ├── routes/
│   │   └── router.js           # API route handlers
│   ├── data/
│   │   └── appointments.json   # Mock appointment database
│   ├── server.js               # Main Express server
│   ├── package.json            # Backend dependencies
│   └── .env                    # Environment configuration
├── frontend/                # React chat interface
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatInterface.jsx   # Main chat component
│   │   ├── services/
│   │   │   └── api.js              # API communication
│   │   ├── App.jsx                 # Root React component
│   │   └── main.jsx                # React entry point
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite configuration
├── install.bat                 # Windows installation script
├── install.ps1                 # PowerShell installation script
├── start-servers.bat           # Windows server startup
├── start-servers.ps1           # PowerShell server startup
└── README.md                   # This file
```

## 🛠️ Installation

### Option 1: Automated Installation (Windows)

1. **Using Command Prompt:**
   ```cmd
   install.bat
   ```

2. **Using PowerShell:**
   ```powershell
   .\install.ps1
   ```

### Option 2: Manual Installation

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env file with your settings
   ```

## ⚙️ Configuration

Edit `backend/.env` file:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# LLM Configuration (set to true for testing without API key)
USE_MOCK_LLM=true

# Other settings
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

**For testing without OpenAI API:** Set `USE_MOCK_LLM=true`

## 🚀 Running the Application

### Option 1: Automated Startup (Windows)

1. **Using Command Prompt:**
   ```cmd
   start-servers.bat
   ```

2. **Using PowerShell:**
   ```powershell
   .\start-servers.ps1
   ```

### Option 2: Manual Startup

1. **Start Backend Server:**
   ```bash
   cd backend
   npm start
   ```
   Backend runs on: http://localhost:3001

2. **Start Frontend Server (in new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

3. **Open Browser:**
   Navigate to http://localhost:5173

## 🤖 AI Agents & Features

### Available Agents

1. **🎯 Router Agent**
   - Intelligently routes requests to appropriate agents
   - Uses LLM-based intent classification
   - Fallback to rule-based routing

2. **👋 Greeting Agent**
   - Welcomes users and captures initial intent
   - Provides service overview
   - Sets conversation tone

3. **📅 Appointment Agent**
   - Manages doctor appointment scheduling
   - Checks availability from mock database
   - Books and manages appointments

4. **👥 HR Agent**
   - Handles HR policy questions
   - Benefits information
   - Leave policies and procedures

5. **👋 Closing Agent**
   - Wraps up conversations politely
   - Satisfaction checks
   - Final assistance offers

6. **❓ Fallback Agent**
   - Handles unclear or unsupported requests
   - Provides human escalation options
   - Error handling and recovery

### Core Features

- **🎯 Multi-Agent Architecture:** Specialized agents for different request types
- **🧠 LLM-Based Routing:** Intelligent request classification and routing
- **💬 Text-Based Chat:** Clean, responsive React chat interface
- **📊 Mock Database:** JSON-based appointment and HR data
- **🔄 Session Management:** Conversation context and history
- **🛡️ Error Handling:** Graceful fallbacks and error recovery
- **📱 Responsive Design:** Works on desktop and mobile devices

## 🧪 Testing the System

### Example Conversations

1. **Appointment Booking:**
   ```
   User: "I need to book an appointment with a doctor"
   → Routes to Appointment Agent
   → Shows available slots
   → Guides through booking process
   ```

2. **HR Queries:**
   ```
   User: "What is the company leave policy?"
   → Routes to HR Agent  
   → Provides detailed leave information
   → Offers additional HR assistance
   ```

3. **General Help:**
   ```
   User: "Hello, I need help"
   → Routes to Greeting Agent
   → Welcomes user and explains services
   → Asks for specific assistance needed
   ```

### API Endpoints

- `POST /api/chat` - Main chat endpoint
- `GET /api/appointments` - Get available appointments  
- `POST /api/appointments/book` - Book appointment
- `GET /health` - Backend health check

## 🔧 Development & Customization

### Adding New Agents

1. **Create Agent File:**
   ```javascript
   // backend/agents/newAgent.js
   class NewAgent {
     async processMessage(message, session) {
       // Agent logic here
       return {
         message: "Response text",
         agent: this.name,
         context: {}
       };
     }
   }
   module.exports = new NewAgent();
   ```

2. **Update Router:**
   - Add agent to `backend/routes/router.js`
   - Update routing logic in `routerAgent.js`

### Customizing UI

- **Styling:** Edit `frontend/src/components/ChatInterface.css`
- **Components:** Modify `frontend/src/components/ChatInterface.jsx`
- **API Calls:** Update `frontend/src/services/api.js`

### Adding Real APIs

Replace mock implementations in agents with real API calls:
- Database integration for appointments
- HR system integration
- Calendar services
- Email notifications

## 🔮 Future Enhancements

### Ready for Integration

The architecture supports these future features:

1. **🎤 Speech-to-Text (STT)**
   - Add `sendVoiceMessage()` in `api.js`
   - Integrate with Web Speech API or cloud STT

2. **🔊 Text-to-Speech (TTS)**
   - Add `getTextToSpeech()` in `api.js`
   - Integrate with Web Speech API or cloud TTS

3. **📞 Telephony Integration**
   - MCP server for phone system integration
   - Real-time voice conversation handling

4. **📊 Analytics & Monitoring**
   - Conversation analytics
   - Agent performance metrics
   - User satisfaction tracking

5. **🗃️ Database Integration**
   - Replace JSON files with real databases
   - User management and authentication
   - Persistent conversation history

## 🐛 Troubleshooting

### Common Issues

1. **"npm command not found"**
   - Install Node.js from https://nodejs.org/
   - Restart terminal after installation

2. **"Port already in use"**
   - Change PORT in `backend/.env`
   - Kill processes using ports 3001 or 5173

3. **"Network Error"**
   - Ensure backend is running on port 3001
   - Check CORS configuration in `server.js`

4. **OpenAI API Errors**
   - Verify API key in `backend/.env`
   - Check API quota and billing
   - Enable mock mode: `USE_MOCK_LLM=true`

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review console logs in browser and terminal
- Verify all dependencies are installed
- Ensure both servers are running

## 📝 License

This project is for educational and proof-of-concept purposes.

---

**🎉 You're all set! Start chatting with your AI call center system!**
