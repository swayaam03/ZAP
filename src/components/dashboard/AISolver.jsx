import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Send, Save, CheckCircle2, AlertCircle, FileText, Activity, Paperclip, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { useNotes } from '../../hooks/useNotes'
import { generateInsight } from '../../services/aiService'

export default function AISolver() {
  const { profile } = useAuth()
  const { tasks } = useTasks()
  const { notes, addNote } = useNotes()
  
  const [messages, setMessages] = useState([
    {
      id: 'greeting',
      role: 'assistant',
      content: `Hello ${profile?.displayName?.split(' ')[0] || 'there'}! I'm your AI Doubt Solver. I can answer questions using your Notes and Tasks as context. What are you stuck on?`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [contextUsed, setContextUsed] = useState([])
  const [behaviorInsight, setBehaviorInsight] = useState(null)
  const [attachedFiles, setAttachedFiles] = useState([])
  const fileInputRef = useRef(null)
  
  const chatEndRef = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Context Engine Logic
  const generateResponse = async (query) => {
    setIsTyping(true)

    // 1. Fetch Relevant Context (Simulated Search)
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3)
    
    // Find matching notes
    const matchedNotes = notes.filter(n => 
      keywords.some(k => n.content.toLowerCase().includes(k))
    )
    
    // Find matching tasks
    const matchedTasks = tasks.filter(t => 
      keywords.some(k => ((t.title || '') + (t.description || '')).toLowerCase().includes(k))
    )

    const contextItems = [
      ...attachedFiles.map(f => ({ type: 'file', text: f.name })),
      ...matchedNotes.map(n => ({ type: 'note', text: n.content.substring(0, 50) + '...' })),
      ...matchedTasks.map(n => ({ type: 'task', text: n.title, focusArea: n.focusArea }))
    ]

    setContextUsed(contextItems)

    // 2. Behavioral Intelligence Calculation
    let insight = "No specific behavioral patterns detected for this topic."
    const focusAreas = matchedTasks.map(t => t.focusArea).filter(Boolean)
    if (focusAreas.length > 0) {
      const topArea = focusAreas[0]
      const uncompletedInArea = tasks.filter(t => t.focusArea === topArea && !(t.completedDates && t.completedDates.length > 0))
      
      if (uncompletedInArea.length > 3) {
        insight = `You usually procrastinate or delay tasks in the "${topArea}" category. Let's start with the basics to build momentum.`
      } else {
        insight = `You're typically very consistent with "${topArea}". Here is a deeper, more advanced explanation.`
      }
    }
    setBehaviorInsight(insight)

    // 3. Generate AI Response
    let aiResponse = await generateInsight(query, contextItems, attachedFiles)
    
    // Clear files after sending
    setAttachedFiles([])

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    }])
    setIsTyping(false)
  }

  const handleSend = () => {
    if (!input.trim() || isTyping) return
    const msg = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, msg])
    setInput('')
    generateResponse(msg.content)
  }

  const handleSaveNote = async (text) => {
    await addNote(text, ['AI-saved'])
    // Just a visual feedback could be added here
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (!attachedFiles.find(f => f.name === file.name)) {
        setAttachedFiles(prev => [...prev, file])
      }
    }
  }

  const removeFile = (fileName) => {
    setAttachedFiles(prev => prev.filter(f => f.name !== fileName))
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#f7f6f3', gap: 24, padding: '24px 36px' }}>
      
      {/* LEFT: Main Chat Area */}
      <div style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', 
        background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' 
      }}>
        {/* Chat Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#f0fdfa', padding: 8, borderRadius: 10 }}>
            <Brain size={20} color="#0d9488" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>AI Mentor</h2>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Context-aware learning assistant</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                maxWidth: '75%', 
                background: msg.role === 'user' ? '#14b8a6' : '#f8fafc',
                color: msg.role === 'user' ? '#fff' : '#0f172a',
                padding: '14px 18px',
                borderRadius: 18,
                borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
                borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 18,
                fontSize: 14, lineHeight: 1.5,
                border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                position: 'relative', group: 'msg'
              }}>
                {msg.content}
                
                {msg.role === 'assistant' && msg.id !== 'greeting' && (
                  <button 
                    onClick={() => handleSaveNote(msg.content)}
                    title="Save as Note"
                    style={{ 
                      position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)',
                      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%',
                      width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#14b8a6'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  >
                    <Save size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ 
                background: '#f8fafc', padding: '14px 18px', borderRadius: 18,
                borderBottomLeftRadius: 4, display: 'flex', alignItems: 'center', gap: 6,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
          
          {/* File Attachments Display */}
          {attachedFiles.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {attachedFiles.map(f => (
                <div key={f.name} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px',
                  background: '#f1f5f9', borderRadius: 6, fontSize: 11, color: '#475569',
                  border: '1px solid #e2e8f0'
                }}>
                  <Paperclip size={10} color="#64748b" />
                  <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <button 
                    onClick={() => removeFile(f.name)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#94a3b8' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ 
            display: 'flex', gap: 12, alignItems: 'flex-end', 
            background: '#f8fafc', padding: '10px 14px', borderRadius: 16, border: '1px solid #e2e8f0' 
          }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px',
                color: '#94a3b8', display: 'flex', alignItems: 'center', transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              title="Attach File (Note: Extracted text is NOT passed to the LLM as per settings)"
            >
              <Paperclip size={18} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
            <textarea  
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask anything about your tasks, notes, or schedule..."
              style={{
                flex: 1, border: 'none', background: 'transparent', resize: 'none',
                minHeight: 24, maxHeight: 120, outline: 'none', fontSize: 14, fontFamily: 'inherit',
                color: '#0f172a', padding: '4px 0'
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{
                background: input.trim() ? '#14b8a6' : '#cbd5e1', border: 'none',
                width: 36, height: 36, borderRadius: 12, display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default',
                color: '#fff', transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            AI can make mistakes. Remember to verify schedule-critical suggestions.
          </p>
        </div>
      </div>

      {/* RIGHT: Context & Insights Panel */}
      <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Behavioral Insight Widget */}
        <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: '#ffffff', borderRadius: 16, padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Activity size={18} color="#8b5cf6" />
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Behavioral Insight</h3>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#0f172a', lineHeight: 1.6 }}>
                {behaviorInsight || "Ask a question to trigger behavioral analysis based on your history."}
              </p>
            </motion.div>
        </AnimatePresence>

        {/* Relevant Notes Used */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: '20px', border: '1px solid #e2e8f0', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FileText size={18} color="#0ea5e9" />
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Context Synced</h3>
          </div>
          
          {contextUsed.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <AlertCircle size={24} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
               <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>No specific notes or tasks utilized for the current response.</p>
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', marginBottom: 4 }}>The AI is generating answers based on:</p>
              {contextUsed.map((item, idx) => (
                <div key={idx} style={{ 
                  padding: '12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9',
                  borderLeft: `3px solid ${item.type === 'note' ? '#0ea5e9' : (item.type === 'file' ? '#8b5cf6' : '#f59e0b')}` 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{item.type}</span>
                    {item.focusArea && <span style={{ fontSize: 10, color: '#94a3b8' }}>{item.focusArea}</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
