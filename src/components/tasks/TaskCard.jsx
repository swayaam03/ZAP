import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Trash2, CheckCircle2, Circle, Flame } from 'lucide-react'
import { format } from 'date-fns'

const AREA_COLORS = {
  deepWork: '#14b8a6', health: '#10b981', learning: '#8b5cf6',
  relationships: '#f59e0b', creativity: '#ec4899', finance: '#3b82f6',
}
const AREA_LABELS = {
  deepWork: 'Deep Work', health: 'Health', learning: 'Learning',
  relationships: 'Relationships', creativity: 'Creativity', finance: 'Finance',
}
const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
const PRIORITY_BG     = { high: '#fef2f2', medium: '#fffbeb', low: '#f0fdf4' }

export default function TaskCard({
  task,
  onComplete,
  onEdit,
  onDelete,
  showStreak = true,
}) {
  const [completing, setCompleting] = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const today     = format(new Date(), 'yyyy-MM-dd')
  const completed = (task.completedDates || []).includes(today)
  const streak    = task.streak || 0
  const areaColor = AREA_COLORS[task.focusArea] || '#14b8a6'

  const handleComplete = async () => {
    if (completed || completing) return
    setCompleting(true)
    try {
      await onComplete(task.id)
    } finally {
      setCompleting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(task.id)
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <motion.div
      layout
      className="task-card-element"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        borderLeft: `3px solid ${areaColor}`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        opacity: completed ? 0.6 : 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'opacity 0.3s',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={handleComplete}
        disabled={completed || completing}
        style={{
          background: 'none', border: 'none', padding: 0,
          cursor: completed ? 'default' : 'pointer',
          color: completed ? '#14b8a6' : '#cbd5e1',
          flexShrink: 0, marginTop: 1,
          transition: 'color 0.2s',
          display: 'flex',
        }}
      >
        {completing
          ? <div style={{ width: 18, height: 18, border: '2px solid #14b8a6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          : completed
            ? <CheckCircle2 size={18} color="#14b8a6" />
            : <Circle size={18} />
        }
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <p style={{
          fontSize: 14, fontWeight: 500, color: completed ? '#94a3b8' : '#0f172a',
          textDecoration: completed ? 'line-through' : 'none',
          marginBottom: task.description ? 3 : 6,
          lineHeight: 1.4,
        }}>
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, lineHeight: 1.5 }}>
            {task.description}
          </p>
        )}

        {/* Tags row */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          {/* Focus area */}
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99,
            background: `${areaColor}15`, color: areaColor,
          }}>
            {AREA_LABELS[task.focusArea] || task.focusArea}
          </span>

          {/* Priority */}
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99,
            background: PRIORITY_BG[task.priority] || '#f8fafc',
            color: PRIORITY_COLORS[task.priority] || '#64748b',
            textTransform: 'capitalize',
          }}>
            {task.priority}
          </span>

          {/* Estimated time */}
          {task.estimatedTime && (
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {task.estimatedTime}
            </span>
          )}

          {/* Streak */}
          {showStreak && streak > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
              background: '#fff7ed', color: '#ea580c',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <Flame size={10} color="#ea580c" /> {streak}d streak
            </span>
          )}

          {/* Schedule */}
          {task.schedule?.type && task.schedule.type !== 'once' && (
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>
              ↻ {task.schedule.type}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '5px', borderRadius: 7, color: '#94a3b8',
              transition: 'all 0.15s', display: 'flex',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <Edit2 size={13} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '5px', borderRadius: 7, color: '#94a3b8',
              transition: 'all 0.15s', display: 'flex',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Delete confirm overlay */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.97)',
              borderRadius: 12, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10, zIndex: 5,
            }}
          >
            <p style={{ fontSize: 13, color: '#0f172a', marginRight: 4 }}>Delete this task?</p>
            <button
              onClick={() => setShowConfirm(false)}
              style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {deleting ? '…' : 'Delete'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
