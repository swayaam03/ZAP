import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { useStreaks } from '../../hooks/useStreaks'
import { getLevelTitle, levelProgress } from '../../utils/xpCalculator'
import { format } from 'date-fns'

export default function StatsTab() {
  const { profile }  = useAuth()
  const { tasks }    = useTasks()
  const { streaks }  = useStreaks()

  const xp          = profile?.xp    || 0
  const level       = profile?.level || 1
  const title       = getLevelTitle(level)
  const progress    = levelProgress(xp)
  const completed   = tasks.filter(t => t.completed).length
  const total       = tasks.length
  const rate        = total > 0 ? Math.round((completed / total) * 100) : 0
  const allStreaks   = Object.values(streaks)
  const topStreak   = Math.max(...allStreaks.map(s => s?.current || 0), 0)
  const longestEver = Math.max(...allStreaks.map(s => s?.longest || 0), 0)
  const joinedDate  = profile?.createdAt
    ? format(new Date(profile.createdAt.seconds * 1000), 'MMMM yyyy')
    : '—'

  const stats = [
    { label: 'Level',             value: `${level} — ${title}` },
    { label: 'Total XP',          value: xp.toLocaleString()   },
    { label: 'Progress to next',  value: `${progress}%`        },
    { label: 'Tasks completed',   value: completed              },
    { label: 'Completion rate',   value: `${rate}%`            },
    { label: 'Current streak',    value: `${topStreak} days`   },
    { label: 'Longest streak',    value: `${longestEver} days` },
    { label: 'Member since',      value: joinedDate             },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(s => (
          <div key={s.label} className="bg-surface-alt rounded-xl p-3">
            <p className="text-xs text-ink-dim mb-0.5">{s.label}</p>
            <p className="text-sm font-semibold text-ink">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
