import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  size      = 'md',
  showClose = true,
  className = '',
}) {
  const sizes = {
    sm:  'max-w-sm',
    md:  'max-w-lg',
    lg:  'max-w-2xl',
    xl:  'max-w-4xl',
    full:'max-w-screen-lg',
  }

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={`
              relative z-10 w-full bg-white rounded-2xl shadow-modal
              max-h-[90vh] overflow-hidden flex flex-col
              ${sizes[size]} ${className}
            `}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                {title && <h2 className="font-semibold text-ink">{title}</h2>}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1 rounded-lg text-ink-dim hover:text-ink hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}