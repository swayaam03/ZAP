import { useMemo } from 'react'
import { useAuth }   from '../../hooks/useAuth'
import { useTasks }  from '../../hooks/useTasks'
import { format, subDays, eachDayOfInterval, startOfDay, parseISO } from 'date-fns'

const AREA_COLORS = {
  deepWork: '#14b8a6', health: '#10b981', learning: '#8b5cf6',
  relationships: '#f59e0b', creativity: '#ec4899', finance: '#3b82f6',
}
const AREA_LABELS = {
  deepWork:'Deep Work', health:'Health', learning:'Learning',
  relationships:'Relationships', creativity:'Creativity', finance:'Finance',
}

const MILESTONES = [
  { label:'One week',    days:7,   color:'#8b5cf6' },
  { label:'Two weeks',   days:14,  color:'#14b8a6' },
  { label:'Three weeks', days:21,  color:'#f59e0b' },
  { label:'One month',   days:30,  color:'#14b8a6' },
  { label:'Habit formed',days:66,  color:'#94a3b8' },
  { label:'Century',     days:100, color:'#94a3b8' },
]

const card = {
  background:'#ffffff', border:'1px solid #f1f5f9',
  borderRadius:14, boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
}

export default function ProgressView() {
  const { profile } = useAuth()
  const { tasks }   = useTasks()

  const streak  = profile?.currentStreak || 0
  const xp      = profile?.xp     || 0
  const level   = profile?.level  || 1

  // Build completion date set from all tasks
  const allCompletedDates = useMemo(() => {
    const set = new Set()
    tasks.forEach(t => (t.completedDates || []).forEach(d => set.add(d)))
    return set
  }, [tasks])

  // 30-day heatmap
  const heatmapDays = useMemo(() => {
    const today = new Date()
    return eachDayOfInterval({ start: subDays(today, 29), end: today })
      .map(d => {
        const key     = format(d, 'yyyy-MM-dd')
        const count   = tasks.filter(t => (t.completedDates || []).includes(key)).length
        return { date: d, count }
      })
  }, [tasks])

  const maxCount = Math.max(...heatmapDays.map(d => d.count), 1)

  // This week bar chart (Mon–Sun)
  const weekDays = useMemo(() => {
    const today = new Date()
    return ['M','T','W','T','F','S','S'].map((label, i) => {
      const d   = subDays(today, 6 - i)
      const key = format(d, 'yyyy-MM-dd')
      const done = tasks.filter(t => (t.completedDates || []).includes(key)).length
      const target = profile?.goals?.dailyTaskTarget || 5
      return { label, pct: Math.min((done / target) * 100, 100), done }
    })
  }, [tasks, profile])

  const weeklyRate = Math.round(weekDays.reduce((a,d) => a + d.pct, 0) / 7)

  // Monthly rate (last 30 days)
  const monthRate = useMemo(() => {
    let daysWithActivity = 0
    heatmapDays.forEach(d => { if (d.count > 0) daysWithActivity++ })
    return Math.round((daysWithActivity / 30) * 100)
  }, [heatmapDays])

  // Total completed
  const totalDone = useMemo(() => {
    const set = new Set()
    tasks.forEach(t => (t.completedDates || []).forEach(d => set.add(`${t.id}:${d}`)))
    return set.size
  }, [tasks])

  // By focus area
  const areaStats = useMemo(() => {
    const focusAreas = profile?.focusAreas || Object.keys(AREA_COLORS)
    return focusAreas.map(area => {
      const areaTasks = tasks.filter(t => t.focusArea === area)
      const total     = areaTasks.reduce((a,t) => a + (t.completedDates?.length || 0), 0)
      const possible  = areaTasks.length * 30 // rough possible
      const rate      = possible > 0 ? Math.min(Math.round((total / possible) * 100 * 5), 100) : 0
      return { area, rate }
    })
  }, [tasks, profile])

  const heatColor = (count) => {
    if (count === 0) return '#f1f5f9'
    const intensity = count / maxCount
    if (intensity < 0.25) return '#99f6e4'
    if (intensity < 0.5)  return '#2dd4bf'
    if (intensity < 0.75) return '#14b8a6'
    return '#0d9488'
  }

  return (
    <div style={{ padding:'28px 36px', maxWidth:800 }}>
      <h2 style={{ fontFamily:'Fraunces, Georgia, serif', fontSize:28, fontWeight:300, color:'#0f172a', letterSpacing:'-0.02em', marginBottom:4 }}>
        Progress
      </h2>
      <p style={{ fontSize:13, color:'#94a3b8', marginBottom:24 }}>Consistency over time, surfaced clearly.</p>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {[
          { value: streak,       label:'Current streak',  sub:'+2 vs last week' },
          { value:`${monthRate}%`,label:'Monthly rate',   sub:'+6% vs last month' },
          { value: totalDone,    label:'Actions done',    sub:'all time' },
          { value: level,        label:'Current level',   sub:`${xp} XP total` },
        ].map((s,i) => (
          <div key={i} style={{ ...card, padding:'16px' }}>
            <div style={{ fontSize:26, fontWeight:700, color:'#0f172a', marginBottom:2 }}>{s.value}</div>
            <div style={{ fontSize:12, fontWeight:500, color:'#475569', marginBottom:2 }}>{s.label}</div>
            <div style={{ fontSize:11, color:'#14b8a6' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        {/* Weekly bar chart */}
        <div style={{ ...card, padding:'20px' }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:'#94a3b8', marginBottom:16 }}>THIS WEEK</p>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80 }}>
            {weekDays.map((d,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ width:'100%', background:'#f1f5f9', borderRadius:4, height:64, display:'flex', alignItems:'flex-end' }}>
                  <div style={{
                    width:'100%', background: d.pct > 80 ? '#14b8a6' : d.pct > 50 ? '#5eead4' : '#99f6e4',
                    borderRadius:4, height:`${d.pct}%`, transition:'height 0.5s',
                    minHeight: d.pct > 0 ? 4 : 0,
                  }} />
                </div>
                <span style={{ fontSize:10, color:'#94a3b8' }}>{d.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:11, color:'#94a3b8', marginTop:12 }}>
            {weeklyRate}% weekly completion rate
          </p>
        </div>

        {/* Circular progress */}
        <div style={{ ...card, padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:'#94a3b8', marginBottom:16, alignSelf:'flex-start' }}>
            CONSISTENCY SCORE
          </p>
          <div style={{ position:'relative', width:100, height:100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="#14b8a6" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - monthRate / 100)}`}
                strokeLinecap="round"
                style={{ transition:'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{
              position:'absolute', inset:0,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ fontSize:20, fontWeight:700, color:'#0f172a' }}>{monthRate}%</span>
              <span style={{ fontSize:9, color:'#94a3b8' }}>this month</span>
            </div>
          </div>
          <p style={{ fontSize:11, color:'#94a3b8', marginTop:12, textAlign:'center' }}>
            Target: 80% for habit formation
          </p>
        </div>
      </div>

      {/* 30-day heatmap */}
      <div style={{ ...card, padding:'20px', marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:'#94a3b8', marginBottom:14 }}>
          30-DAY HEATMAP
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(30,1fr)', gap:3 }}>
          {heatmapDays.map((d,i) => (
            <div
              key={i}
              title={`${format(d.date,'MMM d')}: ${d.count} tasks`}
              style={{
                aspectRatio:'1', borderRadius:3,
                background: heatColor(d.count),
                transition:'background 0.3s',
              }}
            />
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10 }}>
          <span style={{ fontSize:10, color:'#94a3b8' }}>Less</span>
          {['#f1f5f9','#99f6e4','#2dd4bf','#14b8a6','#0d9488'].map(c => (
            <div key={c} style={{ width:10, height:10, borderRadius:2, background:c }} />
          ))}
          <span style={{ fontSize:10, color:'#94a3b8' }}>More</span>
        </div>
      </div>

      {/* Milestones + By area */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Milestones */}
        <div style={{ ...card, padding:'20px' }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:'#94a3b8', marginBottom:14 }}>MILESTONES</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {MILESTONES.map(m => {
              const pct     = Math.min(Math.round((streak / m.days) * 100), 100)
              const reached = streak >= m.days
              return (
                <div key={m.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      {reached && <span style={{ color:m.color }}>✓</span>}
                      <span style={{ fontSize:12, color: reached ? '#0f172a' : '#64748b', fontWeight: reached ? 500 : 400 }}>
                        {m.label} ({m.days} days)
                      </span>
                    </div>
                    <span style={{ fontSize:11, color:m.color, fontWeight:500 }}>{pct}%</span>
                  </div>
                  <div style={{ height:4, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:m.color, borderRadius:99, width:`${pct}%`, transition:'width 0.5s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* By focus area */}
        <div style={{ ...card, padding:'20px' }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:'#94a3b8', marginBottom:14 }}>BY FOCUS AREA</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {areaStats.map(({ area, rate }) => (
              <div key={area}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12, color:'#475569' }}>{AREA_LABELS[area] || area}</span>
                  <span style={{ fontSize:12, fontWeight:600, color: AREA_COLORS[area] || '#14b8a6' }}>{rate}%</span>
                </div>
                <div style={{ height:5, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
                  <div style={{
                    height:'100%', background: AREA_COLORS[area] || '#14b8a6',
                    borderRadius:99, width:`${rate}%`, transition:'width 0.6s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
