import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
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

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8fafc',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 32, height: 32, border: '2px solid #14b8a6',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ fontSize: 13, color: '#64748b' }}>Loading…</p>
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
        <Route index           element={<TodayView    />} />
        <Route path="tasks"    element={<TaskList     />} />
        <Route path="progress" element={<ProgressView />} />
        <Route path="insights"  element={<InsightsView />} />
        <Route path="agents"    element={<AgentsView   />} />
        <Route path="ai-solver" element={<AISolver     />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}