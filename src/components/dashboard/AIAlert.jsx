import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

export default function AIAlert({ activeTasks }) {
  const [dismissed, setDismissed] = useState(false)
  const [showWhy, setShowWhy] = useState(false)

  // Parse estimated time from strings like "30m", "1h", "1.5h"
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

  const totalRequiredMins = activeTasks.reduce((acc, t) => acc + parseTime(t.estimatedTime), 0)
  
  // Calculate remaining time in the day assuming awake hours end at 23:00
  const now = new Date()
  const endOfDay = new Date()
  endOfDay.setHours(23, 0, 0, 0)
  
  const remainingMins = Math.max(0, (endOfDay - now) / (1000 * 60))

  // Simulate AI risk detection based on time + assumed historical skip pattern
  const timeRisk = totalRequiredMins > remainingMins
  // Trigger pattern risk if there are active tasks and it's 6 PM or later 
  const patternRisk = activeTasks.length > 0 && now.getHours() >= 18;
  const atRisk = timeRisk || patternRisk

  if (!atRisk || dismissed) return null

  // Calculate missed tasks estimate
  const missedPrediction = Math.max(1, Math.floor(totalRequiredMins / 60) || 1)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        style={{
          background: '#fffbf9',
          border: '1px solid #fed7aa',
          borderRadius: 14,
          padding: '16px 20px',
          boxShadow: '0 4px 12px rgba(234, 88, 12, 0.06)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.06)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{ marginTop: 2 }}>
          <AlertCircle size={22} color="#ea580c" />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#9a3412', letterSpacing: '0.05em' }}>
              ALERT
            </h4>
            <button 
              onClick={() => setDismissed(true)}
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#fb923c'
              }}
            >
              <X size={16} />
            </button>
          </div>
          
          <p style={{ margin: '6px 0 14px', fontSize: 14, color: '#c2410c', lineHeight: 1.4, fontWeight: 500 }}>
            You are likely to miss {missedPrediction} task{missedPrediction > 1 ? 's' : ''} today.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{
              background: '#ea580c', color: '#ffffff',
              border: 'none', borderRadius: 6, padding: '7px 14px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.2s', width: '100%',
              display: 'flex', justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#c2410c'}
            onMouseLeave={e => e.currentTarget.style.background = '#ea580c'}
            >
              Fix Schedule
            </button>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowWhy(!showWhy)}
                style={{
                  background: 'none', color: '#ea580c',
                  border: '1px solid #fed7aa', borderRadius: 6, padding: '6px 12px',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                Why?
              </button>
              
              <AnimatePresence>
                {showWhy && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    style={{
                      position: 'absolute',
                      top: '100%', right: 0, marginTop: 8,
                      background: '#1e293b', color: '#f8fafc',
                      padding: '12px 14px', borderRadius: 8,
                      fontSize: 12, width: 220, zIndex: 10,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      lineHeight: 1.5
                    }}
                  >
                    You have {totalRequiredMins} mins of tasks required, but historically you complete fewer tasks after 6 PM. Pattern data suggests high risk.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
