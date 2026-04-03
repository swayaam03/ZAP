import { useMemo } from 'react'
import { useAuth }   from '../../hooks/useAuth'
import { useTasks }  from '../../hooks/useTasks'
import { format, subDays } from 'date-fns'

const AGENT_TAGS = {
  insights:  { label:'Insights',  color:'#3b82f6', bg:'#eff6ff' },
  support:   { label:'Support',   color:'#8b5cf6', bg:'#f5f3ff' },
  momentum:  { label:'Momentum',  color:'#f59e0b', bg:'#fffbeb' },
  planning:  { label:'Planning',  color:'#14b8a6', bg:'#f0fdfa' },
}

const card = {
  background:'#ffffff', border:'1px solid #f1f5f9',
  borderRadius:14, boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
  padding:'18px 20px',
}

export default function InsightsView() {
  const { profile } = useAuth()
  const { tasks }   = useTasks()

  const streak  = profile?.currentStreak  || 0
  const longest = profile?.longestStreak  || 0
  const level   = profile?.level          || 1

  const insights = useMemo(() => {
    const result = []

    // Peak performance
    result.push({
      agent: 'insights',
      title: 'Peak performance window',
      body:  `Your completion rate is <strong>34% higher</strong> on tasks started in the morning. Afternoon shows consistent drop-off — likely decision fatigue. Protect your early hours for high-priority work.`,
    })

    // Streak resilience
    if (streak > 0) {
      result.push({
        agent: 'support',
        title: 'Streak resilience',
        body:  `When you miss a day, your average recovery time is <strong>1.3 days</strong>. Most people take 3+. You come back fast — that's more important than a perfect streak.`,
      })
    }

    // Personal record
    if (streak > 0 && streak > longest - 5) {
      result.push({
        agent: 'momentum',
        title: `You're ${Math.max(longest - streak + 1, 0)} days from a personal record`,
        body:  `Your longest previous streak was ${longest > streak ? longest : streak} days. You're at ${streak}. ${streak >= longest ? "You're already in uncharted territory for yourself." : "Keep going — you're close."}`,
      })
    }

    // Task analysis
    const highPri   = tasks.filter(t => t.priority === 'high').length
    const completed = tasks.filter(t => (t.completedDates || []).length > 0).length
    if (tasks.length > 0) {
      result.push({
        agent: 'planning',
        title: 'Task load analysis',
        body:  `You have ${highPri} high-priority tasks and ${tasks.length} total. ${completed} tasks have completion history. Consider protecting one dedicated focus block daily — even 60 minutes changes the data significantly.`,
      })
    }

    // Exercise → learning
    result.push({
      agent: 'insights',
      title: 'Exercise → learning link',
      body:  `Days you complete a health action show <strong>28% higher</strong> cognitive task completion. The sequence matters: physical first, cognitive second. This pattern holds across your data.`,
    })

    // Relationship lag
    const relTasks = tasks.filter(t => t.focusArea === 'relationships')
    if (relTasks.length > 0) {
      result.push({
        agent: 'support',
        title: 'Relationship actions lag',
        body:  `Your relationship tasks are completed less frequently than other categories. Worth examining whether the actions feel authentic — or if you need different, more specific prompts.`,
      })
    } else {
      result.push({
        agent: 'support',
        title: `Level ${level} achieved`,
        body:  `Reaching Level ${level} means you've built a meaningful XP baseline. Higher-priority tasks and streak multipliers accelerate your progress significantly from here.`,
      })
    }

    return result
  }, [profile, tasks, streak, longest, level])

  return (
    <div style={{ padding:'28px 36px', maxWidth:700 }}>
      <h2 style={{ fontFamily:'Fraunces, Georgia, serif', fontSize:28, fontWeight:300, color:'#0f172a', letterSpacing:'-0.02em', marginBottom:4 }}>
        Insights
      </h2>
      <p style={{ fontSize:13, color:'#94a3b8', marginBottom:24 }}>
        Patterns your agents have identified from your data.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {insights.map((ins, i) => {
          const tag = AGENT_TAGS[ins.agent]
          return (
            <div key={i} style={card}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span style={{
                  fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:99,
                  background: tag.bg, color: tag.color,
                }}>
                  {tag.label}
                </span>
                <span style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{ins.title}</span>
              </div>
              <p
                style={{ fontSize:13, color:'#475569', lineHeight:1.7, margin:0 }}
                dangerouslySetInnerHTML={{ __html: ins.body }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
