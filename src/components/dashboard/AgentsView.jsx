import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { useStreaks } from '../../hooks/useStreaks'

const AGENTS = [
  {
    id: 'planning',
    name: 'Planning',
    icon: '+',
    color: '#14b8a6',
    bg: '#f0fdfa',
    sub: 'Daily priorities & scheduling',
    intro: (profile, tasks, streaks) => {
      const taskCount = tasks?.length || 0
      return `I've reviewed your goal profile and completion history. You have ${taskCount} active tasks across your focus areas. Your daily plan is ready, sequenced by your energy patterns. Anything you'd like to adjust?`
    },
  },
  {
    id: 'support',
    name: 'Support',
    icon: '✦',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    sub: 'Contextual encouragement',
    intro: (profile, tasks, streaks) => {
      const streak = profile?.currentStreak || 0
      return streak > 0
        ? `You've completed ${streak} consecutive days. That's not willpower, that's identity. What's feeling difficult today?`
        : `Every habit starts somewhere. You're here, which means you're already ahead. What would you like to work on today?`
    },
  },
  {
    id: 'insights',
    name: 'Insights',
    icon: '⊞',
    color: '#3b82f6',
    bg: '#eff6ff',
    sub: 'Trend analysis & patterns',
    intro: (profile, tasks, streaks) => {
      const completed = tasks?.filter(t => (t.completedDates || []).length > 0).length || 0
      return `I've processed your behavioral data. You have ${completed} tasks with completion history. The clearest signal: consistency in one area tends to lift others. Want the full pattern report?`
    },
  },
  {
    id: 'momentum',
    name: 'Momentum',
    icon: '○',
    color: '#f59e0b',
    bg: '#fffbeb',
    sub: 'Consistency & milestones',
    intro: (profile, tasks, streaks) => {
      const streak = profile?.currentStreak || 0
      const longest = profile?.longestStreak || 0
      return streak > longest - 5 && longest > 0
        ? `You're ${longest - streak} days from your longest ever streak. The ${streak > 0 ? streak + '-day' : ''} milestone is in reach. Stay the course.`
        : `You're at ${streak} days. Every day you complete is a data point that says: this is who I am. What's your focus today?`
    },
  },
]

const AGENT_SYSTEM_PROMPTS = {
  planning: (profile, tasks) => {
    const displayName = profile?.displayName || 'the user'
    const focusAreas = profile?.focusAreas?.join(', ') || 'various areas'
    const rhythm = profile?.rhythm || 'flexible'
    const taskList = tasks?.map(t => `"${t.title}" (${t.focusArea}, ${t.priority} priority)`).join('; ') || 'none'
    const currentStreak = profile?.currentStreak || 0
    
    return `You are the Planning Agent for ZAP, an AI habit-building platform.
User: ${displayName}
Focus areas: ${focusAreas}
Rhythm: ${rhythm}
Active tasks: ${taskList}
Current streak: ${currentStreak} days
You help with daily planning, task prioritization, and scheduling. Be concise, practical, and direct. Max 3 sentences per response.`
  },

  support: (profile, tasks) => {
    const displayName = profile?.displayName || 'the user'
    const currentStreak = profile?.currentStreak || 0
    const level = profile?.level || 1
    const xp = profile?.xp || 0
    
    return `You are the Support Agent for ZAP.
User: ${displayName}
Current streak: ${currentStreak} days
Level: ${level}, XP: ${xp}
You provide emotional support, motivation, and encouragement. Be warm, empathetic, and human. Reference their actual data when relevant. Max 3 sentences.`
  },

  insights: (profile, tasks) => {
    const displayName = profile?.displayName || 'the user'
    const tasksWithHistory = tasks?.filter(t => t.completedDates?.length > 0).length || 0
    const topStreakTasks = tasks?.sort((a, b) => (b.streak || 0) - (a.streak || 0)).slice(0, 3).map(t => t.title).join(', ') || 'none'
    
    return `You are the Insights Agent for ZAP.
User: ${displayName}
Tasks with history: ${tasksWithHistory}
Top streak tasks: ${topStreakTasks}
You analyze patterns and provide data-driven insights. Be analytical but accessible. Reference real patterns in their data. Max 3 sentences.`
  },

  momentum: (profile, tasks) => {
    const displayName = profile?.displayName || 'the user'
    const currentStreak = profile?.currentStreak || 0
    const longestStreak = profile?.longestStreak || 0
    const level = profile?.level || 1
    
    return `You are the Momentum Agent for ZAP.
User: ${displayName}
Current streak: ${currentStreak} days
Longest streak: ${longestStreak} days
Level: ${level}
You track milestones and celebrate consistency wins. Be encouraging and milestone-focused. Reference specific numbers. Max 3 sentences.`
  },
}

