import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { useStreaks } from '../../hooks/useStreaks'
import TaskCard from '../tasks/TaskCard'
import TaskModal from '../tasks/TaskModal'
import WhatIfSimulatorModal from './WhatIfSimulatorModal'
import { levelProgress, xpToNextLevel, getLevelTitle, xpToLevel } from '../../utils/xpCalculator'
import SmartCalendar from './SmartCalendar'
import { isTaskScheduledOnDate } from '../../utils/taskScheduler'

const AREA_COLORS = {
  deepWork:'#14b8a6', health:'#10b981', learning:'#8b5cf6',
  relationships:'#f59e0b', creativity:'#ec4899', finance:'#3b82f6',
}

const INSIGHT_MSGS = [
  'Completing a health task first boosts your learning completion, based on your pattern data.',
  "You're most consistent in the morning. Protect that window today.",
  'Your streak is your strongest asset right now. One task at a time.',
  'Tasks with clear descriptions get completed 2× more often.',
]

export default function TodayView() {
  const { profile } = useAuth()
  const { tasks, loading, finishTask, removeTask, editTask, addTask } = useTasks()
  const { streaks } = useStreaks()
  const [modalOpen, setModalOpen] = useState(false)
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [xpFlash, setXpFlash] = useState(null)

  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.displayName?.split(' ')[0] || 'there'
  
  const xp = profile?.xp || 0
  const level = xpToLevel(xp)
  const progress = levelProgress(xp)
  const toNext = xpToNextLevel(xp)
  const streak = profile?.currentStreak || 0

  const activeTasks = tasks.filter(t => 
    isTaskScheduledOnDate(t, now) && 
    !(t.completedDates || []).includes(today)
  )
  const completedToday = tasks.filter(t => (t.completedDates || []).includes(today))
  const dailyTarget = profile?.goals?.dailyTaskTarget || 5
  const totalToday = activeTasks.length + completedToday.length
  const pct = Math.min((completedToday.length / dailyTarget) * 100, 100)

  const insight = INSIGHT_MSGS[new Date().getDate() % INSIGHT_MSGS.length]

  const handleComplete = async (taskId) => {
    const earned = await finishTask(taskId)
    if (earned > 0) {
      setXpFlash(`+${earned} XP`)
      setTimeout(() => setXpFlash(null), 2000)
    }
  }

  const handleEdit = (task) => { setEditingTask(task); setModalOpen(true) }
  const handleModalClose = () => { setModalOpen(false); setEditingTask(null) }

  const card = {
    background:'#ffffff', border:'1px solid #f1f5f9',
    borderRadius:14, boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
  }

  return (
    <div style={{ display: 'flex', gap: 32, padding: '28px 36px', maxWidth: 1120 }}>
      {/* Main Column */}
      <div style={{ flex: 1, maxWidth: 720 }}>

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{
              fontFamily: 'Fraunces, Georgia, serif', fontSize: 30,
              fontWeight: 300, letterSpacing: '-0.03em', color: '#0f172a', margin: 0,
            }}>
              {greeting},{' '}
              <em style={{ color: '#14b8a6', fontStyle: 'italic' }}>{firstName}</em>.
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 99, background: '#f0fdfa',
            border: '1px solid #99f6e4', fontSize: 12, fontWeight: 500, color: '#0d9488',
          }}>
            {completedToday.length} of {totalToday || 0} complete
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div style={{ ...card, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: '#94a3b8' }}>
            TODAY'S PROGRESS
          </span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 99,
            background: '#f0fdfa', color: '#0d9488', fontWeight: 500,
          }}>
            AI-curated
          </span>
        </div>
        <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: '#14b8a6', borderRadius: 99 }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Current streak', value: streak > 0 ? `🔥 ${streak}d` : '~' },
          { label: 'XP total', value: xp.toLocaleString() },
          { label: 'Level', value: `${level} · ${getLevelTitle(level)}` },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ ...card, padding: '14px 16px' }}
          >
            <div style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* XP progress */}
      <div style={{ ...card, padding: '14px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={13} color="#14b8a6" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>XP to Level {level + 1}</span>
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{toNext} XP remaining</span>
        </div>
        <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: '#14b8a6', borderRadius: 99 }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Today's priorities */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#94a3b8' }}>
            TODAY'S PRIORITIES
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 99,
            background: '#f0fdfa', color: '#0d9488', fontWeight: 500,
          }}>
            Planning Agent
          </span>
          <button
            onClick={() => setSimulatorOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8,
              background: '#14b8a6', border: '1px solid #f0fdfa', color: '#f7f6f6', fontSize: 12,
              fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
          Simulate Delay
          </button>
          <button
            onClick={() => { setEditingTask(null); setModalOpen(true) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8,
              background: '#14b8a6', border: 'none', color: '#fff', fontSize: 12,
              fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Plus size={12} /> Add task
          </button>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 64, background: '#e2e8f0', borderRadius: 12, animation: 'pulse 2s infinite' }} />)}
        </div>
      ) : activeTasks.length === 0 && completedToday.length === 0 ? (
        <div style={{ ...card, padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
            No tasks yet. Add your first action for today.
          </p>
          <button
            onClick={() => { setEditingTask(null); setModalOpen(true) }}
            style={{
              padding: '8px 20px', borderRadius: 9, background: '#14b8a6',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            + Add first task
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <AnimatePresence>
            {/* Active tasks */}
            {activeTasks.map(task => (
              <div key={task.id} style={{ marginBottom: 8 }}>
                <TaskCard
                  task={task}
                  onComplete={handleComplete}
                  onEdit={handleEdit}
                  onDelete={removeTask}
                />
              </div>
            ))}
          </AnimatePresence>

          {/* Completed tasks */}
          {completedToday.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '16px 0 8px', fontWeight: 600, letterSpacing: '0.08em' }}>
                COMPLETED TODAY
              </p>
              {completedToday.map(task => (
                <div key={task.id} style={{ marginBottom: 8 }}>
                  <TaskCard
                    task={task}
                    onComplete={handleComplete}
                    onEdit={handleEdit}
                    onDelete={removeTask}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Focus area tags */}
      {(profile?.focusAreas || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16, marginBottom: 20 }}>
          {(profile.focusAreas).map(area => (
            <span key={area} style={{
              fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99,
              background: `${AREA_COLORS[area] || '#14b8a6'}15`,
              color: AREA_COLORS[area] || '#14b8a6',
            }}>
              {area.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          ))}
        </div>
      )}

      {/* Insights Agent card */}
      <div style={{
        ...card, padding: '16px 18px',
        borderLeft: '3px solid #3b82f6', marginTop: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#3b82f6' }}>⊞</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#94a3b8' }}>
            INSIGHTS AGENT
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65, margin: 0 }}>
          {insight}
        </p>
      </div>

      {/* XP flash */}
      <AnimatePresence>
        {xpFlash && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed', top: 60, right: 24,
              background: '#14b8a6', color: '#fff',
              padding: '8px 18px', borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              boxShadow: '0 4px 20px rgba(20,184,166,0.3)', zIndex: 100,
            }}
          >
            {xpFlash}
          </motion.div>
        )}
      </AnimatePresence>

      <TaskModal open={modalOpen} onClose={handleModalClose} task={editingTask} />
      <WhatIfSimulatorModal 
        open={simulatorOpen} 
        onClose={() => setSimulatorOpen(false)} 
        tasks={tasks}
        onApply={editTask}
      />

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
      </div>

      {/* Right Column / Sidebar */}
      <div style={{ width: 360, flexShrink: 0, paddingTop: 12 }}>
        <SmartCalendar tasks={tasks} />
      </div>
    </div>
  )
}