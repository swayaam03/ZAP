import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  hover     = false,
  padding   = 'md',
  onClick,
  ...props
}) {
  const paddings = { sm: 'p-3', md: 'p-4', lg: 'p-6', none: '' }

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -1, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } : {}}
      className={`
        bg-white border border-gray-100 rounded-2xl shadow-card
        ${paddings[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
