import { Bell, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { levelProgress, xpToNextLevel } from '../../utils/xpCalculator'

export default function Header({ title }) {
  const { profile } = useAuth()
  const xp       = profile?.xp     || 0
  const level    = profile?.level  || 1
  const progress = levelProgress(xp)
  const toNext   = xpToNextLevel(xp)

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <h1 className="text-sm font-semibold text-ink">{title}</h1>

      <div className="flex items-center gap-3">
        {/* XP Level progress */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-ink-sub">Lv {level}</span>
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-ink-dim">{toNext} XP</span>
        </div>

        {/* Notification bell */}
        <button className="p-1.5 rounded-lg text-ink-dim hover:text-ink hover:bg-gray-100 transition-colors relative">
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}
