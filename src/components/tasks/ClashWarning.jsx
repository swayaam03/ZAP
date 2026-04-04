// FILE: src/components/tasks/ClashWarning.jsx
// QUESTMIND INTEGRATION: Click-only toggle (no hover conflicts)
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, X, Sparkles } from 'lucide-react'

const SEVERITY_CONFIG = {
    high: {
        icon: AlertTriangle,
        color: '#ef4444',
        bg: '#fef2f2',
        border: '#fecaca',
        label: 'Conflict',
    },
    medium: {
        icon: AlertCircle,
        color: '#f59e0b',
        bg: '#fffbeb',
        border: '#fde68a',
        label: 'Warning',
    },
}

export default function ClashWarning({ clash, suggestion, onApply }) {
    const [showTooltip, setShowTooltip] = useState(false)
    const tooltipRef = useRef(null)

    if (!clash) return null

    const config = SEVERITY_CONFIG[clash.severity] || SEVERITY_CONFIG.medium
    const Icon = config.icon

    // Close tooltip when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setShowTooltip(false)
            }
        }
        if (showTooltip) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showTooltip])

    return (
        <div ref={tooltipRef} style={{ position: 'relative', display: 'inline-block' }}>
            {/* Badge - CLICK to toggle */}
            <button
                onClick={() => setShowTooltip(!showTooltip)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 600,
                    background: config.bg,
                    color: config.color,
                    border: `1px solid ${config.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                }}
            >
                <Icon size={10} />
                {config.label}
            </button>

            {/* Tooltip - stays open until you click outside or X */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            zIndex: 50,
                            minWidth: 280,
                            maxWidth: 320,
                            background: '#ffffff',
                            borderRadius: 12,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                            border: `1px solid ${config.border}`,
                            padding: 12,
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon size={16} color={config.color} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                                    {config.label} Detected
                                </span>
                            </div>
                            <button
                                onClick={() => setShowTooltip(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Message */}
                        <p style={{ fontSize: 12, color: '#475569', marginBottom: 10, lineHeight: 1.4 }}>
                            {clash.message}
                        </p>

                        {/* Suggestion */}
                        {suggestion && suggestion.type !== 'manual_review' && (
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                                    <Sparkles size={12} color="#14b8a6" />
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#14b8a6' }}>
                                        Suggested Fix:
                                    </span>
                                </div>
                                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                                    {suggestion.message}
                                </p>
                                {suggestion.reason && (
                                    <p style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic', marginBottom: 8 }}>
                                        {suggestion.reason}
                                    </p>
                                )}
                                {onApply && (
                                    <button
                                        onClick={() => {
                                            onApply(suggestion)
                                            setShowTooltip(false)
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            borderRadius: 7,
                                            border: 'none',
                                            background: '#14b8a6',
                                            color: '#fff',
                                            fontSize: 11,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#0d9488'}
                                        onMouseLeave={(e) => e.target.style.background = '#14b8a6'}
                                    >
                                        Apply Fix
                                    </button>
                                )}
                            </div>
                        )}

                        {suggestion?.type === 'manual_review' && (
                            <p style={{ fontSize: 11, color: '#ef4444', background: '#fef2f2', padding: 6, borderRadius: 6 }}>
                                ⚠ {suggestion.message}
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}