import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  label,
  error,
  hint,
  optional    = false,
  type        = 'text',
  className   = '',
  wrapClass   = '',
  ...props
}) {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={`flex flex-col gap-1 ${wrapClass}`}>
      {label && (
        <label className="text-xs font-medium text-ink-sub uppercase tracking-wide">
          {label}
          {optional && <span className="ml-1 text-ink-dim normal-case font-normal">(optional)</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword ? (showPw ? 'text' : 'password') : type}
          className={`
            w-full bg-surface-alt border rounded-xl px-3.5 py-2.5 text-sm text-ink
            placeholder:text-ink-dim outline-none transition-all duration-150
            focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}
            ${isPassword ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink-sub transition-colors"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-xs text-ink-dim">{hint}</p>
      )}
    </div>
  )
}
