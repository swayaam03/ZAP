import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

export default function SmartCalendar({ tasks = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Date generators
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const dateFormat = 'yyyy-MM-dd'

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
  const todayStr = format(new Date(), dateFormat)

  // Map tasks to dates
  const datesMap = useMemo(() => {
    const map = {}
    
    tasks.forEach(task => {
      // If completed dates exist, we mark it on the days it was finished
      if (task.completedDates && task.completedDates.length > 0) {
        task.completedDates.forEach(dateStr => {
          if (!map[dateStr]) map[dateStr] = { active: [], completed: [] }
          map[dateStr].completed.push(task)
        })
      }
      
      // If it's active, we mark it on its start date (default to today if missing)
      const isCompletedToday = (task.completedDates || []).includes(todayStr)
      if (!isCompletedToday) {
        const targetDate = task.startDate ? format(parseISO(task.startDate), dateFormat) : todayStr
        if (!map[targetDate]) map[targetDate] = { active: [], completed: [] }
        map[targetDate].active.push(task)
      }
    })

    return map
  }, [tasks, todayStr])

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #f1f5f9',
      borderRadius: 14,
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      marginTop: 20
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a', letterSpacing: '0.05em' }}>
          CALENDAR
        </h3>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#94a3b8' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', minWidth: 80, textAlign: 'center' }}>
            {format(currentDate, 'MMM yyyy')}
          </span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#94a3b8' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Week Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 6px' }}>
        {calendarDays.map((day, i) => {
          const formattedDate = format(day, dateFormat)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isDayToday = isToday(day)
          
          const dayTasks = datesMap[formattedDate] || { active: [], completed: [] }
          const totalTasks = dayTasks.active.length + dayTasks.completed.length
          const isOverloaded = dayTasks.active.length >= 3

          return (
            <div
              key={day.toString()}
              className="calendar-day"
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                position: 'relative',
                background: isOverloaded ? '#fef2f2' : (isDayToday ? '#f0fdfa' : (isCurrentMonth ? '#f8fafc' : '#ffffff')),
                border: isDayToday ? '1px solid #5eead4' : (isOverloaded ? '1px solid #fecaca' : '1px solid transparent'),
                opacity: isCurrentMonth ? 1 : 0.4,
                transition: 'all 0.2s',
                cursor: 'pointer' // Can add click filter handlers later
              }}
              title={
                totalTasks > 0 
                  ? `${format(day, 'MMM d')}: ${dayTasks.active.length} pending, ${dayTasks.completed.length} completed\n` + 
                    dayTasks.active.map(t => `• ${t.title}`).join('\n')
                  : format(day, 'MMM d')
              }
            >
              {/* Overload Warning Icon */}
              {isOverloaded && (
                <div style={{ position: 'absolute', top: -4, right: -4, zIndex: 2 }}>
                  <AlertTriangle size={12} fill="#ef4444" color="#fff" />
                </div>
              )}

              {/* Date Number */}
              <span style={{ 
                fontSize: 12, 
                fontWeight: isDayToday ? 700 : 500,
                color: isOverloaded ? '#b91c1c' : (isDayToday ? '#0d9488' : '#475569'),
                marginBottom: 2
              }}>
                {format(day, 'd')}
              </span>

              {/* Task Dots Container */}
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 20 }}>
                {dayTasks.active.slice(0, 3).map((t, idx) => (
                  <div key={`active-${idx}`} style={{ width: 4, height: 4, borderRadius: '50%', background: t.priority === 'high' ? '#ef4444' : '#f59e0b' }} />
                ))}
                {dayTasks.completed.slice(0, 3).map((t, idx) => (
                  <div key={`completed-${idx}`} style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }} />
                ))}
                {totalTasks > 6 && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#94a3b8' }} />
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend / Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ fontSize: 10, color: '#64748b' }}>Pending</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: 10, color: '#64748b' }}>Done</span>
              </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={10} color="#ef4444" />
              <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>Overloaded (3+)</span>
          </div>
      </div>
    </div>
  )
}
