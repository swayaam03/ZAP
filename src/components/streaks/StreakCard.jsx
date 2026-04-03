import Card from '../ui/Card'
import StreakIcon          from './StreakIcon'
import IceStreakIndicator  from './IceStreakIndicator'
import { formatStreak, getStreakMilestone } from '../../utils/streakCalculator'

const CAT_LABELS = {
  work:          'Work',
  health:        'Health',
  learning:      'Learning',
  relationships: 'Social',
  personal:      'Personal',
}

export default function StreakCard({ category, streak }) {
  const current   = streak?.current   || 0
  const isOnIce   = streak?.isOnIce   || false
  const milestone = getStreakMilestone(current)

  return (
    <Card padding="md" className="flex items-center gap-3">
      <StreakIcon category={category} streak={current} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-ink capitalize">{CAT_LABELS[category]}</p>
          {isOnIce && <IceStreakIndicator />}
        </div>
        <p className="text-xs text-ink-dim">{formatStreak(current)}</p>
        {milestone && (
          <span className="text-xs font-medium" style={{ color: '#d97706' }}>
            {milestone.icon} {milestone.label}
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-ink">{current}</div>
    </Card>
  )
}
