import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { validate, friendlyAuthError } from '../../utils/validation'
import Input  from '../ui/Input'
import Button from '../ui/Button'

export default function SecurityTab() {
  const { changePassword, deleteAccount } = useAuth()

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [delLoading, setDelLoading] = useState(false)
  const [delError, setDelError] = useState('')

  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }))

  const handleChangePassword = async () => {
    const errs = {}
    if (!pwForm.current) errs.current = 'Current password required'
    const pwErr = validate.password(pwForm.newPw); if (pwErr) errs.newPw = pwErr
    const cpErr = validate.confirmPassword(pwForm.confirm, pwForm.newPw); if (cpErr) errs.confirm = cpErr
    if (Object.keys(errs).length) { setPwErrors(errs); return }

    setPwLoading(true)
    try {
      await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw })
      setPwForm({ current: '', newPw: '', confirm: '' })
      setPwSuccess(true)
      setTimeout(() => setPwSuccess(false), 2500)
    } catch (err) {
      setPwErrors({ current: friendlyAuthError(err) })
    } finally {
      setPwLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) { setDelError('Enter your password to confirm.'); return }
    setDelLoading(true)
    try {
      await deleteAccount(deleteConfirm)
    } catch (err) {
      setDelError(friendlyAuthError(err))
      setDelLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Change password */}
      <div>
        <h3 className="text-sm font-semibold text-ink mb-3">Change password</h3>
        {pwSuccess && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            ✓ Password changed successfully.
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Input label="Current password" type="password" value={pwForm.current}
            onChange={e => setPw('current', e.target.value)} error={pwErrors.current} />
          <Input label="New password" type="password" value={pwForm.newPw}
            onChange={e => setPw('newPw', e.target.value)} error={pwErrors.newPw} />
          <Input label="Confirm new password" type="password" value={pwForm.confirm}
            onChange={e => setPw('confirm', e.target.value)} error={pwErrors.confirm} />
          <Button size="md" loading={pwLoading} onClick={handleChangePassword}>
            Update password
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-red-600 mb-1">Danger zone</h3>
        <p className="text-xs text-ink-sub mb-3">
          Permanently delete your account and all data. This cannot be undone.
        </p>
        {delError && (
          <p className="text-xs text-red-500 mb-2">⚠ {delError}</p>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Enter your password to confirm"
            type="password"
            value={deleteConfirm}
            onChange={e => { setDeleteConfirm(e.target.value); setDelError('') }}
            wrapClass="flex-1"
          />
          <Button variant="danger" size="md" loading={delLoading} onClick={handleDelete}>
            Delete account
          </Button>
        </div>
      </div>
    </div>
  )
}
