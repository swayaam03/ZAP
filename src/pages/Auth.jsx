import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Login         from '../components/auth/Login'
import Register      from '../components/auth/Register'
import PasswordReset from '../components/auth/PasswordReset'

export default function Auth() {
  const [view, setView] = useState('login') // 'login' | 'register' | 'reset'

  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-120px] right-[-80px] w-[480px] h-[480px] rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-40px] w-[320px] h-[320px] rounded-full bg-brand-600/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-modal p-9"
        >
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-brand-600" />
            <span className="font-display text-lg font-medium text-ink tracking-tight">ZAP</span>
          </Link>
          <p className="text-xs text-ink-dim mb-7 pl-4">Habit intelligence for professionals.</p>

          <AnimatePresence mode="wait">
            {view === 'login' && (
              <Login
                key="login"
                onSwitchToRegister={() => setView('register')}
                onForgotPassword={() => setView('reset')}
              />
            )}
            {view === 'register' && (
              <Register
                key="register"
                onSwitchToLogin={() => setView('login')}
              />
            )}
            {view === 'reset' && (
              <PasswordReset
                key="reset"
                onBack={() => setView('login')}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
