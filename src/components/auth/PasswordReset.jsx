import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { validate, friendlyAuthError } from '../../utils/validation'
import Input  from '../ui/Input'
import Button from '../ui/Button'

export default function PasswordReset({ onBack }) {
  const { sendReset } = useAuth()
  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const err = validate.email(email)
    if (err) { setError(err); return }
    setLoading(true)
    setError('')
    try {
      await sendReset(email)
      setSuccess(true)
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-ink-sub hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to sign in
      </button>

      <h2 className="font-display text-2xl font-light tracking-tight text-ink mb-1">
        Reset your password
      </h2>
      <p className="text-sm text-ink-sub mb-7">
        Enter your email and we'll send a reset link.
      </p>

      {success ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          ✓ Reset link sent to <strong>{email}</strong>. Check your inbox (and spam).
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            error={error}
            autoFocus
          />
          <Button type="button" size="full" loading={loading} onClick={handleSubmit}>
            Send reset link
          </Button>
        </form>
      )}
    </motion.div>
  )
}
