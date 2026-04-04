import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar       from './Sidebar'
import Header        from './Header'
import ProfileModal  from '../profile/ProfileModal'

const TITLES = {
  '/dashboard':            'Today',
  '/dashboard/tasks':      'Tasks',
  '/dashboard/progress':   'Progress',
  '/dashboard/insights':   'Insights',
  '/dashboard/agents':     'AI Agents',
  '/dashboard/ai-solver':  'AI Doubt Solver',
}

export default function Layout() {
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const title = TITLES[location.pathname] || 'ZAP'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f7f6f3' }}>
      <Sidebar onProfileOpen={() => setProfileOpen(true)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header title={title} />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  )
}