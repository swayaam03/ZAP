// FILE: src/components/auth/Register.jsx
// ACTION: Replace Entire
// QUESTMIND INTEGRATION: Adds student profile fields + saves via useStudentProfile hook

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useStudentProfile } from '../../hooks/useStudentProfile'
import { validate, friendlyAuthError, passwordStrength } from '../../utils/validation'

export default function Register({ onSwitchToLogin }) {
  const { register, loginGoogle } = useAuth()
  const { updateProfile: updateStudentProfile } = useStudentProfile()
  const navigate = useNavigate()

  const [form, setForm] = useState({ 
    displayName: '', 
    email: '', 
    password: '', 
    confirmPw: '',
    // ZAP student fields
    school: '',
    major: '',
    year: 'freshman',
    expectedGraduation: '',
  })
  const [errors,    setErrors]    = useState({})
  const [serverErr, setServerErr] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [gLoading,  setGLoading]  = useState(false)
  const [agreed,    setAgreed]    = useState(false)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: null }))
    setServerErr('')
  }

  const strength = passwordStrength(form.password)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setServerErr('')
    
    // Validate existing fields
    const errs = {}
    const nm = validate.displayName(form.displayName); if (nm) errs.displayName = nm
    const em = validate.email(form.email);             if (em) errs.email = em
    const pw = validate.password(form.password);       if (pw) errs.password = pw
    const cp = validate.confirmPassword(form.confirmPw, form.password); if (cp) errs.confirmPw = cp
    if (!agreed) errs.terms = 'You must accept the terms to continue'
    
    // Validate ZAP student fields (optional but recommended)
    if (!form.school.trim()) errs.school = 'School is required'
    if (!form.major.trim()) errs.major = 'Major is required'
    
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      // 1. Create auth account
      const userCredential = await register({ 
        displayName: form.displayName, 
        email: form.email, 
        password: form.password 
      })
      
      // 2. Save student profile to Firestore (ZAP Block 1)
      if (userCredential?.user?.uid) {
        await updateStudentProfile({
          school: form.school.trim(),
          major: form.major.trim(),
          year: form.year,
          expectedGraduation: form.expectedGraduation,
          courseLoad: 0, // Default
          semester: '',  // Can be auto-set later
        })
      }
      
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
    boxSizing: 'border-box',
  })

  const labelStyle = {
    display: 'block', fontSize: 11.5, fontWeight: 500,
    color: '#6b6860', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={{
        fontFamily: 'Fraunces, Georgia, serif',
        fontSize: 24, fontWeight: 300,
        letterSpacing: '-0.03em', color: '#1a1a18', marginBottom: 6,
      }}>
        Create your account
      </h2>
      <p style={{ fontSize: 13, color: '#6b6860', marginBottom: 28 }}>
        Start building consistency today.
      </p>

      {serverErr && (
        <div style={{
          marginBottom: 16, padding: '10px 14px',
          background: '#fef2f2', border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 10, fontSize: 13, color: '#dc2626',
          display: 'flex', gap: 8,
        }}>
          <span>⚠</span><span>{serverErr}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Name + Email row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              placeholder="Alex Morgan"
              value={form.displayName}
              onChange={e => set('displayName', e.target.value)}
              style={inputStyle(errors.displayName)}
              autoComplete="name" autoFocus
            />
            {errors.displayName && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>⚠ {errors.displayName}</p>}
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="alex@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              style={inputStyle(errors.email)}
              autoComplete="email"
            />
            {errors.email && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>⚠ {errors.email}</p>}
          </div>
        </div>

        {/* ZAP Student Fields - NEW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
          <div>
            <label style={labelStyle}>School / University</label>
            <input
              placeholder="e.g., Stanford University"
              value={form.school}
              onChange={e => set('school', e.target.value)}
              style={inputStyle(errors.school)}
            />
            {errors.school && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>⚠ {errors.school}</p>}
          </div>
          <div>
            <label style={labelStyle}>Major / Field of Study</label>
            <input
              placeholder="e.g., Computer Science"
              value={form.major}
              onChange={e => set('major', e.target.value)}
              style={inputStyle(errors.major)}
            />
            {errors.major && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>⚠ {errors.major}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Academic Year</label>
            <select
              value={form.year}
              onChange={e => set('year', e.target.value)}
              style={inputStyle(errors.year)}
            >
              <option value="freshman">Freshman</option>
              <option value="sophomore">Sophomore</option>
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
              <option value="graduate">Graduate</option>
            </select>
            {errors.year && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>⚠ {errors.year}</p>}
          </div>
          <div>
            <label style={labelStyle}>Expected Graduation</label>
            <input
              type="month"
              value={form.expectedGraduation}
              onChange={e => set('expectedGraduation', e.target.value)}
              style={inputStyle(errors.expectedGraduation)}
            />
            {errors.expectedGraduation && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>⚠ {errors.expectedGraduation}</p>}
          </div>
        </div>
        {/* END ZAP Student Fields */}

        {/* Password */}
        <div>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              style={{ ...inputStyle(errors.password), paddingRight: 40 }}
              autoComplete="new-password"
            />
          </div>
          {form.password && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 99,
                  background: i <= strength.score ? strength.color : '#e5e7eb',
                  transition: 'background 0.3s',
                }} />
              ))}
              <span style={{ fontSize: 11, color: strength.color, marginLeft: 4 }}>{strength.label}</span>
            </div>
          )}
          {errors.password && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>⚠ {errors.password}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label style={labelStyle}>Confirm password</label>
          <input
            type="password"
            placeholder="Repeat password"
            value={form.confirmPw}
            onChange={e => set('confirmPw', e.target.value)}
            style={inputStyle(errors.confirmPw)}
            autoComplete="new-password"
          />
          {errors.confirmPw && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>⚠ {errors.confirmPw}</p>}
        </div>

        {/* Terms */}
        <div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => { setAgreed(e.target.checked); setErrors(er => ({ ...er, terms: null })) }}
              style={{ marginTop: 2, accentColor: '#0d9488' }}
            />
            <span style={{ fontSize: 13, color: '#6b6860', lineHeight: 1.5 }}>
              I agree to the{' '}
              <a href="#" style={{ color: '#0d9488' }} onClick={e => e.stopPropagation()}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: '#0d9488' }} onClick={e => e.stopPropagation()}>Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>⚠ {errors.terms}</p>}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '11px', borderRadius: 10,
            background: loading ? '#5eead4' : '#0d9488',
            border: 'none', color: 'white', fontSize: 14, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading
            ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating account…</>
            : 'Create account'
          }
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
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
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
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
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d9488', fontWeight: 500, fontFamily: 'inherit', fontSize: 13 }}
        >
          Sign in
        </button>
      </p>
    </motion.div>
  )
}