import { useState } from 'react'
import { updateEmail, reauthenticateWithCredential, EmailAuthProvider, sendEmailVerification } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { validate } from '../../utils/validation'
import { Check, Mail, AlertCircle, X } from 'lucide-react'

// Format phone as user types
function formatPhone(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3)  return digits
  if (digits.length <= 6)  return `(${digits.slice(0,3)}) ${digits.slice(3)}`
  if (digits.length <= 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  return `+${digits.slice(0,1)} (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7,11)}`
}

function EmailChangeModal({ currentEmail, onClose, onSuccess }) {
  const [password,  setPassword]  = useState('')
  const [newEmail,  setNewEmail]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async () => {
    if (!password) { setError('Current password is required'); return }
    const emailErr = validate.email(newEmail)
    if (emailErr) { setError(emailErr); return }
    if (newEmail === currentEmail) { setError('New email must be different'); return }

    setLoading(true)
    setError('')

    try {
      const user       = auth.currentUser
      const credential = EmailAuthProvider.credential(currentEmail, password)
      await reauthenticateWithCredential(user, credential)
      await updateEmail(user, newEmail)
      await sendEmailVerification(user)
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), { email: newEmail })
      onSuccess(newEmail)
    } catch (err) {
      const msgs = {
        'auth/wrong-password':      'Incorrect password.',
        'auth/email-already-in-use':'This email is already registered to another account.',
        'auth/invalid-email':       'Please enter a valid email address.',
        'auth/requires-recent-login':'Please sign out and sign back in before changing your email.',
        'auth/too-many-requests':   'Too many attempts. Please wait a few minutes.',
      }
      setError(msgs[err.code] || err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width:'100%', padding:'9px 12px', borderRadius:9,
    border:'1.5px solid #e2e8f0', fontSize:13.5, color:'#0f172a',
    fontFamily:'inherit', outline:'none', background:'#f8fafc',
    boxSizing:'border-box',
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.3)', backdropFilter:'blur(3px)' }} onClick={onClose} />
      <div style={{
        position:'relative', zIndex:10, background:'#ffffff',
        borderRadius:16, padding:'24px', maxWidth:400, width:'100%',
        boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
          <X size={15} />
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'#f0fdfa', border:'1px solid #99f6e4', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Mail size={16} color="#14b8a6" />
          </div>
          <div>
            <h3 style={{ fontSize:15, fontWeight:600, color:'#0f172a', margin:0 }}>Change email address</h3>
            <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>Requires your current password</p>
          </div>
        </div>

        {error && (
          <div style={{ padding:'10px 12px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:9, fontSize:13, color:'#dc2626', marginBottom:14, display:'flex', gap:8 }}>
            <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }} /> {error}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:'#94a3b8', marginBottom:5 }}>
              CURRENT PASSWORD
            </label>
            <input
              type="password"
              style={inp}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="Your current password"
              autoFocus
              onFocus={e => e.target.style.borderColor = '#14b8a6'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:'#94a3b8', marginBottom:5 }}>
              NEW EMAIL ADDRESS
            </label>
            <input
              type="email"
              style={inp}
              value={newEmail}
              onChange={e => { setNewEmail(e.target.value); setError('') }}
              placeholder="new@example.com"
              onFocus={e => e.target.style.borderColor = '#14b8a6'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ display:'flex', gap:10, paddingTop:4 }}>
            <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:9, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex:1, padding:'10px', borderRadius:9, border:'none',
                background: loading ? '#5eead4' : '#14b8a6',
                color:'#fff', fontSize:13, fontWeight:500,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              }}
            >
              {loading
                ? <><div style={{ width:12, height:12, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Updating…</>
                : 'Update email'
              }
            </button>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}

export default function AccountTab({ onClose }) {
  const { profile, updateProfile } = useAuth()

  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    phoneNumber: profile?.phoneNumber || '',
    bio:         profile?.bio         || '',
  })
  const [errors,    setErrors]    = useState({})
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [emailModal, setEmailModal] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState('')

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })) }

  const handlePhoneChange = (e) => {
    const raw     = e.target.value.replace(/\D/g, '').slice(0, 11)
    const display = formatPhone(raw)
    set('phoneNumber', display)
  }

  const handlePhoneBlur = () => {
    const digits = form.phoneNumber.replace(/\D/g, '')
    if (digits.length > 0 && digits.length < 7) {
      setErrors(e => ({ ...e, phoneNumber: 'Enter a valid phone number' }))
    }
  }

  const handleSave = async () => {
    const errs = {}
    const nm = validate.displayName(form.displayName); if (nm) errs.displayName = nm
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setSuccess(false)
    try {
      await updateProfile({
        displayName: form.displayName.trim(),
        phoneNumber: form.phoneNumber,
        bio:         form.bio.trim(),
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setErrors({ displayName: err.message })
    } finally {
      setLoading(false)
    }
  }

  const inp = (hasErr) => ({
    width:'100%', padding:'9px 12px', borderRadius:9,
    border:`1.5px solid ${hasErr ? '#dc2626' : '#e2e8f0'}`,
    fontSize:13.5, color:'#0f172a', fontFamily:'inherit',
    outline:'none', background: hasErr ? '#fef9f9' : '#f8fafc',
    boxSizing:'border-box', transition:'border-color 0.15s',
  })

  const label = { display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:'#94a3b8', marginBottom:5 }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {success && (
        <div style={{ padding:'10px 14px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, fontSize:13, color:'#15803d', display:'flex', alignItems:'center', gap:8 }}>
          <Check size={14} /> Profile updated successfully.
        </div>
      )}

      {emailSuccess && (
        <div style={{ padding:'12px 14px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, fontSize:13, color:'#1d4ed8', lineHeight:1.6 }}>
          <strong>Email updated to {emailSuccess}</strong><br />
          A verification link has been sent. Please check your inbox.
        </div>
      )}

      {/* Display name */}
      <div>
        <label style={label}>FULL NAME</label>
        <input
          style={inp(errors.displayName)}
          value={form.displayName}
          onChange={e => set('displayName', e.target.value)}
          placeholder="Your name"
          onFocus={e => e.target.style.borderColor = '#14b8a6'}
          onBlur={e => e.target.style.borderColor = errors.displayName ? '#dc2626' : '#e2e8f0'}
        />
        {errors.displayName && <p style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>⚠ {errors.displayName}</p>}
      </div>

      {/* Email — read only with change button */}
      <div>
        <label style={label}>EMAIL ADDRESS</label>
        <div style={{ display:'flex', gap:8 }}>
          <input
            style={{ ...inp(false), flex:1, color:'#64748b', cursor:'not-allowed' }}
            value={profile?.email || ''}
            disabled
            readOnly
          />
          <button
            onClick={() => setEmailModal(true)}
            style={{
              padding:'9px 14px', borderRadius:9, border:'1.5px solid #e2e8f0',
              background:'#f8fafc', color:'#475569', fontSize:12, fontWeight:500,
              cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
              transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#14b8a6'; e.currentTarget.style.color = '#0d9488' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569' }}
          >
            Change
          </button>
        </div>
        <p style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>
          Changing email requires your current password and email verification.
        </p>
      </div>

      {/* Phone */}
      <div>
        <label style={label}>PHONE NUMBER <span style={{ fontWeight:400, textTransform:'none' }}>(optional)</span></label>
        <input
          type="tel"
          style={inp(errors.phoneNumber)}
          value={form.phoneNumber}
          onChange={handlePhoneChange}
          onBlur={handlePhoneBlur}
          placeholder="(123) 456-7890"
          inputMode="numeric"
          pattern="[0-9\s\+\-\(\)]*"
        />
        {errors.phoneNumber && <p style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>⚠ {errors.phoneNumber}</p>}
        <p style={{ fontSize:11, color:'#94a3b8', marginTop:3 }}>Used for account recovery only.</p>
      </div>

      {/* Bio */}
      <div>
        <label style={label}>BIO <span style={{ fontWeight:400, textTransform:'none' }}>(optional)</span></label>
        <textarea
          style={{
            ...inp(false), resize:'none', minHeight:64,
            lineHeight:1.5, fontFamily:'inherit',
          }}
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
          placeholder="A short bio..."
          maxLength={200}
          onFocus={e => e.target.style.borderColor = '#14b8a6'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <p style={{ fontSize:11, color:'#94a3b8', textAlign:'right', marginTop:2 }}>
          {form.bio.length}/200
        </p>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:10, paddingTop:4 }}>
        <button
          onClick={onClose}
          style={{
            flex:1, padding:'10px', borderRadius:9,
            border:'1.5px solid #e2e8f0', background:'#f8fafc',
            color:'#64748b', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            flex:1, padding:'10px', borderRadius:9,
            border:'none', background: loading ? '#5eead4' : '#14b8a6',
            color:'#fff', fontSize:13, fontWeight:500,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}
        >
          {loading
            ? <><div style={{ width:12, height:12, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Saving…</>
            : <><Check size={13} /> Save changes</>
          }
        </button>
      </div>

      {/* Email change modal */}
      {emailModal && (
        <EmailChangeModal
          currentEmail={profile?.email || ''}
          onClose={() => setEmailModal(false)}
          onSuccess={(newEmail) => {
            setEmailModal(false)
            setEmailSuccess(newEmail)
          }}
        />
      )}

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  )
}