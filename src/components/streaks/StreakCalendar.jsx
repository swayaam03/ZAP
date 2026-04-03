import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'

export default function StreakCalendar({ completionDates = [], month = new Date() }) {
  const start = startOfMonth(month)
  const end   = endOfMonth(month)
  const days  = eachDayOfInterval({ start, end })

  const parsedDates = completionDates.map(d =>
    typeof d === 'string' ? parseISO(d) : new Date(d)
  )

  return (
    <div>
      <p className="text-xs text-ink-dim mb-2 font-medium">
        {format(month, 'MMMM yyyy')}
      </p>
      <div className="grid grid-cols-7 gap-1">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} className="text-center text-xs text-ink-dim font-medium h-6 flex items-center justify-center">
            {d}
          </div>
        ))}
        {/* offset for first day */}
        {Array.from({ length: (start.getDay() + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const done = parsedDates.some(d => isSameDay(d, day))
          const isToday = isSameDay(day, new Date())
          return (
            <div
              key={day.toISOString()}
              title={format(day, 'MMM d')}
              className={`
                h-6 w-6 mx-auto rounded-full flex items-center justify-center text-xs transition-all
                ${done
                  ? 'bg-brand-500 text-white font-medium'
                  : isToday
                    ? 'border border-brand-400 text-brand-600'
                    : 'text-ink-dim'
                }
              `}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
    </div>
  )
}
