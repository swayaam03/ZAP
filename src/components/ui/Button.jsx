import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
  secondary: 'bg-white border border-gray-200 hover:border-brand-300 text-ink hover:text-brand-700 shadow-sm',
  ghost:     'bg-transparent hover:bg-gray-100 text-ink-sub hover:text-ink',
  danger:    'bg-white border border-red-200 hover:bg-red-50 text-red-600',
  google:    'bg-white border border-gray-200 hover:border-gray-300 text-ink shadow-sm',
}

const sizes = {
  sm:   'px-3 py-1.5 text-xs rounded-lg',
  md:   'px-4 py-2 text-sm rounded-xl',
  lg:   'px-5 py-2.5 text-sm rounded-xl',
  full: 'w-full px-4 py-2.5 text-sm rounded-xl',
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  icon,
  onClick,
  type     = 'button',
  className = '',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-colors duration-150 select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading
        ? <Loader2 size={14} className="animate-spin" />
        : icon && <span className="flex-shrink-0">{icon}</span>
      }
      {children}
    </motion.button>
  )
}
