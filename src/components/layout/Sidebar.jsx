import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, BarChart2, Lightbulb, Bot, LogOut, Settings, BookOpen, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { ZAP_ENABLED } from '../../lib/constants';

const NAV = [
  { to: '/dashboard',          icon: LayoutDashboard, label: 'Today',    end: true  },
  { to: '/dashboard/progress', icon: BarChart2,       label: 'Progress', end: false },
  { to: '/dashboard/insights', icon: Lightbulb,       label: 'Insights', end: false },
  { to: '/dashboard/agents',   icon: Bot,             label: 'Agents',   end: false },
  ...(ZAP_ENABLED ? [{ to: '/dashboard/notes', icon: BookOpen, label: 'Notes', end: false }] : []),
]

function SignOutModal({ onConfirm, onCancel }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <motion.div
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        exit={{ opacity:0 }}
        style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.25)', backdropFilter:'blur(3px)' }}
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity:0, scale:0.95, y:8 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95 }}
        style={{
          position:'relative', zIndex:10,
          background:'#ffffff', borderRadius:16,
          padding:'28px 28px 24px', maxWidth:360, width:'100%',
          boxShadow:'0 20px 60px rgba(0,0,0,0.14)',
        }}
      >
        <button
          onClick={onCancel}
          style={{
            position:'absolute', top:14, right:14, background:'none',
            border:'none', cursor:'pointer', color:'#94a3b8', padding:4, borderRadius:6,
          }}
        >
          <X size={15} />
        </button>
        <div style={{ fontSize:24, marginBottom:10 }}>👋</div>
        <h3 style={{ fontSize:16, fontWeight:600, color:'#0f172a', marginBottom:8 }}>
          Sign out of QuestMind?
        </h3>
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.6, marginBottom:22 }}>
          Your progress is saved automatically. You can sign back in any time.
        </p>
        <div style={{ display:'flex', gap:10 }}>
          <button
            onClick={onCancel}
            style={{
              flex:1, padding:'10px', borderRadius:10,
              border:'1.5px solid #e2e8f0', background:'#f8fafc',
              color:'#64748b', fontSize:13, fontWeight:500,
              cursor:'pointer', fontFamily:'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex:1, padding:'10px', borderRadius:10,
              border:'none', background:'#0f172a',
              color:'#ffffff', fontSize:13, fontWeight:500,
              cursor:'pointer', fontFamily:'inherit',
            }}
          >
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Sidebar({ onProfileOpen }) {
  const { profile, signOut } = useAuth()
  const { todayTasks, todayCompleted } = useTasks()
  const [showSignOut, setShowSignOut] = useState(false)

  const initials = profile?.displayName
    ?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?'

  const totalToday     = todayTasks.length
  const completedToday = todayCompleted.length
  const pct = totalToday > 0 ? Math.min((completedToday / totalToday) * 100, 100) : 0
  const streak = profile?.currentStreak || 0

  const handleSignOut = async () => {
    setShowSignOut(false)
    await signOut()
  }

  return (
    <>
      <aside style={{
        width:220, flexShrink:0,
        background:'#ffffff', borderRight:'1px solid #f1f5f9',
        display:'flex', flexDirection:'column',
        height:'100vh', overflow:'hidden',
      }}>
        {/* Wordmark */}
        <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#14b8a6' }} />
            <span style={{
              fontFamily:'Fraunces, Georgia, serif',
              fontSize:17, color:'#0f172a', fontWeight:400, letterSpacing:'-0.02em',
            }}>
              QuestMind
            </span>
          </div>
          <p style={{ fontSize:11, color:'#94a3b8', marginTop:2, paddingLeft:16 }}>
            Habit intelligence
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 10px', display:'flex', flexDirection:'column', gap:1, overflowY:'auto' }}>
          {NAV.map(({ to, icon:Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:9,
                padding:'8px 10px', borderRadius:9,
                fontSize:13.5, fontWeight: isActive ? 500 : 400,
                color: isActive ? '#0f766e' : '#64748b',
                background: isActive ? '#f0fdfa' : 'transparent',
                textDecoration:'none', transition:'all 0.15s',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} color={isActive ? '#14b8a6' : '#94a3b8'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding:'10px', borderTop:'1px solid #f1f5f9' }}>
          {/* Today progress */}
          <div style={{ padding:'6px 8px 10px' }}>
            <div style={{
              display:'flex', justifyContent:'space-between',
              fontSize:11, color:'#94a3b8', marginBottom:4,
            }}>
              <span>Today {completedToday}/{totalToday > 0 ? totalToday : '—'}</span>
              {streak > 0 && (
                <span style={{ color:'#f59e0b', fontWeight:500 }}>
                  🔥 {streak}d
                </span>
              )}
            </div>
            <div style={{ height:3, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
              <motion.div
                style={{ height:'100%', background:'#14b8a6', borderRadius:99 }}
                animate={{ width:`${pct}%` }}
                transition={{ duration:0.5 }}
              />
            </div>
          </div>

          {/* User chip */}
          <button
            onClick={onProfileOpen}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:9,
              padding:'8px 8px', borderRadius:9, border:'none',
              background:'none', cursor:'pointer', textAlign:'left',
              fontFamily:'inherit', transition:'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt=""
                style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{
                width:30, height:30, borderRadius:'50%',
                background:'#f0fdfa', border:'1px solid #99f6e4',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:600, color:'#0d9488', flexShrink:0,
              }}>
                {initials}
              </div>
            )}
            <div style={{ minWidth:0, flex:1 }}>
              <p style={{
                fontSize:12.5, fontWeight:500, color:'#0f172a',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0,
              }}>
                {profile?.displayName || 'You'}
              </p>
              <p style={{ fontSize:11, color:'#94a3b8', margin:0 }}>
                {streak > 0 ? `${streak} days strong` : `Lv ${profile?.level || 1} · ${profile?.xp || 0} XP`}
              </p>
            </div>
            <Settings size={12} color="#94a3b8" style={{ flexShrink:0 }} />
          </button>

          {/* Sign out */}
          <button
            onClick={() => setShowSignOut(true)}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:8,
              padding:'7px 8px', borderRadius:9, border:'none',
              background:'none', cursor:'pointer', fontSize:12.5,
              color:'#94a3b8', fontFamily:'inherit', transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {showSignOut && (
          <SignOutModal
            onConfirm={handleSignOut}
            onCancel={() => setShowSignOut(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}