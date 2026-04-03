const variants = {
  default:   'bg-gray-100 text-gray-700',
  brand:     'bg-brand-100 text-brand-700',
  success:   'bg-green-100 text-green-700',
  warning:   'bg-amber-100 text-amber-700',
  danger:    'bg-red-100 text-red-700',
  purple:    'bg-purple-100 text-purple-700',
  work:      'bg-blue-100 text-blue-700',
  health:    'bg-green-100 text-green-700',
  learning:  'bg-purple-100 text-purple-700',
  relationships: 'bg-pink-100 text-pink-700',
  personal:  'bg-gray-100 text-gray-700',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full
      text-xs font-medium whitespace-nowrap
      ${variants[variant] || variants.default} ${className}
    `}>
      {children}
    </span>
  )
}
