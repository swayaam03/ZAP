import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, ArrowRight, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { format, addDays, parseISO, differenceInDays } from 'date-fns'

export default function WhatIfSimulatorModal({ open, onClose, tasks, onApply }) {
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [delayDays, setDelayDays] = useState(1)
  const [simulated, setSimulated] = useState(false)
  const [applying, setApplying] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setSelectedTaskId('')
      setDelayDays(1)
      setSimulated(false)
      setIsAnalyzing(false)
    }
  }, [open])

  // Active tasks only (not completed today)
  const today = format(new Date(), 'yyyy-MM-dd')
  const activeTasks = tasks.filter(t => !(t.completedDates || []).includes(today))

  const parseTime = (timeStr) => {
    if (!timeStr) return 0
    const match = timeStr.match(/([\d.]+)\s*([hmHM])/)
    if (!match) return 0
    const val = parseFloat(match[1])
    const unit = match[2].toLowerCase()
    if (unit === 'h') return val * 60
    if (unit === 'm') return val
    return 0
  }

  // Simulation Logic
  const simulationResults = useMemo(() => {
    if (!selectedTaskId || !simulated) return null

    const targetTask = activeTasks.find(t => t.id === selectedTaskId)
    if (!targetTask) return null

    const originalDateParams = targetTask.startDate ? parseISO(targetTask.startDate) : new Date()
    const originalDateStr = format(originalDateParams, 'yyyy-MM-dd')
    const delayedDate = addDays(originalDateParams, delayDays)
    const delayedDateStr = format(delayedDate, 'yyyy-MM-dd')

    // Workload per day BEFORE
    const beforeWorkloads = {}
    activeTasks.forEach(t => {
      const d = t.startDate || today
      beforeWorkloads[d] = (beforeWorkloads[d] || 0) + parseTime(t.estimatedTime)
    })

    // Workload per day AFTER
    const afterWorkloads = { ...beforeWorkloads }
    const taskMinutes = parseTime(targetTask.estimatedTime)
    afterWorkloads[originalDateStr] -= taskMinutes
    afterWorkloads[delayedDateStr] = (afterWorkloads[delayedDateStr] || 0) + taskMinutes

    // Detect Issues
    const issues = []
    const THRESHOLD = 360 // 6 hours
    
    let originalRisk = beforeWorkloads[delayedDateStr] > THRESHOLD ? 80 : Math.min((beforeWorkloads[delayedDateStr] || 0) / THRESHOLD * 50, 50)
    let newRisk = afterWorkloads[delayedDateStr] > THRESHOLD ? 85 : Math.min((afterWorkloads[delayedDateStr] || 0) / THRESHOLD * 50, 50)

    if (afterWorkloads[delayedDateStr] > THRESHOLD) {
      issues.push(`Overload Warning: Target day workload exceeds 6 hours (${Math.round(afterWorkloads[delayedDateStr] / 60)}h)`)
    }

    if (afterWorkloads[delayedDateStr] > (beforeWorkloads[delayedDateStr] || 0) + 120) {
      issues.push(`Significant spike: Adding ${Math.round(taskMinutes/60)}h to an already busy schedule.`)
    }

    // Smart Suggestions: find a day within +7 days with minimum workload
    let bestDayStr = delayedDateStr
    let minWorkload = afterWorkloads[delayedDateStr] || 0
    for (let i = 0; i <= 7; i++) {
        const checkDay = format(addDays(originalDateParams, i), 'yyyy-MM-dd')
        const w = (beforeWorkloads[checkDay] || 0)
        // Only suggest if it's a future day and workload gets better
        if (checkDay !== originalDateStr && checkDay !== delayedDateStr && w < minWorkload) {
            minWorkload = w
            bestDayStr = checkDay
        }
    }
    
    let suggestion = ""
    if (bestDayStr !== delayedDateStr && issues.length > 0) {
        suggestion = `Consider moving this to ${format(parseISO(bestDayStr), 'EEEE, MMM d')} instead. Workload is lighter (${Math.round(minWorkload/60)}h).`
    } else if (issues.length === 0) {
        suggestion = "This delay looks safe. Your schedule remains balanced."
    }

    return {
      targetTask,
      originalDateStr,
      delayedDateStr,
      beforeWorkloads,
      afterWorkloads,
      issues,
      originalRisk,
      newRisk,
      suggestion,
      bestDayStr
    }

  }, [selectedTaskId, simulated, delayDays, activeTasks])

  const handleApply = async () => {
    if (!simulationResults) return
    setApplying(true)
    try {
      await onApply(selectedTaskId, { startDate: simulationResults.delayedDateStr })
      onClose()
    } finally {
      setApplying(false)
    }
  }

  const handleSuggestApply = async (autoDelayStr) => {
    setApplying(true)
    try {
      await onApply(selectedTaskId, { startDate: autoDelayStr })
      onClose()
    } finally {
      setApplying(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            style={{
              background: '#ffffff',
              borderRadius: 24, padding: '32px',
              width: '100%', maxWidth: 540,
              boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              position: 'relative'
            }}
          >
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="#8b5cf6" />
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'Fraunces, serif' }}>
                What-If Simulator
              </h2>
            </div>
            
            {!simulated && !isAnalyzing ? (
                // Input Phase
                <motion.div
                    key="input"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                >
                    <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
                        Select a task and imagine pushing the deadline. We'll show you the ripple effects on your schedule.
                    </p>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                            Task to Delay
                        </label>
                        <select 
                            value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0',
                                fontSize: 14, color: '#0f172a', outline: 'none', background: '#f8fafc',
                                fontFamily: 'inherit', cursor: 'pointer'
                            }}
                        >
                            <option value="">Choose an active task...</option>
                            {activeTasks.map(t => (
                                <option key={t.id} value={t.id}>{t.title} ({t.estimatedTime || '30m'})</option>
                            ))}
                        </select>
                    </div>

                    {selectedTaskId && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: 24, overflow: 'hidden' }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                                Delay By
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                {[1, 2, 3, 7].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => setDelayDays(days)}
                                        style={{
                                            padding: '10px 0', borderRadius: 10,
                                            border: delayDays === days ? '1px solid #8b5cf6' : '1px solid #e2e8f0',
                                            background: delayDays === days ? '#f5f3ff' : '#fff',
                                            color: delayDays === days ? '#7c3aed' : '#64748b',
                                            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        +{days} {days === 1 ? 'Day' : 'Days'}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <button
                        disabled={!selectedTaskId || applying}
                        onClick={() => {
                            setIsAnalyzing(true)
                            setTimeout(() => {
                                setIsAnalyzing(false)
                                setSimulated(true)
                            }, 1200)
                        }}
                        style={{
                            width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                            background: selectedTaskId ? '#8b5cf6' : '#e2e8f0',
                            color: selectedTaskId ? '#fff' : '#94a3b8',
                            fontSize: 14, fontWeight: 600, cursor: selectedTaskId ? 'pointer' : 'default',
                            transition: 'all 0.2s', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                    >
                        Simulate Impacts <ArrowRight size={16} />
                    </button>
                </motion.div>
            ) : isAnalyzing ? (
                // Analysis Phase
                <motion.div 
                    key="analyzing"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}
                >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #f3e8ff', borderTopColor: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', animation: 'pulse 1.5s infinite' }}>
                        ANALYZING RIPPLE EFFECTS...
                    </p>
                    <style>{`
                        @keyframes spin { to { transform: rotate(360deg) } }
                        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
                    `}</style>
                </motion.div>
            ) : (
                // Output Phase
                simulationResults && (
                    <motion.div key="output" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                        {/* Risk Change Header */}
                         <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                         style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            padding: '14px 16px', background: simulationResults.issues.length ? '#fef2f2' : '#f0fdf4',
                            borderRadius: 12, border: simulationResults.issues.length ? '1px solid #fecaca' : '1px solid #bbf7d0',
                            marginBottom: 20
                         }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: simulationResults.issues.length ? '#b91c1c' : '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {simulationResults.issues.length ? 'Conflict Detected' : 'Safe to Delay'}
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: simulationResults.issues.length ? '#dc2626' : '#15803d' }}>
                                    Risk Score: {Math.round(simulationResults.originalRisk)}% → <strong>{Math.round(simulationResults.newRisk)}%</strong>
                                </p>
                            </div>
                            {simulationResults.issues.length ? <AlertTriangle size={24} color="#ef4444" /> : <CheckCircle2 size={24} color="#22c55e" />}
                         </motion.div>

                        {/* Impact Details */}
                        {simulationResults.issues.length > 0 && (
                            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginBottom: 20 }}>
                                <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#475569' }}>Impact Analysis</h4>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {simulationResults.issues.map((iss, i) => (
                                        <li key={i} style={{ fontSize: 13, color: '#0f172a', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                            <span style={{ color: '#ef4444' }}>•</span> {iss}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* Timeline Visualization */}
                        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginBottom: 24 }}>
                             <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#475569' }}>Workload Timeline</h4>
                             <div style={{ display: 'flex', gap: 4 }}>
                                {[0, 1, 2, 3, 4].map((offset, i) => {
                                    const dStr = format(addDays(parseISO(simulationResults.originalDateStr), offset), 'yyyy-MM-dd')
                                    const mins = simulationResults.afterWorkloads[dStr] || 0
                                    const isTarget = dStr === simulationResults.delayedDateStr
                                    
                                    // Color logic
                                    let bg = '#f1f5f9'
                                    let border = '1px solid #e2e8f0'
                                    let shadow = 'none'
                                    let transform = 'scale(1)'
                                    if (mins > 360) { bg = '#fecaca'; border = '1px solid #f87171' }
                                    else if (mins > 180) { bg = '#fde68a'; border = '1px solid #fbbf24' }
                                    else if (mins > 0) { bg = '#dcfce3'; border = '1px solid #86efac' }
                                    
                                    if (isTarget && mins <= 360) {
                                        bg = '#dbeafe'; border = '1px solid #bfdbfe'; shadow = '0 4px 12px rgba(59, 130, 246, 0.2)'; transform = 'scale(1.05)'
                                    } else if (isTarget && mins > 360) {
                                        shadow = '0 4px 12px rgba(239, 68, 68, 0.3)'; transform = 'scale(1.05)'
                                    }

                                    return (
                                        <motion.div 
                                            key={dStr} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + (i * 0.05) }}
                                            style={{ 
                                            flex: 1, height: 48, borderRadius: 8, background: bg, border,
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            transform,
                                            boxShadow: shadow,
                                            zIndex: isTarget ? 1 : 0
                                        }}>
                                            <span style={{ fontSize: 10, fontWeight: 600, color: mins > 360 ? '#991b1b' : '#475569', textTransform: 'uppercase' }}>
                                                {format(parseISO(dStr), 'EEE')}
                                            </span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: mins > 360 ? '#7f1d1d' : '#0f172a' }}>
                                                {mins ? `${Math.round(mins/60)}h` : 'Free'}
                                            </span>
                                        </motion.div>
                                    )
                                })}
                             </div>
                        </motion.div>

                        {/* AI Suggestion */}
                        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} style={{ 
                            padding: '14px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1',
                            display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 24
                        }}>
                             <span style={{ fontSize: 16 }}>🤖</span>
                             <div>
                                 <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                                     {simulationResults.suggestion}
                                 </p>
                                 {simulationResults.issues.length > 0 && simulationResults.bestDayStr !== simulationResults.delayedDateStr && (
                                     <button 
                                        onClick={() => handleSuggestApply(simulationResults.bestDayStr)}
                                        style={{ 
                                            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6,
                                            padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#0f172a',
                                            marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                            transition: 'border-color 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                     >
                                         <Zap size={11} color="#eab308" /> Move to {format(parseISO(simulationResults.bestDayStr), 'EEEE')} instead
                                     </button>
                                 )}
                             </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => setSimulated(false)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0',
                                    background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                                }}
                            >
                                Back
                            </button>
                            <button
                                disabled={applying}
                                onClick={handleApply}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                                    background: simulationResults.issues.length > 0 ? '#ef4444' : '#10b981', 
                                    color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                    transition: 'all 0.2s',
                                    opacity: applying ? 0.7 : 1
                                }}
                            >
                                {applying ? 'Applying...' : (simulationResults.issues.length > 0 ? 'Proceed Anyway' : 'Apply Changes')}
                            </button>
                        </motion.div>
                    </motion.div>
                )
            )}
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
