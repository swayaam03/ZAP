import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { validate } from '../../utils/validation'
import Input  from '../ui/Input'
import Button from '../ui/Button'

export default function AccountTab({ onClose }) {
  const { profile, updateProfile } = useAuth()
  const [form, setForm] = useState({
    displayName:  profile?.displayName  || '',
    email:        profile?.email        || '',
    phoneNumber:  profile?.phoneNumber  || '',
    bio:          profile?.bio          || '',
  })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    const errs = {}
    const nm = validate.displayName(form.displayName); if (nm) errs.displayName = nm
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setSuccess(false)
    try {
      await updateProfile({
        displayName: form.displayName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        bio:         form.bio.trim(),
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setErrors({ displayName: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          ✓ Profile updated successfully.
        </div>
      )}

      <Input
        label="Full name"
        value={form.displayName}
        onChange={e => set('displayName', e.target.value)}
        error={errors.displayName}
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        disabled
        hint="Email changes require re-authentication. Use the Security tab."
      />
      <Input
        label="Phone number"
        type="tel"
        optional
        value={form.phoneNumber}
        onChange={e => set('phoneNumber', e.target.value)}
        placeholder="+1 555 000 0000"
      />
      <div>
        <label className="text-xs font-medium text-ink-sub uppercase tracking-wide mb-1.5 block">
          Bio <span className="normal-case font-normal text-ink-dim">(optional)</span>
        </label>
        <textarea
          className="w-full bg-surface-alt border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-dim outline-none resize-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
          rows={2}
          placeholder="A short bio..."
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="secondary" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button size="md" loading={loading} onClick={handleSave} className="flex-1">Save changes</Button>
      </div>
    </div>
  )
}
