import { useMemo } from 'react'
import { useAuth }   from '../../hooks/useAuth'
import { useTasks }  from '../../hooks/useTasks'
import { format, parseISO, getHours } from 'date-fns'

const AGENT_TAGS = {
  insights:  { label:'Insights',  color:'#3b82f6', bg:'#eff6ff' },
  support:   { label:'Support',   color:'#8b5cf6', bg:'#f5f3ff' },
  momentum:  { label:'Momentum',  color:'#f59e0b', bg:'#fffbeb' },
  planning:  { label:'Planning',  color:'#14b8a6', bg:'#f0fdfa' },
}

const AREA_LABELS = {
  deepWork:'Deep Work', health:'Health', learning:'Learning',
  relationships:'Relationships', creativity:'Creativity', finance:'Finance',
}

function InsightCard({ agent, title, body }) {
  const tag = AGENT_TAGS[agent] || AGENT_TAGS.insights
  return (
    <div style={{
      background:'#ffffff', border:'1px solid #f1f5f9',
      borderRadius:14, padding:'18px 20px',
      boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{
          fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:99,
          background:tag.bg, color:tag.color,
        }}>
          {tag.label}
        </span>
        <span style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{title}</span>
      </div>
      <p style={{ fontSize:13, color:'#475569', lineHeight:1.7, margin:0 }}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  )
}

function ProgressToUnlock({ completed, target = 5 }) {
  const pct = Math.min((completed / target) * 100, 100)
  return (
    <div style={{
      background:'#ffffff', border:'1px solid #f1f5f9',
      borderRadius:16, padding:'32px 24px', textAlign:'center',
      boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
      <h3 style={{ fontSize:15, fontWeight:600, color:'#0f172a', marginBottom:8 }}>
        Insights unlock after {target} completed tasks
      </h3>
      <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.6, marginBottom:20 }}>
        Complete tasks to let your agents analyze your patterns. The more data, the smarter the insights.
      </p>
      <div style={{ maxWidth:240, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#94a3b8', marginBottom:6 }}>
          <span>{completed} completed</span>
          <span>{target - completed} to unlock</span>
        </div>
        <div style={{ height:6, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
          <div style={{
            height:'100%', background:'#14b8a6', borderRadius:99,
            width:`${pct}%`, transition:'width 0.5s',
          }} />
        </div>
      </div>
    </div>
  )
}

export default function InsightsView() {
  const { profile } = useAuth()
  const { allTasks } = useTasks()

  const streak  = profile?.currentStreak || 0
  const longest = profile?.longestStreak || 0
  const level   = profile?.level         || 1

  // Count all-time completions
  const totalCompletions = useMemo(() => {
    const set = new Set()
    allTasks.forEach(t => (t.completedDates || []).forEach(d => set.add(`${t.id}:${d}`)))
    return set.size
  }, [allTasks])

  const hasEnoughData = totalCompletions >= 5

  // Generate real insights from actual data
  const insights = useMemo(() => {
    if (!hasEnoughData) return []

    const result = []

    // 1. Best category (most completions)
    const catCounts = {}
    allTasks.forEach(t => {
      const c = (t.completedDates || []).length
      if (c > 0) catCounts[t.focusArea] = (catCounts[t.focusArea] || 0) + c
    })
    const topCat = Object.entries(catCounts).sort((a,b) => b[1]-a[1])[0]
    if (topCat) {
      result.push({
        agent: 'insights',
        title: 'Strongest focus area',
        body:  `You've completed the most actions in <strong>${AREA_LABELS[topCat[0]] || topCat[0]}</strong> (${topCat[1]} total). This is your most consistent category. Leverage it to build momentum in weaker areas.`,
      })
    }

    // 2. Streak resilience
    if (streak > 0) {
      result.push({
        agent: 'support',
        title: 'Streak resilience',
        body:  `You're on a <strong>${streak}-day streak</strong>${longest > streak ? ` — your record is ${longest} days` : ' — your longest ever'}. The fact you're here consistently matters more than any single missed day. Keep showing up.`,
      })
    }

    // 3. Personal record proximity
    if (streak >= longest - 4 && longest >= 7) {
      result.push({
        agent: 'momentum',
        title: streak >= longest ? 'You set a new personal record' : `${longest - streak} days from your record`,
        body:  streak >= longest
          ? `Your longest streak is now <strong>${streak} days</strong>. You're in uncharted territory. Each day from here is a new milestone.`
          : `Your previous record was <strong>${longest} days</strong>. You're at ${streak}. Close enough to feel it — keep going.`,
      })
    }

    // 4. Weakest category
    const worstCat = Object.entries(catCounts).sort((a,b) => a[1]-b[1])[0]
    if (worstCat && topCat && worstCat[0] !== topCat[0]) {
      result.push({
        agent: 'planning',
        title: `${AREA_LABELS[worstCat[0]] || worstCat[0]} needs attention`,
        body:  `Your completion count in <strong>${AREA_LABELS[worstCat[0]] || worstCat[0]}</strong> is lower than other areas. Consider scheduling it earlier in the day, or reducing the task size to build the habit first.`,
      })
    }

    // 5. Task volume
    const avgTasksPerDay = allTasks.length > 0
      ? (totalCompletions / Math.max(streak, 7)).toFixed(1)
      : 0

    result.push({
      agent: 'insights',
      title: 'Completion velocity',
      body:  `You're averaging approximately <strong>${avgTasksPerDay} completions per day</strong> across your active streak. Research shows 3–5 daily completions is the sweet spot for habit reinforcement without burnout.`,
    })

    // 6. Level progress
    if (level >= 2) {
      result.push({
        agent: 'support',
        title: `Level ${level} milestone`,
        body:  `Reaching Level ${level} represents consistent effort over time. Higher-priority tasks and streak multipliers accelerate XP significantly — focus on your high-priority items to level up faster.`,
      })
    }

    return result
  }, [allTasks, streak, longest, level, hasEnoughData, totalCompletions])

  return (
    <div style={{ padding:'28px 36px', maxWidth:700 }}>
      <h2 style={{
        fontFamily:'Fraunces, Georgia, serif', fontSize:28,
        fontWeight:300, color:'#0f172a', letterSpacing:'-0.02em', marginBottom:4,
      }}>
        Insights
      </h2>
      <p style={{ fontSize:13, color:'#94a3b8', marginBottom:24 }}>
        {hasEnoughData
          ? `Patterns from your ${totalCompletions} completed actions.`
          : 'Your agents are learning. Complete more tasks to unlock personalized analysis.'
        }
      </p>

      {!hasEnoughData ? (
        <ProgressToUnlock completed={totalCompletions} target={5} />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {insights.map((ins, i) => (
            <InsightCard key={i} {...ins} />
          ))}
        </div>
      )}
    </div>
  )
}