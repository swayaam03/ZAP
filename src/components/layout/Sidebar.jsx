import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart2, Lightbulb, Bot, LogOut, Settings, Brain } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Today',     end: true  },
  { to: '/dashboard/progress',  icon: BarChart2,       label: 'Progress',  end: false },
  { to: '/dashboard/insights',  icon: Lightbulb,       label: 'Insights',  end: false },
  { to: '/dashboard/agents',    icon: Bot,             label: 'Agents',    end: false },
  { to: '/dashboard/ai-solver', icon: Brain,           label: 'AI Solver', end: false },
]

const AREA_COLORS = {
  deepWork: '#14b8a6', health: '#10b981', learning: '#8b5cf6',
  relationships: '#f59e0b', creativity: '#ec4899', finance: '#3b82f6',
}

export default function Sidebar({ onProfileOpen }) {
  const { profile, signOut } = useAuth()

  const initials = profile?.displayName
    ?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?'

  const dailyTarget = profile?.goals?.dailyTaskTarget || 5
  const todayDone   = profile?.todayCompleted || 0
  const pct         = Math.min((todayDone / dailyTarget) * 100, 100)
  const streak      = profile?.currentStreak || 0

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: '#ffffff', borderRight: '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
    }}>
      {/* Wordmark */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14b8a6' }} />
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, color: '#0f172a', fontWeight: 400, letterSpacing: '-0.02em' }}>
            QuestMind
          </span>
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, paddingLeft: 16 }}>
          Habit intelligence
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 9,
              fontSize: 13.5, fontWeight: isActive ? 500 : 400,
              color: isActive ? '#0f766e' : '#64748b',
              background: isActive ? '#f0fdfa' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
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
      <div style={{ padding: '10px', borderTop: '1px solid #f1f5f9' }}>
        {/* Today progress */}
        <div style={{ padding: '6px 8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
            <span>Today {todayDone}/{dailyTarget}</span>
            {streak > 0 && <span>🔥 {streak}-day streak</span>}
          </div>
          <div style={{ height: 3, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#14b8a6', borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* User chip */}
        <button
          onClick={onProfileOpen}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 8px', borderRadius: 9, border: 'none',
            background: 'none', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'inherit', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} referrerPolicy="no-referrer" />
          ) : (
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: '#f0fdfa',
              border: '1px solid #99f6e4', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, fontWeight: 600,
              color: '#0d9488', flexShrink: 0,
            }}>
              {initials}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12.5, fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {profile?.displayName || 'You'}
            </p>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
              {streak > 0 ? `${streak} days strong` : `Lv ${profile?.level || 1} · ${profile?.xp || 0} XP`}
            </p>
          </div>
          <Settings size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
        </button>

        <button
          onClick={signOut}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 8px', borderRadius: 9, border: 'none',
            background: 'none', cursor: 'pointer', fontSize: 12.5,
            color: '#94a3b8', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  )
}
