import { Moon, Sun, Bell } from 'lucide-react'
import { useAuth }  from '../../hooks/useAuth'
import { useTheme } from '../../contexts/ThemeContext'
import { levelProgress, xpToNextLevel, getLevelTitle, xpToLevel } from '../../utils/xpCalculator'

export default function Header({ title }) {
  const { profile } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const xp      = profile?.xp    || 0
  const level   = xpToLevel(xp)
  const title_  = getLevelTitle(level)
  const progress= levelProgress(xp)
  const toNext  = xpToNextLevel(xp)

  return (
    <header style={{
      height:54, flexShrink:0,
      background: isDark ? '#1e293b' : '#ffffff',
      borderBottom:`1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 24px', transition:'background 0.3s, border-color 0.3s',
    }}>
      <h1 style={{ fontSize:14, fontWeight:600, color: isDark ? '#f1f5f9' : '#0f172a' }}>
        {title}
      </h1>

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        {/* Level badge — clean typography */}
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'4px 12px', borderRadius:99,
          background: isDark ? '#0f2a27' : '#f0fdfa',
          border:`1px solid ${isDark ? '#2dd4bf30' : '#99f6e4'}`,
        }}>
          <span style={{ fontSize:14, fontWeight:700, color: isDark ? '#2dd4bf' : '#0d9488' }}>
            {level}
          </span>
          <span style={{ fontSize:11, color: isDark ? '#94a3b8' : '#64748b' }}>
            · {title_}
          </span>
        </div>

        {/* XP bar (hidden on small screens) */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{
            width:80, height:4, borderRadius:99,
            background: isDark ? '#334155' : '#f1f5f9',
            overflow:'hidden',
          }}>
            <div style={{
              height:'100%', background:'#14b8a6',
              borderRadius:99, width:`${progress}%`,
              transition:'width 0.5s ease',
            }} />
          </div>
          <span style={{ fontSize:10, color: isDark ? '#64748b' : '#94a3b8' }}>
            {toNext} XP
          </span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            padding:'6px', borderRadius:8, border:'none',
            background: isDark ? '#334155' : '#f1f5f9',
            color: isDark ? '#94a3b8' : '#64748b',
            cursor:'pointer', display:'flex', alignItems:'center',
            transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#475569' : '#e2e8f0' }}
          onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9' }}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          style={{
            padding:'6px', borderRadius:8, border:'none',
            background:'none', color: isDark ? '#64748b' : '#94a3b8',
            cursor:'pointer', display:'flex', alignItems:'center',
            transition:'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9'; e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = isDark ? '#64748b' : '#94a3b8' }}
        >
          <Bell size={15} />
        </button>
      </div>
    </header>
  )
}