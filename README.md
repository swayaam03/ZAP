# ZAP  🧠

> AI-powered habit-tracking platform for Hackanova 5.0  
> Theme: "Break the Loop, Create the Future" — Agentic AI Track

## ✨ Features

- 🔐 **Firebase Authentication** — Email/Password + Google Sign-In
- 📋 **Task Management** — Full CRUD with categories (Work, Health, Learning, Relationships)
- 🔥 **Streak System** — Per-category streaks with Ice Streak protection
- 🎮 **Gamification** — XP, levels, milestones, progress tracking
- 📊 **Dashboard** — Today view, Progress analytics, Insights
- 🤖 **AI Agent Architecture** — Pluggable agent system (Quest Master, Companion Bot, Stats Analyst)
- 👤 **Profile System** — 6-tab profile modal (Account, Security, Photo, Preferences, Goals, Stats)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + Framer Motion |
| Backend | Firebase (Auth, Firestore, Storage) |
| Routing | React Router DOM v6 |
| Icons | Lucide React |
| Date Utils | date-fns |

## Prerequisites

- Node.js v18 or higher
- Firebase account (free tier works)
- VS Code (recommended)

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/questmind.git
cd questmind
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Firebase

**a) Create Firebase project:**
1. Go to https://console.firebase.google.com
2. Create new project named `questmind`
3. Enable Authentication → Email/Password + Google
4. Create Firestore Database (test mode)
5. Enable Storage (test mode)

**b) Get your config:**
1. Project Settings → General → Your apps → Web app (`</>`)
2. Register app name `questmind-web`
3. Copy the config values

**c) Create environment file:**
```bash
cp .env.example .env
```
Open `.env` and fill in your Firebase values.

### 4. Run development server
```bash
npm run dev
```
Open http://localhost:5173

### 5. Build for production
```bash
npm run build
```

## 📁 Project Structure
```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Atomic: Button, Card, Modal, Input, Avatar, Badge
│   ├── layout/      # Sidebar, Header, Layout wrapper
│   ├── auth/        # Login, Register, PasswordReset
│   ├── dashboard/   # Dashboard views (Today, Progress, Insights)
│   ├── tasks/       # Task CRUD components
│   ├── streaks/     # Streak display components
│   └── profile/     # Profile modal with 6 tabs
├── contexts/        # React Context (AuthContext)
├── hooks/           # Custom hooks (useAuth, useTasks, useStreaks)
├── pages/           # Route-level page components
├── services/        # Firebase service layer (authService, taskService, streakService)
└── utils/           # Pure utility functions (xpCalculator, streakCalculator, validation)
```

## 🤖 AI Agent Architecture

QuestMind uses a pluggable agent system designed for future Agentic AI integration:

| Agent | Role |
|-------|------|
| **Quest Master** | Breaks goals into adaptive micro-tasks |
| **Companion Bot** | Motivational nudges, streak celebrations |
| **Stats Analyst** | Pattern analysis, optimal timing suggestions |
| **Reward Agent** | XP multipliers, achievement unlocks |

## 🏆 Gamification System

- **XP** — earned by completing tasks (scaled by priority & category)
- **Levels** — every 500 XP = 1 level up (1–100)
- **Streaks** — tracked per category; consecutive daily completions
- **Ice Streak** — miss one day without losing your streak (24h window)
- **Milestones** — special badges at 7, 30, 100-day streaks

## Team

**QuestMind** — St. Francis Institute of Technology  
Hackanova 5.0 — Agentic AI Track

## Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request