const FALLBACK_RESPONSES = {
  planning: "Based on your current tasks, I'd suggest prioritizing your high-priority items in your peak hours. Would you like me to reorder today's plan?",
  support: "You're doing the right things. Progress isn't always visible in the moment — but consistency always compounds. Keep going.",
  insights: "Your data shows that you're most consistent when tasks align with your natural rhythm. The pattern is clear: small daily actions drive the biggest results.",
  momentum: "Every day you show up is a vote for the person you're becoming. The streak is just the visible part of something deeper.",
}

export default function AgentsView() {
  const { profile } = useAuth()
  const { tasks } = useTasks()
  const { streaks } = useStreaks()
  const [activeAgent, setActiveAgent] = useState('planning')
  const [chats, setChats] = useState({})
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)

  const agent = AGENTS.find(a => a.id === activeAgent) || AGENTS[0]
  const USE_MOCK = import.meta.env.VITE_USE_MOCK_AGENTS === 'true'

  // Initialize chat with intro message when switching agents
  useEffect(() => {
    if (!chats[activeAgent]) {
      const introText = agent.intro(profile, tasks, streaks)
      setChats(prev => ({
        ...prev,
        [activeAgent]: [{ role: 'agent', content: introText }],
      }))
    }
  }, [activeAgent, agent, profile, tasks, streaks, chats])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, typing])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || typing) return
    
    setInput('')
    const userMsg = { role: 'user', content: text }
    
    // Optimistic update: add user message immediately
    setChats(prev => {
      const currentMessages = prev[activeAgent] || []
      return {
        ...prev,
        [activeAgent]: [...currentMessages, userMsg],
      }
    })

    setTyping(true)
    
    try {
      if (USE_MOCK) {
        // Mock response for demo/offline mode
        await new Promise(resolve => setTimeout(resolve, 1200))
        const mockReply = FALLBACK_RESPONSES[activeAgent]
        
        setChats(prev => {
          const currentMessages = prev[activeAgent] || []
          return {
            ...prev,
            [activeAgent]: [...currentMessages, { role: 'agent', content: mockReply }],
          }
        })
        return
      }

      // Real API call to Anthropic
      const currentChats = chats[activeAgent] || []
      const history = currentChats.map(m => ({
        role: m.role === 'agent' ? 'assistant' : 'user',
        content: m.content,
      }))

      const systemPrompt = AGENT_SYSTEM_PROMPTS[activeAgent]?.(profile, tasks) || ''

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          system: systemPrompt,
          messages: [...history, { role: 'user', content: text }],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const replyText = data.content?.[0]?.text || FALLBACK_RESPONSES[activeAgent]

      setChats(prev => {
        const currentMessages = prev[activeAgent] || []
        return {
          ...prev,
          [activeAgent]: [...currentMessages, { role: 'agent', content: replyText }],
        }
      })
    } catch (err) {
      console.error('Agent API error:', err)
      // Fallback to offline response
      setChats(prev => {
        const currentMessages = prev[activeAgent] || []
        return {
          ...prev,
          [activeAgent]: [...currentMessages, { role: 'agent', content: FALLBACK_RESPONSES[activeAgent] }],
        }
      })
    } finally {
      setTyping(false)
    }
  }, [input, typing, activeAgent, chats, profile, tasks, USE_MOCK])

  const messages = chats[activeAgent] || []

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f8fafc' }}>
      {/* Agent list sidebar */}
      <div style={{
        width: 220, borderRight: '1px solid #f1f5f9',
        background: '#ffffff', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px',
      }}>
        <p style={{ 
          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', 
          color: '#94a3b8', marginBottom: 12, paddingLeft: 4, textTransform: 'uppercase' 
        }}>
          Agents
        </p>
        {AGENTS.map(a => (
          <button
            key={a.id}
            onClick={() => setActiveAgent(a.id)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10,
              border: 'none', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', transition: 'all 0.15s ease',
              background: activeAgent === a.id ? a.bg : 'transparent',
              marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10,
            }}
            onMouseEnter={(e) => {
              if (activeAgent !== a.id) {
                e.currentTarget.style.background = `${a.bg}80`
              }
            }}
            onMouseLeave={(e) => {
              if (activeAgent !== a.id) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: a.bg,
              border: `1px solid ${a.color}40`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: a.color, flexShrink: 0,
            }}>
              {a.icon}
            </div>
            <div>
              <p style={{ 
                fontSize: 12.5, fontWeight: 500, 
                color: activeAgent === a.id ? '#0f172a' : '#475569', 
                margin: 0, lineHeight: 1.3 
              }}>
                {a.name}
              </p>
              <p style={{ fontSize: 10.5, color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>{a.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Chat panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Chat header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
          background: '#ffffff', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: agent.bg,
            border: `1px solid ${agent.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: agent.color, flexShrink: 0,
          }}>
            {agent.icon}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{agent.name} Agent</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{agent.sub}</p>
          </div>
        </div>

        {/* Messages area */}
        <div style={{ 
          flex: 1, overflowY: 'auto', padding: '20px 24px', 
          display: 'flex', flexDirection: 'column', gap: 14 
        }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                {msg.role === 'agent' && (
                  <div style={{
                    width: 26, height: 26, borderRadius: 6, background: agent.bg,
                    border: `1px solid ${agent.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: agent.color, flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {agent.icon}
                  </div>
                )}
                <div style={{
                  maxWidth: '72%',
                  padding: '10px 14px', 
                  borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '3px 12px 12px 12px',
                  background: msg.role === 'user' ? '#14b8a6' : '#ffffff',
                  color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                  fontSize: 13.5, lineHeight: 1.6,
                  border: msg.role === 'agent' ? '1px solid #f1f5f9' : 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  wordWrap: 'break-word',
                }}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 6, background: agent.bg,
                border: `1px solid ${agent.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: agent.color, flexShrink: 0,
              }}>
                {agent.icon}
              </div>
              <div style={{
                padding: '10px 14px', borderRadius: '3px 12px 12px 12px',
                background: '#ffffff', border: '1px solid #f1f5f9',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i} 
                    style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#94a3b8',
                    }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.2, 
                      ease: 'easeInOut',
                      delay: i * 0.2 
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#ffffff',
          display: 'flex', gap: 10, alignItems: 'flex-end',
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Ask the ${agent.name} agent…`}
            rows={1}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', fontSize: 13.5,
              color: '#0f172a', fontFamily: 'inherit', outline: 'none',
              background: '#f8fafc', transition: 'border-color 0.15s ease',
              resize: 'none', minHeight: 40, maxHeight: 120,
            }}
            onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            style={{
              width: 40, height: 40, borderRadius: 10, border: 'none',
              background: input.trim() && !typing ? '#14b8a6' : '#e2e8f0',
              color: input.trim() && !typing ? '#fff' : '#94a3b8',
              cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !typing) {
                e.currentTarget.style.background = '#0d9488'
                e.currentTarget.style.transform = 'scale(1.05)'
              }
            }}
            onMouseLeave={(e) => {
              if (input.trim() && !typing) {
                e.currentTarget.style.background = '#14b8a6'
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}