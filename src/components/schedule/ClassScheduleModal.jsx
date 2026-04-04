// QUESTMIND INTEGRATION: Separate modal for managing class schedules
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClassSchedules } from '../../hooks/useClassSchedules'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
]

export default function ClassScheduleModal({ open, onClose }) {
    const { schedules, addSchedule, updateSchedule, removeSchedule } = useClassSchedules()
    const [form, setForm] = useState({
        courseName: '',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        location: '',
    })
    const [editingId, setEditingId] = useState(null)

    const resetForm = () => {
        setForm({
            courseName: '',
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '10:00',
            location: '',
        })
        setEditingId(null)
    }

    useEffect(() => {
        if (!open) resetForm()
    }, [open])

    const handleSubmit = async () => {
        if (!form.courseName.trim()) return

        try {
            if (editingId) {
                await updateSchedule(editingId, form)
            } else {
                await addSchedule(form)
            }
            resetForm()
        } catch (err) {
            console.error('Failed to save class:', err)
        }
    }

    const handleEdit = (schedule) => {
        setForm({
            courseName: schedule.courseName,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            location: schedule.location || '',
        })
        setEditingId(schedule.id)
    }

    const handleDelete = async (id) => {
        if (confirm('Remove this class from schedule?')) {
            await removeSchedule(id)
        }
    }

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const input = {
        width: '100%', padding: '9px 12px', borderRadius: 9,
        border: '1.5px solid #e2e8f0', fontSize: 13.5, color: '#0f172a',
        fontFamily: 'inherit', outline: 'none', background: '#f8fafc',
        boxSizing: 'border-box',
    }

    const label = { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }

    return (
        <AnimatePresence>
            {open && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)' }}
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        style={{
                            position: 'relative', zIndex: 10,
                            background: '#ffffff', borderRadius: 18,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.14)',
                            width: '100%', maxWidth: 600,
                            maxHeight: '90vh', overflowY: 'auto',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                                Class Schedule
                            </h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6 }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: 24 }}>
                            {/* Form */}
                            <div style={{ marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
                                    {editingId ? 'Edit Class' : 'Add New Class'}
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                    <div>
                                        <label style={label}>COURSE NAME *</label>
                                        <input
                                            style={input}
                                            placeholder="e.g. Data Structures"
                                            value={form.courseName}
                                            onChange={e => set('courseName', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label style={label}>LOCATION</label>
                                        <input
                                            style={input}
                                            placeholder="e.g. Room 301"
                                            value={form.location}
                                            onChange={e => set('location', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                                    <div>
                                        <label style={label}>DAY</label>
                                        <select
                                            style={input}
                                            value={form.dayOfWeek}
                                            onChange={e => set('dayOfWeek', parseInt(e.target.value, 10))}
                                        >
                                            {WEEKDAYS.map((day, idx) => (
                                                <option key={idx} value={idx}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={label}>START</label>
                                        <select
                                            style={input}
                                            value={form.startTime}
                                            onChange={e => set('startTime', e.target.value)}
                                        >
                                            {TIME_SLOTS.map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={label}>END</label>
                                        <select
                                            style={input}
                                            value={form.endTime}
                                            onChange={e => set('endTime', e.target.value)}
                                        >
                                            {TIME_SLOTS.map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        onClick={resetForm}
                                        style={{
                                            flex: 1, padding: '9px', borderRadius: 9,
                                            border: '1.5px solid #e2e8f0', background: '#fff',
                                            color: '#64748b', fontSize: 13, fontWeight: 500,
                                            cursor: 'pointer', fontFamily: 'inherit',
                                        }}
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        style={{
                                            flex: 1, padding: '9px', borderRadius: 9,
                                            border: 'none', background: '#14b8a6',
                                            color: '#fff', fontSize: 13, fontWeight: 500,
                                            cursor: 'pointer', fontFamily: 'inherit',
                                        }}
                                    >
                                        {editingId ? 'Update' : 'Add Class'}
                                    </button>
                                </div>
                            </div>

                            {/* Schedule List */}
                            <div>
                                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
                                    Your Classes ({schedules.length})
                                </h3>

                                {schedules.length === 0 ? (
                                    <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 24 }}>
                                        No classes added yet. Add your class schedule above.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {schedules.map(schedule => (
                                            <div
                                                key={schedule.id}
                                                style={{
                                                    padding: '12px',
                                                    background: '#fff',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 9,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
                                                        {schedule.courseName}
                                                    </p>
                                                    <p style={{ fontSize: 11, color: '#64748b' }}>
                                                        {WEEKDAYS[schedule.dayOfWeek]} • {schedule.startTime} - {schedule.endTime}
                                                        {schedule.location && ` • ${schedule.location}`}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button
                                                        onClick={() => handleEdit(schedule)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: 6,
                                                            border: '1px solid #e2e8f0',
                                                            background: '#f8fafc',
                                                            color: '#64748b',
                                                            fontSize: 11,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(schedule.id)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: 6,
                                                            border: 'none',
                                                            background: '#fef2f2',
                                                            color: '#ef4444',
                                                            fontSize: 11,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}