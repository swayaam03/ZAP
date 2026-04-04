// FILE: src/App.jsx
// ACTION: Replace Entire
// QUESTMIND INTEGRATION: Adds ZAP feature flag system (safe, no UI changes yet)

import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useAuth } from './hooks/useAuth'

import Auth          from './pages/Auth'
import Home          from './pages/Home'
import Onboarding    from './pages/Onboarding'
import Layout        from './components/layout/Layout'
import TodayView     from './components/dashboard/TodayView'
import ProgressView  from './components/dashboard/ProgressView'
import InsightsView  from './components/dashboard/InsightsView'
import AgentsView    from './components/dashboard/AgentsView'
import AISolver      from './components/dashboard/AISolver'
import TaskList      from './components/tasks/TaskList'
import NotesPage from './pages/NotesPage.tsx';

// ── ZAP BLOCK 1: Feature Flag System ──────────────────────────────────────
// Read from .env file: VITE_ZAP_ENABLED=true or false
const ZAP_ENABLED = import.meta.env.VITE_ZAP_ENABLED === 'true'

// Log which mode is active (check browser console)
console.log(
  '%c[ZAP]',
  'font-weight:bold; color: #14b8a6;',
  `ZAP_ENABLED = ${ZAP_ENABLED}`,
  ZAP_ENABLED ? '— Running as: ZAP — "Deadlines messed up? We ZAP it."' : 'ZAP— Running as:  — Deadline Tracker'
)
// ── END ZAP Feature Flag ──────────────────────────────────────────────────

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#f8fafc',
    }}>
      <div style={{ textAlign:'center' }}>
        <div style={{
          width:32, height:32, border:'2px solid #14b8a6',
          borderTopColor:'transparent', borderRadius:'50%',
          animation:'spin 0.7s linear infinite', margin:'0 auto 12px',
        }} />
        <p style={{ fontSize:13, color:'#64748b' }}>Loading…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

function OnboardingRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />
  if (profile?.onboardingComplete) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
  <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

  <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
    <Route index element={<TodayView />} />
    <Route path="tasks" element={<TaskList />} />
    <Route path="progress" element={<ProgressView />} />
    <Route path="insights" element={<InsightsView />} />
    <Route path="agents" element={<AgentsView />} />
    <Route path="ai-solver" element={<AISolver />} />
    <Route path="notes" element={<NotesPage />} />
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  )
}