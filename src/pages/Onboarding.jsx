import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const FOCUS_AREAS = [
  { id: 'deepWork',      label: 'Deep Work',    icon: '◈', color: '#14b8a6' },
  { id: 'health',        label: 'Health',       icon: '◎', color: '#10b981' },
  { id: 'learning',      label: 'Learning',     icon: '◐', color: '#8b5cf6' },
  { id: 'relationships', label: 'Relationships',icon: '◑', color: '#f59e0b' },
  { id: 'creativity',    label: 'Creativity',   icon: '◒', color: '#ec4899' },
  { id: 'finance',       label: 'Finance',      icon: '◓', color: '#3b82f6' },
]

const RHYTHMS = [
  { id: 'morning',  label: 'Morning-first',  desc: 'Complete priorities before 12 PM. Best for early risers.' },
  { id: 'flexible', label: 'Flexible',       desc: 'Complete whenever fits your day. Best for varied schedules.' },
  { id: 'evening',  label: 'Evening review', desc: 'Reflect and plan at day\'s end. Best for night owls.' },
  { id: 'split',    label: 'Split focus',    desc: 'Deep work AM, lighter habits PM. Best for professionals.' },
]

const AGENTS = [
  { icon: '+', name: 'Planning Agent',  desc: 'Daily priorities & scheduling' },
  { icon: '✦', name: 'Support Agent',   desc: 'Contextual encouragement' },
  { icon: '⊞', name: 'Insights Agent',  desc: 'Trend analysis & patterns' },
  { icon: '○', name: 'Momentum Agent',  desc: 'Consistency & milestones' },
]

