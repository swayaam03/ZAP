const CAT_ICONS = {
  work:          '💼',
  health:        '💪',
  learning:      '📚',
  relationships: '🤝',
  personal:      '⭐',
}

export default function StreakIcon({ category, streak = 0 }) {
  const isHot = streak >= 7
  return (
    <div className={`
      w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0
      ${isHot ? 'bg-brand-50' : 'bg-gray-50'}
    `}>
      {CAT_ICONS[category] || '📌'}
    </div>
  )
}
