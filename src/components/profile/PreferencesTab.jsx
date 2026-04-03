import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

export default function PreferencesTab() {
  const { profile, updateProfile } = useAuth()
  const prefs   = profile?.preferences || {}

  const [form, setForm] = useState({
    theme:         prefs.theme         || 'light',
    emailNotifs:   prefs.notifications?.email  ?? true,
    pushNotifs:    prefs.notifications?.push   ?? false,
    weekStartsOn:  prefs.weekStartsOn  || 'monday',
    timezone:      prefs.timezone      || Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile({
        preferences: {
          theme: form.theme,
          notifications: { email: form.emailNotifs, push: form.pushNotifs },
          weekStartsOn: form.weekStartsOn,
          timezone: form.timezone,
        }
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          ✓ Preferences saved.
        </div>
      )}

      {/* Theme */}
      <div>
        <label className="text-xs font-medium text-ink-sub uppercase tracking-wide mb-2 block">
          Theme
        </label>
        <div className="flex gap-2">
          {['light','dark'].map(t => (
            <button
              key={t}
              onClick={() => set('theme', t)}
              className={`
                flex-1 py-2 rounded-xl text-sm border-2 capitalize transition-all
                ${form.theme === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 text-ink-sub'}
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <label className="text-xs font-medium text-ink-sub uppercase tracking-wide mb-2 block">
          Notifications
        </label>
        <div className="space-y-2">
          {[
            { key: 'emailNotifs', label: 'Email notifications' },
            { key: 'pushNotifs',  label: 'Push notifications'  },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={e => set(key, e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-ink">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Week starts on */}
      <div>
        <label className="text-xs font-medium text-ink-sub uppercase tracking-wide mb-2 block">
          Week starts on
        </label>
        <div className="flex gap-2">
          {['monday','sunday'].map(d => (
            <button
              key={d}
              onClick={() => set('weekStartsOn', d)}
              className={`
                flex-1 py-2 rounded-xl text-sm border-2 capitalize transition-all
                ${form.weekStartsOn === d ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 text-ink-sub'}
              `}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <Button size="md" loading={loading} onClick={handleSave} className="mt-1">
        Save preferences
      </Button>
    </div>
  )
}