export default function Onboarding() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]   = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData]   = useState({
    displayName:  user?.displayName || '',
    focusAreas:   [],
    rhythm:       '',
  })

  const next = () => setStep(s => s + 1)

  const finish = async () => {
    setSaving(true)
    try {
      await updateProfile({
        displayName:        data.displayName,
        focusAreas:         data.focusAreas,
        rhythm:             data.rhythm,
        onboardingComplete: true,
        xp:                 0,
        level:              1,
        currentStreak:      0,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  const bg   = '#f8fafc'
  const card = {
    background: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  }

  const steps = [
    // ── Step 0: Name ──────────────────────────────────────────────
    <motion.div key="s0" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
      <div style={{ ...card, padding: '40px 44px', maxWidth: 480, width: '100%' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#14b8a6' }} />
          <span style={{ fontFamily:'Fraunces, Georgia, serif', fontSize:18, color:'#0f172a' }}>ZAP</span>
        </div>
        <p style={{ fontSize:12, color:'#94a3b8', marginBottom:36 }}>A cleaner way to build consistency</p>

        {/* Progress */}
        <div style={{ display:'flex', gap:4, marginBottom:32 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              flex:1, height:3, borderRadius:99,
              background: i <= step ? '#14b8a6' : '#e2e8f0',
              transition:'background 0.3s',
            }} />
          ))}
        </div>

        <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#94a3b8', marginBottom:8 }}>
          YOUR NAME
        </label>
        <input
          value={data.displayName}
          onChange={e => setData(d => ({ ...d, displayName: e.target.value }))}
          placeholder="Alex Morgan"
          autoFocus
          style={{
            width:'100%', padding:'11px 14px', borderRadius:10,
            border:'1.5px solid #e2e8f0', fontSize:15, color:'#0f172a',
            fontFamily:'inherit', outline:'none', marginBottom:16,
            background:'#f8fafc', boxSizing:'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#14b8a6'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, marginBottom:28 }}>
          ZAP learns your rhythm and auto-focuses your day — zero noise, just clear priorities.
        </p>
        <button
          onClick={() => data.displayName.trim() && next()}
          disabled={!data.displayName.trim()}
          style={{
            width:'100%', padding:'11px', borderRadius:10,
            background: data.displayName.trim() ? '#14b8a6' : '#e2e8f0',
            border:'none', color: data.displayName.trim() ? '#fff' : '#94a3b8',
            fontSize:14, fontWeight:500, cursor: data.displayName.trim() ? 'pointer' : 'not-allowed',
            fontFamily:'inherit', transition:'all 0.15s',
          }}
        >
          Continue →
        </button>
      </div>
    </motion.div>,

    // ── Step 1: Focus Areas ───────────────────────────────────────
    <motion.div key="s1" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
      <div style={{ ...card, padding:'40px 44px', maxWidth:520, width:'100%' }}>
        <div style={{ display:'flex', gap:4, marginBottom:28 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i <= step ? '#14b8a6' : '#e2e8f0' }} />
          ))}
        </div>

        <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#94a3b8', marginBottom:6 }}>FOCUS AREAS</p>
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, marginBottom:24 }}>
          Select the areas you want to build consistency in. Your daily priorities will be drawn from these.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
          {FOCUS_AREAS.map(area => {
            const selected = data.focusAreas.includes(area.id)
            return (
              <button
                key={area.id}
                onClick={() => setData(d => ({
                  ...d,
                  focusAreas: selected
                    ? d.focusAreas.filter(f => f !== area.id)
                    : [...d.focusAreas, area.id],
                }))}
                style={{
                  padding:'14px 16px', borderRadius:10, border:'1.5px solid',
                  borderColor: selected ? area.color : '#e2e8f0',
                  background: selected ? `${area.color}12` : '#f8fafc',
                  cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                  transition:'all 0.15s', display:'flex', alignItems:'center', gap:10,
                }}
              >
                <span style={{ fontSize:18, color: selected ? area.color : '#94a3b8' }}>{area.icon}</span>
                <span style={{ fontSize:13, fontWeight:500, color: selected ? '#0f172a' : '#64748b' }}>
                  {area.label}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => data.focusAreas.length > 0 && next()}
          disabled={data.focusAreas.length === 0}
          style={{
            width:'100%', padding:'11px', borderRadius:10,
            background: data.focusAreas.length > 0 ? '#14b8a6' : '#e2e8f0',
            border:'none', color: data.focusAreas.length > 0 ? '#fff' : '#94a3b8',
            fontSize:14, fontWeight:500, cursor: data.focusAreas.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily:'inherit',
          }}
        >
          Continue →
        </button>
      </div>
    </motion.div>,

    // ── Step 2: Rhythm ────────────────────────────────────────────
    <motion.div key="s2" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
      <div style={{ ...card, padding:'40px 44px', maxWidth:480, width:'100%' }}>
        <div style={{ display:'flex', gap:4, marginBottom:28 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i <= step ? '#14b8a6' : '#e2e8f0' }} />
          ))}
        </div>

        <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#94a3b8', marginBottom:6 }}>YOUR RHYTHM</p>
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, marginBottom:24 }}>
          How do you naturally structure your day? This helps the Planning Agent schedule intelligently.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
          {RHYTHMS.map(r => {
            const selected = data.rhythm === r.id
            return (
              <button
                key={r.id}
                onClick={() => setData(d => ({ ...d, rhythm: r.id }))}
                style={{
                  padding:'14px 16px', borderRadius:10, border:'1.5px solid',
                  borderColor: selected ? '#14b8a6' : '#e2e8f0',
                  background: selected ? '#f0fdfa' : '#f8fafc',
                  cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                  transition:'all 0.15s',
                }}
              >
                <p style={{ fontSize:13, fontWeight:600, color: selected ? '#0f172a' : '#475569', marginBottom:2 }}>
                  {r.label}
                </p>
                <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>{r.desc}</p>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => data.rhythm && next()}
          disabled={!data.rhythm}
          style={{
            width:'100%', padding:'11px', borderRadius:10,
            background: data.rhythm ? '#14b8a6' : '#e2e8f0',
            border:'none', color: data.rhythm ? '#fff' : '#94a3b8',
            fontSize:14, fontWeight:500, cursor: data.rhythm ? 'pointer' : 'not-allowed',
            fontFamily:'inherit',
          }}
        >
          Continue →
        </button>
      </div>
    </motion.div>,

    // ── Step 3: AI Team ───────────────────────────────────────────
    <motion.div key="s3" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
      <div style={{ ...card, padding:'40px 44px', maxWidth:480, width:'100%' }}>
        <div style={{ display:'flex', gap:4, marginBottom:28 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i <= step ? '#14b8a6' : '#e2e8f0' }} />
          ))}
        </div>

        <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#94a3b8', marginBottom:6 }}>YOUR AI TEAM</p>
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, marginBottom:24 }}>
          Four background agents work silently to keep you on track — no notifications unless meaningful.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
          {AGENTS.map(agent => (
            <div key={agent.name} style={{
              padding:'14px 16px', borderRadius:10, border:'1px solid #e2e8f0',
              background:'#f8fafc', display:'flex', alignItems:'center', gap:14,
            }}>
              <div style={{
                width:36, height:36, borderRadius:9, background:'#f0fdfa',
                border:'1px solid #99f6e4', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:16, color:'#14b8a6', flexShrink:0,
              }}>
                {agent.icon}
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#0f172a', margin:'0 0 2px' }}>{agent.name}</p>
                <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>{agent.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={finish}
          disabled={saving}
          style={{
            width:'100%', padding:'11px', borderRadius:10,
            background:'#14b8a6', border:'none', color:'#fff',
            fontSize:14, fontWeight:500, cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily:'inherit', opacity: saving ? 0.7 : 1,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}
        >
          {saving
            ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Setting up…</>
            : 'Open ZAP'
          }
        </button>
      </div>
    </motion.div>,
  ]

  return (
    <div style={{
      minHeight:'100vh', background: bg,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'24px',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>
    </div>
  )
}