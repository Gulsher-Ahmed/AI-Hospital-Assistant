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

## 📋 Prerequisites (What You Need Before Starting)

**Don't worry if you don't have these installed - we'll guide you through each step!**

1. **Node.js** - A runtime environment to run JavaScript on your computer
2. **A Groq API Key** - Free AI service for the medical assistant
3. **A Web Browser** - Chrome, Firefox, Edge, or Safari
4. **Basic Command Line** - We'll show you exactly what to type

---

## 🛠️ Complete Installation Guide (Step-by-Step)

### Step 1: Install Node.js (5 minutes)

**For Windows Users:**
1. Go to [nodejs.org](https://nodejs.org)
2. Click the **green "LTS" button** (Long Term Support version)
3. Download and run the installer
4. **Important:** Check the box "Automatically install necessary tools" during installation
5. Restart your computer after installation

**For Mac Users:**
1. Go to [nodejs.org](https://nodejs.org)
2. Click the **green "LTS" button**
3. Download and install the `.pkg` file
4. Follow the installation wizard

**For Linux Users:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL
sudo yum install nodejs npm
```

**Verify Installation:**
Open your terminal/command prompt and type:
```bash
node --version
npm --version
```
You should see version numbers like `v18.x.x` and `8.x.x`

### Step 2: Get Your Free Groq API Key (2 minutes)

1. Go to [console.groq.com](https://console.groq.com)
2. **Sign up for free** using your email or Google account
3. Once logged in, click **"API Keys"** in the left sidebar
4. Click **"Create API Key"**
5. Give it a name like "Hospital AI"
6. **Copy the API key** - it looks like: `gsk_xxxxxxxxxxxxxxxxxxxxx`
7. **Save this key somewhere safe** - you'll need it in Step 4

### Step 3: Download the Project (2 minutes)

**Option A: Using Git (Recommended)**
```bash
# Open terminal/command prompt and run:
git clone https://github.com/Gulsher-Ahmed/AI-Hospital-Assistant.git
cd AI-Hospital-Assistant
```

**Option B: Download ZIP**
1. Go to [https://github.com/Gulsher-Ahmed/AI-Hospital-Assistant](https://github.com/Gulsher-Ahmed/AI-Hospital-Assistant)
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to your Desktop
5. Open terminal/command prompt and navigate to the folder:
   ```bash
   cd Desktop/AI-Hospital-Assistant-main
   ```

### Step 4: Install Project Dependencies (3 minutes)

```bash
# Navigate to the backend folder
cd backend

# Install required packages (this might take 2-3 minutes)
npm install
```

You'll see lots of text scrolling - this is normal! Wait for it to finish.

### Step 5: Configure Your API Key (1 minute)

1. In the `backend` folder, create a new file called `.env`
2. Open the `.env` file in any text editor (Notepad, VS Code, etc.)
3. Add this line, replacing `YOUR_API_KEY_HERE` with your actual Groq API key:
4. I've used this model "https://console.groq.com/docs/model/openai/gpt-oss-120b"
5- go to the link and get your own APi for "openai/gpt-oss-120b" model
   ```
   GROQ_API_KEY=gsk_your_actual_api_key_here
   PORT=3001
   ```
4. Save the file

**Example:**
```
GROQ_API_KEY=gsk_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
PORT=3001
```

### Step 6: Start the Application (1 minute)

```bash
# Make sure you're in the backend folder, then run:
node server-new.js
```

You should see:
```
🏥 AI-Driven Hospital Management Server running on port 3001
💬 Chat API available at http://localhost:3001/api/chat
📅 Booking API available at http://localhost:3001/api/book-appointment
🌐 ChatGPT-style Frontend available at http://localhost:3001
🤖 Powered by Groq AI with department specialists
```

### Step 7: Open the Application (30 seconds)

1. Open your web browser
2. Go to: **http://localhost:3001**
3. You should see the hospital AI interface!

---

## 🎉 You're Done! How to Use the Application

### Chat with the AI Doctor
- Type any medical question like: *"I have a headache"*
- The AI will provide professional medical guidance
- Click the quick action buttons for common needs

### Book Appointments
- Click **"Book an Appointment"** 
- Choose from available time slots
- The system will show you department-specific appointments

### Emergency Help
- Click **"Emergency Help"** for urgent medical situations
- Get immediate contact information for emergency services

---

## 🔧 Troubleshooting Common Issues

### "Command not found: node"
**Solution:** Node.js isn't installed or not in your PATH
- Reinstall Node.js from [nodejs.org](https://nodejs.org)
- Restart your computer
- Try again

### "Error: Cannot find module"
**Solution:** Dependencies weren't installed properly
```bash
cd backend
rm -rf node_modules
npm install
```

### "API Error" or "No Response from AI"
**Solution:** Check your API key
1. Verify your `.env` file exists in the `backend` folder
2. Make sure your Groq API key is correct
3. Check if you have internet connection

### "Port 3001 already in use"
**Solution:** Stop other applications using the port
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux  
killall node
```

### Application Won't Load in Browser
**Solution:** 
1. Make sure the server is running (check terminal for success message)
2. Try: http://127.0.0.1:3001 instead
3. Check if your firewall is blocking the application

---

## 📱 Using the Application

### Quick Start Guide
1. **Start chatting** - Type any medical question
2. **Use quick buttons** - Click pre-made options for common needs
3. **Book appointments** - Click available time slots to schedule
4. **Emergency help** - Quick access to emergency contacts

### Example Conversations
- *"I have chest pain"* → Routed to Cardiology specialist
- *"My child has a fever"* → Routed to Pediatrics specialist  
- *"I need a general checkup"* → Shows available appointment slots
- *"What are your visiting hours?"* → Quick hospital information

---

## 🛑 How to Stop the Application

**To stop the server:**
1. Go back to your terminal/command prompt
2. Press `Ctrl + C` (Windows/Linux) or `Cmd + C` (Mac)
3. The server will stop

**To restart:**
```bash
cd backend
node server-new.js
```

---

## 🆘 Need Help?

**If you get stuck:**
1. Read the troubleshooting section above
2. Check that all steps were followed exactly
3. Ensure your internet connection is working
4. Make sure your Groq API key is valid
5. Create an issue on our [GitHub page](https://github.com/Gulsher-Ahmed/AI-Hospital-Assistant/issues)

**For technical support:**
- Email: support@example.com
- GitHub Issues: [Report a problem](https://github.com/Gulsher-Ahmed/AI-Hospital-Assistant/issues)
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

---

## 🏗️ Project Structure

```
AI-Hospital-Assistant/
├── backend/
│   ├── server-new.js           # Main AI-driven server
│   ├── config/
│   │   └── prompts.js          # AI prompts configuration
│   ├── services/
│   │   └── llmService.js       # Groq LLM integration
│   ├── agents/
│   │   └── departmentAgents.js # Department-specific AI agents
│   ├── database/
│   │   └── hospitalDB.js       # Hospital data management
│   └── package.json
├── frontend/
│   ├── chatgpt-style.html      # Main ChatGPT-style interface
│   ├── chatgpt-style.js        # Frontend JavaScript
│   └── [other UI files]
├── .gitignore                  # Excludes sensitive files
└── README.md                   # This file
```

## 🤖 AI Capabilities

### Medical Expertise
- **General Medical Queries**: Symptoms, conditions, treatments
- **Department Routing**: Automatic routing to specialist departments
- **Emergency Detection**: Quick identification of urgent medical needs
- **Appointment Assistance**: Smart booking with available slots

### Department Specialists
- **Cardiology**: Heart conditions, cardiovascular health
- **Neurology**: Brain and nervous system disorders
- **Dermatology**: Skin conditions and treatments
- **Pediatrics**: Child healthcare and development
- **Internal Medicine**: General adult healthcare
- **Emergency Medicine**: Urgent and critical care

## 📱 API Endpoints

### Chat API
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "I have chest pain",
  "context": {
    "department": null,
    "history": []
  }
}
```

### Appointment Booking
```bash
POST /api/book-appointment
Content-Type: application/json

{
  "appointmentId": "card_001",
  "patientInfo": {
    "name": "John Doe",
    "phone": "555-123-4567",
    "email": "john@example.com"
  }
}
```

## 🎨 Interface Features

- **Dark Theme**: Professional ChatGPT-inspired design
- **Quick Actions**: Pre-defined buttons for common queries
- **Typing Indicators**: Real-time response feedback
- **Appointment Containers**: Clickable appointment slots
- **Department Cards**: Visual department selection
- **Responsive Design**: Mobile and desktop friendly

## 🔧 Configuration

### AI Model Settings
- **Model**: llama-3.3-70b-versatile
- **Max Tokens**: 150 (for concise responses)
- **Temperature**: 0.5 (balanced creativity/consistency)

### Prompts Customization
Edit `backend/config/prompts.js` to customize AI behavior:
- Medical expertise prompts
- Department-specific templates
- Emergency response protocols

## 🚀 Deployment

### Local Development
```bash
cd backend
node server-new.js
```

### Production Deployment
1. Set environment variables on your hosting platform
2. Update GROQ_API_KEY in production
3. Configure proper CORS settings
4. Set up process manager (PM2 recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Groq AI for powerful LLM capabilities
- Medical professionals for domain expertise guidance
- Open source community for inspiration

---

**⚠️ Important Notice**: This system is for informational purposes only and should not replace professional medical advice. Always consult with healthcare professionals for medical concerns.
