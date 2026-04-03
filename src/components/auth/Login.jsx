import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { validate, friendlyAuthError, passwordStrength } from '../../utils/validation'

export default function Login({ onSwitchToRegister, onForgotPassword }) {
  const { login, loginGoogle } = useAuth()
  const navigate = useNavigate()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [errors,    setErrors]    = useState({})
  const [serverErr, setServerErr] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [gLoading,  setGLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setServerErr('')
    const errs = {}
    const emailErr = validate.email(email)
    if (emailErr) errs.email = emailErr
    if (!password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerErr(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGLoading(true)
    setServerErr('')
    try {
      await loginGoogle()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerErr(friendlyAuthError(err))
    } finally {
      setGLoading(false)
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%', background: '#f7f6f3',
    border: `1.5px solid ${hasError ? '#dc2626' : '#e5e7eb'}`,
    borderRadius: 10, color: '#1a1a18',
    padding: '10px 14px', fontSize: 14,
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.15s',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={{
        fontFamily: 'Fraunces, Georgia, serif',
        fontSize: 24, fontWeight: 300,
        letterSpacing: '-0.03em', color: '#1a1a18',
        marginBottom: 6,
      }}>
        Welcome back
      </h2>
      <p style={{ fontSize: 13, color: '#6b6860', marginBottom: 28 }}>
        Sign in to continue your streak.
      </p>

      {serverErr && (
        <div style={{
          marginBottom: 16, padding: '10px 14px',
          background: '#fef2f2', border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 10, fontSize: 13, color: '#dc2626',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span>⚠</span><span>{serverErr}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Email */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: '#6b6860', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Email
          </label>
          <input
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors({}); setServerErr('') }}
            style={inputStyle(errors.email)}
            autoComplete="email"
            autoFocus
          />
          {errors.email && <p style={{ fontSize: 11.5, color: '#dc2626', marginTop: 4 }}>⚠ {errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: '#6b6860', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors({}); setServerErr('') }}
              style={{ ...inputStyle(errors.password), paddingRight: 40 }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', color: '#a8a69f',
                fontSize: 14, padding: 2,
              }}
            >
              {showPw ? '◎' : '◉'}
            </button>
          </div>
          {errors.password && <p style={{ fontSize: 11.5, color: '#dc2626', marginTop: 4 }}>⚠ {errors.password}</p>}
        </div>

        {/* Forgot password */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
          <button
            type="button"
            onClick={onForgotPassword}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#0d9488', fontFamily: 'inherit' }}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '11px', borderRadius: 10,
            background: loading ? '#5eead4' : '#0d9488',
            border: 'none', color: 'white', fontSize: 14,
            fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.15s',
          }}
        >
          {loading
            ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Signing in…</>
            : 'Sign in'
          }
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
        <span style={{ fontSize: 12, color: '#a8a69f' }}>or</span>
        <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={gLoading}
        style={{
          width: '100%', padding: '10px', borderRadius: 10,
          background: '#ffffff', border: '1.5px solid #e5e7eb',
          color: '#1a1a18', fontSize: 14, fontWeight: 500,
          cursor: gLoading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'border-color 0.15s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {gLoading ? 'Signing in…' : 'Continue with Google'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#6b6860', marginTop: 20 }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d9488', fontWeight: 500, fontFamily: 'inherit', fontSize: 13 }}
        >
          Create one
        </button>
      </p>
    </motion.div>
  )
}