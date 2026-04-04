# ZAP — Smart Deadline Planner for Students 

> **"Deadlines messed up? We ZAP it."**

ZAP is a student-focused productivity enhancement layer, Smart Deadline Planner for Students. It adds academic planning, deadline management, zero-clash scheduling, it detects procrastination by students and has AI-powered study assistance.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (`node -v`)
- npm (`npm -v`)
- Firebase account

### Installation

# 1. Clone the repository
git clone https://github.com/aarushi2512/ZAP.git
cd ZAP

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env

# 4. Fill in your Firebase credentials in .env

# 5. Start development server
npm run dev


📦 Project Structure
ZAP/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Register, Onboarding
│   │   ├── dashboard/      # TodayView, ProgressView, InsightsView, AgentsView
│   │   ├── layout/         # Sidebar, Layout, Header
│   │   └── tasks/          # TaskCard, TaskModal, TaskList
│   ├── hooks/
│   │   ├── useAuth.js      # Authentication hook
│   │   ├── useTasks.js     # Task management hook
│   │   ├── useStreaks.js   # Streak tracking hook
│   │   ├── useStudentProfile.js  # ZAP: Student profile hook
│   │   └── useClashDetection.js  # ZAP: Deadline clash detection
│   ├── services/
│   │   ├── taskService.js  # Firestore task operations
│   │   └── aiService.js    # AI agent integrations
│   ├── store/
│   │   └── collabStore.ts  # ZAP: Collaboration state (Zustand)
│   ├── types/
│   │   ├── student.js      # ZAP: StudentProfile type definition
│   │   └── task.js         # ZAP: Extended Task schema
│   ├── utils/
│   │   ├── xpCalculator.js # XP and level calculations
│   │   └── validation.js   # Form validation utilities
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/
│   │   ├── Auth.jsx
│   │   ├── Home.jsx
│   │   └── Onboarding.jsx
│   ├── App.jsx             # Main app with routing
│   └── main.jsx            # Entry point
├── public/
├── firestore.rules         # ZAP: Firestore security rules
├── .env                    # Environment variables (DO NOT COMMIT)
├── .env.example            # Environment template (SAFE TO COMMIT)
├── package.json
└── README.md

🚀 Usage
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

🛠️ Tech Stack
Frontend: React 18, Vite
Styling: Tailwind CSS v4
Backend: Firebase (Auth, Firestore)
State Management: React Context, Zustand
Routing: React Router v6
Animations: Framer Motion

📋 Features
Block 1: Foundation 
Student profile management
Extended registration with academic details
Firestore security rules
Feature flag system

Block 2: Zero-Clash Engine (In Progress)
Deadline tracking
Clash detection
Priority management

Block 3: Collaboration 
Group project management
Shared notes and resources
Team task assignments
Role-based permissions
Collaborative workspaces

Block 4: Focus Mode ⏳
Pomodoro timer integration
Focus session tracking
Distraction blocking
Deep work scheduling
Session analytics

Block 5: AI & Insights ⏳
AI-powered study agents
Predictive performance insights
Personalized recommendations
Smart rescheduling suggestions
Learning pattern analysis

🤝 Contributing
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

👥 Team
Aarushi Arora 
Swayam Kandarkar
Dhvani Mistry
Prishita Mali


🙏 Acknowledgments
Icons by Lucide React
UI components with Framer Motion