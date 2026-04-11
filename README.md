# 🛡️ AdminGuard — AI-Powered Employee Screen Monitoring System

> A full-stack employee productivity monitoring system that captures screens, detects distractions using AI, and provides real-time analytics through an intelligent chatbot.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Important Notes](#important-notes)

---

## 🧠 Overview

**AdminGuard** is an AI-powered employee screen monitoring system that automatically captures employee screens, intelligently categorizes activity as **Work**, **Break**, or **Distraction**, and stores everything securely in a PostgreSQL database.

Managers can monitor their team in real time through a React dashboard and interact with an **AI Productivity Analyst Chatbot** that answers questions about employee activity in plain English — no SQL required.

---

## 🚀 Features

### 🖥️ Screen Capture Agent
- Automatically captures screenshots every **60 seconds** in Work mode
- Takes a single screenshot in **Break mode** then stops
- Detects the **active focused window** to determine work vs distraction
- Uploads screenshots securely to the backend server

### 🤖 AI Distraction Detection
- Identifies distraction apps: YouTube, Netflix, Facebook, Instagram, WhatsApp, Twitter, Telegram
- Recognizes work apps: VS Code, PyCharm, Notepad++, PowerShell, Git, and more
- Automatically labels each capture as `Work`, `Break`, or `Distraction`

### 📊 Manager Dashboard
- Live employee list with status indicators
- Screenshot gallery per employee
- Filter by employee ID and date range
- Real-time activity metrics:
  - Total Employees
  - Total Captures
  - Distraction Rate
  - Active Filter

### 💬 AI Productivity Analyst Chatbot
Ask natural language questions about your team:
- *"Which employee was most distracted today?"*
- *"How many hours did EMP_100 work this week?"*
- *"Show me all distraction events from Monday"*

Powered by **Groq LLM** via **LangChain** — connects directly to your live database.

### 👤 Employee Portal
- Employees log in and control their own session (Work / Break)
- View their own recent captures
- See system notices about monitoring policies

### 🔐 Authentication
- Admin login with full dashboard access
- Employee login with personal portal access

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | FastAPI (Python) |
| **Database** | PostgreSQL + SQLAlchemy |
| **Agent** | Python (PyAutoGUI, PyGetWindow) |
| **AI / LLM** | Groq LLM via LangChain |
| **Auth** | Custom login with role-based access |
| **Deployment** | Local network (multi-device) |

---

## 📂 Project Structure

```
Employee_Screen_Capturing/
│
├── backend/                    # FastAPI backend server
│   ├── main.py                 # Main API routes
│   ├── database.py             # Database models & connection
│   ├── analyst_service.py      # AI chatbot logic
│   ├── config.py               # Configuration settings
│   ├── .env                    # Environment variables (not committed)
│   ├── .env.example            # Example environment config
│   ├── requirement.txt         # Python dependencies
│   └── screenshots/            # Captured screenshots storage
│
├── client/                     # Screen capture agent
│   ├── agent.py                # Main capture & upload agent
│   ├── agent_config.json       # Agent configuration
│   └── requirement.txt         # Agent dependencies
│
└── dashboard-react/            # React frontend
    ├── src/
    ├── public/
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/Basma-Naghman/Employee_Screen_Capturing_System.git
cd Employee_Screen_Capturing_System
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirement.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials (see Configuration section)

# Run the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 3. Frontend Setup

```bash
cd dashboard-react

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: `http://localhost:3000`

---

### 4. Agent Setup (Client Machine)

```bash
cd client

# Install dependencies
pip install -r requirement.txt

# Agent is triggered automatically by the backend
# Or run manually:
python agent.py EMP_100 Work
```

---

## 🔧 Configuration

Create a `.env` file inside the `backend/` folder:

```env
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/monitor_db

# Server
HOST=0.0.0.0
PORT=8000

# Admin Credentials
ADMIN_USER=admin
ADMIN_PASSWORD=yourpassword

# AI Chatbot
GROQ_API_KEY=your_groq_api_key_here

# Frontend
FRONTEND_URL=http://localhost:3000
```

> ⚠️ **Never commit your `.env` file.** Make sure `.env` is listed in `.gitignore`.

Get your free Groq API key at: https://console.groq.com/keys

---

## 🖱️ Usage

### Admin Login
```
ID: admin
Password: (set in .env)
```

### Employee Login
```
ID: EMP_100  (or any registered employee ID)
```

### Starting Monitoring
1. Login as Admin
2. Select an employee from the Staff Directory
3. Click **Start Monitoring** → agent begins capturing every 60 seconds
4. Click **Pause Work** to switch to Break mode
5. Use the **AI Chatbot** to query activity data

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Admin or employee login |
| `GET` | `/get-employees` | Fetch all employees |
| `POST` | `/add-employee` | Add a new employee |
| `DELETE` | `/delete-employee/{id}` | Remove an employee |
| `POST` | `/upload-screenshot` | Upload captured screenshot |
| `GET` | `/check-db` | Query screenshot logs |
| `POST` | `/trigger-system-capture` | Start/stop agent |
| `POST` | `/ask-analyst` | Ask AI chatbot a question |
| `GET` | `/get-last-employee` | Get last active employee |

---

## ⚠️ Important Notes

- This system is intended for **authorized workplace monitoring** with employee awareness
- Screenshots are stored locally in `backend/screenshots/`
- The AI agent runs on the **employee's machine** and connects to the backend server over local network
- Make sure both devices are on the **same network** and the correct server IP is set in `agent.py`
- Always **regenerate your Groq API key** if it is accidentally exposed in a commit

---

## 👩‍💻 Author

**Basma Naghman**  
GitHub: [@Basma-Naghman](https://github.com/Basma-Naghman)

---

## 📄 License

This project is for educational and demonstration purposes.  
Always ensure compliance with local labor laws before deploying in a workplace.
