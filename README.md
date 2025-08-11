# AI-Driven Hospital Management System

A modern, ChatGPT-style hospital management system powered by Groq AI with department-specific medical experts.

## 🏥 Features

- **ChatGPT-Style Interface**: Clean, modern dark theme interface
- **AI-Powered Medical Assistant**: Groq LLM integration with medical expertise
- **Department-Specific Agents**: Specialized AI for Cardiology, Neurology, Dermatology, Pediatrics, etc.
- **Smart Appointment Booking**: Dynamic appointment slots with clickable containers
- **Emergency Support**: Quick access to emergency services and urgent care
- **Concise Responses**: Brief, professional medical information (1-2 sentences)
- **Real-time Chat**: Instant AI responses with typing indicators

## 🚀 Tech Stack

- **Backend**: Node.js + Express.js
- **AI Model**: Groq LLaMA 3.3 70B Versatile
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: In-memory JSON database (easily replaceable)
- **APIs**: RESTful endpoints for chat and appointment booking
- **Extensible Design**: Ready for future STT/TTS integration

## Agents

1. **Greeting Agent** - Welcomes users and captures initial intent
2. **Router Agent** - Classifies requests and routes to appropriate agents
3. **Appointment Scheduler** - Manages doctor appointment bookings
4. **HR Agent** - Handles HR policy questions
5. **Closing Agent** - Wraps up conversations politely
6. **Fallback Agent** - Handles unknown/unclear requests

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js + Express
- **LLM**: OpenAI API (configurable)
- **Database**: In-memory JSON (mock data)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (optional - can use mock responses)

### Installation

1. **Clone and navigate to project directory**
   ```bash
   cd "C:\Users\hp\Desktop\New folder (2)"
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # In backend directory, create .env file
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   echo "PORT=3001" >> .env
   echo "USE_MOCK_LLM=true" >> .env
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Backend will run on http://localhost:3001

2. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Open your browser and navigate to http://localhost:5173**

## Usage

1. Open the chat interface
2. Type a message to start the conversation
3. The system will route your request to the appropriate agent
4. Continue the conversation as needed

### Example Conversations

**Appointment Booking:**
- "I need to book an appointment with a doctor"
- "What slots are available for Dr. Smith?"

**HR Queries:**
- "What is the company leave policy?"
- "How do I submit a timesheet?"

## Project Structure

```
├── backend/
│   ├── server.js              # Main Express server
│   ├── routes/
│   │   └── router.js          # API routes
│   ├── agents/
│   │   ├── greetingAgent.js   # Welcome messages
│   │   ├── routerAgent.js     # Request routing
│   │   ├── appointmentAgent.js # Appointment booking
│   │   ├── hrAgent.js         # HR queries
│   │   ├── closingAgent.js    # Conversation ending
│   │   └── fallbackAgent.js   # Unknown requests
│   ├── data/
│   │   └── appointments.json  # Mock appointment data
│   ├── services/
│   │   └── llmService.js      # LLM API integration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── components/
│   │   │   └── ChatInterface.jsx # Chat UI
│   │   ├── services/
│   │   │   └── api.js         # API calls
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## API Endpoints

- `POST /api/chat` - Main chat endpoint
- `GET /api/appointments` - Get available appointments
- `POST /api/appointments/book` - Book an appointment

## Future Enhancements

- Speech-to-Text (STT) integration
- Text-to-Speech (TTS) integration
- MCP server integration for telephony
- Database persistence
- Authentication and user management
- Analytics and conversation logging

## Development Notes

- Set `USE_MOCK_LLM=true` in `.env` to use mock responses without OpenAI API
- Mock responses are defined in each agent file for testing
- All agents are modular and can be extended independently
- The router uses LLM to classify intent and route requests

## Troubleshooting

1. **Backend won't start**: Check if port 3001 is available
2. **Frontend won't connect**: Ensure backend is running first
3. **LLM errors**: Check OpenAI API key or enable mock mode
4. **CORS issues**: Backend includes CORS configuration for local development
