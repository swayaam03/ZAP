# ZAP 🧠


> AI-powered habit-tracking platform  
> Theme: "Break the Loop, Create the Future" — Agentic AI Track
> **"Deadlines messed up? We ZAP it."**
> **Deadlines messed up? We ZAP it.** 

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Enabled-FFCA28?logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

## ✨  Features

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Team](#-team)
- [Contributing](#-contributing)
- [License](#-license)


---
## Features

### Core Features
- **Student Profile Management** - Track your school, major, and graduation
- **Smart Task Management** - Organize tasks with priorities and deadlines
- **Zero-Clash Detection** - Automatically detect conflicting deadlines
- **Streak Tracking** - Build consistency with XP and level system
- **Beautiful UI** - Clean, modern interface with Tailwind CSS

- **Collaboration** - Group projects and shared workspaces
- **Focus Mode** - Pomodoro timer and deep work sessions
- **AI Insights** - Smart recommendations and study agents


---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18, Vite |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Firebase (Auth, Firestore) |
| **State** | React Context, Zustand |
| **Routing** | React Router v6 |
| **UI** | Framer Motion, Lucide Icons |


---
## Installation

```bash
# Clone the repository
git clone https://github.com/aarushi2512/ZAP.git
cd ZAP

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Firebase credentials
npm run dev

ZAP is a student-focused productivity enhancement layer, Smart Deadline Planner for Students. It adds academic planning, deadline management, zero-clash scheduling, it detects procrastination by students and has AI-powered study assistance.


## Project Structure
ZAP/
├──  src/
│   ├── 📂 components/       # React components
│   │   ├── auth/           # Login, Register, Onboarding
│   │   ├── dashboard/      # Today, Progress, Insights, Agents
│   │   ├── layout/         # Sidebar, Layout, Header
│   │   └── tasks/          # TaskCard, TaskModal, TaskList
│   ├── 📂 hooks/           # Custom React hooks
│   ├── 📂 services/        # Firebase & API services
│   ├── 📂 store/           # State management (Zustand)
│   ├── 📂 types/           # Type definitions
│   ├── 📂 utils/           # Helper functions
│   ├── 📂 contexts/        # React contexts
│   └──  pages/           # Page components
├── 📂 public/              # Static assets
├── firestore.rules         # Firebase security rules
├── .env.example            # Environment template
├── package.json
└── README.md


## Usage
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```


## Features

### Block 1: Foundation 
- Student profile management (school, major, year, graduation)
- Extended registration with academic details
- Firestore security rules
- Feature flag system (ZAP_ENABLED)
- XP and level tracking

### Block 2: Zero-Clash Engine 
- Deadline tracking for tasks
- Automatic clash detection
- Priority management (critical, high, medium, low)
- Time estimation per task
- Urgency indicators

### Block 3: Collaboration 
- Group project management
- Shared notes and resources
- Team task assignments
- Role-based permissions
- Collaborative workspaces

### Block 4: Focus Mode 
- Pomodoro timer integration
- Focus session tracking
- Distraction blocking
- Deep work scheduling
- Session analytics

### Block 5: AI & Insights 
- AI-powered study agents
- Predictive performance insights
- Personalized recommendations
- Smart rescheduling suggestions
- Learning pattern analysis


## Roadmap

- [ ] Block 1: Foundation
- [ ] Block 2: Zero-Clash Engine 
- [ ] Block 3: Collaboration
- [ ] Block 4: Focus Mode
- [ ] Block 5: AI & Insights

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## Team

- **Aarushi Arora** - [@aarushi2512](https://github.com/aarushi2512)
- **Swayam Kandarkar**
- **Dhvani Mistry**
- **Prishita Mali**


## Acknowledgments

- Icons by Lucide React
- UI components with Framer Motion
```
