// FILE: src/components/tasks/TaskModal.jsx
// QUESTMIND INTEGRATION: Added ZAP fields (deadline, groupId, critical priority)
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTasks } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'

const FOCUS_AREAS = [
  { id: 'deepWork', label: 'Deep Work', color: '#14b8a6' },
  { id: 'health', label: 'Health', color: '#10b981' },
  { id: 'learning', label: 'Learning', color: '#8b5cf6' },
  { id: 'relationships', label: 'Relationships', color: '#f59e0b' },
  { id: 'creativity', label: 'Creativity', color: '#ec4899' },
  { id: 'finance', label: 'Finance', color: '#3b82f6' },
]

// QUESTMIND INTEGRATION: Added 'critical' tier
const PRIORITIES = ['critical', 'high', 'medium', 'low']
const TIMES = ['15 min', '30 min', '1 hour', '2 hours', '3+ hours']
const SCHEDULES = ['once', 'daily', 'weekdays', 'weekly', 'custom']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PRIORITY_COLORS = { critical: '#681717', high: '#ef4444', medium: '#f59e0b', low: '#10b981' }

export default function TaskModal({ open, onClose, task = null }) {
  const { addTask, editTask } = useTasks()
  const { profile } = useAuth()
  const isEdit = !!task

  const [form, setForm] = useState({
    title: '', description: '',
    focusArea: profile?.focusAreas?.[0] || 'deepWork',
    priority: 'medium', estimatedTime: '30 min',
    // QUESTMIND INTEGRATION: ZAP fields
    deadline: '', groupId: '',
    scheduleType: 'once', scheduleDays: [], scheduleTime: '',
    startDate: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '', description: task.description || '',
        focusArea: task.focusArea || 'deepWork',
        priority: task.priority || 'medium', estimatedTime: task.estimatedTime || '30 min',
        // QUESTMIND INTEGRATION: Load ZAP fields
        deadline: task.deadline ? new Date(task.deadline.toDate?.() || task.deadline).toISOString().split('T')[0] : '',
        groupId: task.groupId || '',
        scheduleType: task.schedule?.type || 'once', scheduleDays: task.schedule?.days || [],
        scheduleTime: task.schedule?.time || '',
        startDate: task.startDate || new Date().toISOString().split('T')[0],
      })
    } else {
      setForm({ title: '', description: '', focusArea: profile?.focusAreas?.[0] || 'deepWork', priority: 'medium', estimatedTime: '30 min', deadline: '', groupId: '', scheduleType: 'once', scheduleDays: [], scheduleTime: '', startDate: new Date().toISOString().split('T')[0] })
    }
    setErrors({})
  }, [task, open])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })) }
  const toggleDay = (day) => {
    setForm(f => ({ ...f, scheduleDays: f.scheduleDays.includes(day) ? f.scheduleDays.filter(d => d !== day) : [...f.scheduleDays, day] }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) { setErrors({ title: 'Title is required' }); return }
    setLoading(true)
    try {
      const payload = {
        title: form.title.trim(), description: form.description.trim(),
        focusArea: form.focusArea, priority: form.priority, estimatedTime: form.estimatedTime,
        // QUESTMIND INTEGRATION: Send ZAP fields
        deadline: form.deadline || null, groupId: form.groupId.trim() || null,
        schedule: { type: form.scheduleType, days: form.scheduleDays, time: form.scheduleTime },
        startDate: form.startDate, streak: isEdit ? task.streak : 0, completedDates: isEdit ? task.completedDates : [],
      }
      if (isEdit) await editTask(task.id, payload)
      else await addTask(payload)
      onClose()
    } catch (err) { setErrors({ title: err.message }) } finally { setLoading(false) }
  }

  const sel = (condition) => ({ border: `1.5px solid ${condition ? '#14b8a6' : '#e2e8f0'}`, background: condition ? '#f0fdfa' : '#f8fafc', color: condition ? '#0f172a' : '#64748b' })
  const label = { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }
  const input = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13.5, color: '#0f172a', fontFamily: 'inherit', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', transition: 'border-color 0.15s' }

  return (
    <AnimatePresence>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)' }} onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }} style={{ position: 'relative', zIndex: 10, background: '#ffffff', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.14)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>{isEdit ? 'Edit task' : 'New task'}</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, display: 'flex' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={label}>TASK TITLE *</label>
                <input style={{ ...input, borderColor: errors.title ? '#ef4444' : '#e2e8f0' }} placeholder="e.g. 90-minute deep work block" value={form.title} onChange={e => set('title', e.target.value)} autoFocus onFocus={e => e.target.style.borderColor = '#14b8a6'} onBlur={e => e.target.style.borderColor = errors.title ? '#ef4444' : '#e2e8f0'} />
                {errors.title && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>⚠ {errors.title}</p>}
              </div>
              <div>
                <label style={label}>DESCRIPTION <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <textarea style={{ ...input, resize: 'none', minHeight: 68 }} placeholder="Add more context..." value={form.description} onChange={e => set('description', e.target.value)} onFocus={e => e.target.style.borderColor = '#14b8a6'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div>
                <label style={label}>FOCUS AREA</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {FOCUS_AREAS.map(area => (
                    <button key={area.id} type="button" onClick={() => set('focusArea', area.id)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', border: '1.5px solid', borderColor: form.focusArea === area.id ? area.color : '#e2e8f0', background: form.focusArea === area.id ? `${area.color}15` : '#f8fafc', color: form.focusArea === area.id ? area.color : '#64748b' }}>{area.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={label}>PRIORITY TIER</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {PRIORITIES.map(p => (
                      <button key={p} type="button" onClick={() => set('priority', p)} style={{ flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 11, fontWeight: 500, border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', textTransform: 'capitalize', borderColor: form.priority === p ? PRIORITY_COLORS[p] : '#e2e8f0', background: form.priority === p ? `${PRIORITY_COLORS[p]}12` : '#f8fafc', color: form.priority === p ? PRIORITY_COLORS[p] : '#64748b' }}>{p}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={label}>ESTIMATED TIME</label>
                  <select value={form.estimatedTime} onChange={e => set('estimatedTime', e.target.value)} style={{ ...input, cursor: 'pointer' }}>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              {/* QUESTMIND INTEGRATION: Deadline + Group ID Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={label}>DEADLINE <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                  <input type="date" style={input} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                </div>
                <div>
                  <label style={label}>GROUP ID <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                  <input style={input} placeholder="e.g. project-alpha" value={form.groupId} onChange={e => set('groupId', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={label}>SCHEDULE / REPEAT</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {SCHEDULES.map(s => (
                    <button key={s} type="button" onClick={() => set('scheduleType', s)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500, border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', textTransform: 'capitalize', ...sel(form.scheduleType === s) }}>{s}</button>
                  ))}
                </div>
                {form.scheduleType === 'custom' && (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                    {WEEKDAYS.map(day => (
                      <button key={day} type="button" onClick={() => toggleDay(day)} style={{ flex: 1, padding: '6px 2px', borderRadius: 7, fontSize: 11, fontWeight: 500, border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', ...sel(form.scheduleDays.includes(day)) }}>{day}</button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={label}>TIME <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                  <input type="time" style={input} value={form.scheduleTime} onChange={e => set('scheduleTime', e.target.value)} />
                </div>
                <div>
                  <label style={label}>START DATE</label>
                  <input type="date" style={input} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button type="button" onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: 10, background: loading ? '#5eead4' : '#14b8a6', border: 'none', color: '#fff', fontSize: 13.5, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Saving…</> : isEdit ? 'Save changes' : 'Create task'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}