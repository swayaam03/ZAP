import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

const CATEGORIES = ['work','health','learning','relationships','personal']

export default function GoalsTab() {
  const { profile, updateProfile } = useAuth()
  const goals = profile?.goals || {}

  const [form, setForm] = useState({
    dailyTaskTarget:  goals.dailyTaskTarget  || 5,
    weeklyXpGoal:     goals.weeklyXpGoal     || 500,
    focusCategories:  goals.focusCategories  || [],
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const toggleCat = (cat) => {
    setForm(f => ({
      ...f,
      focusCategories: f.focusCategories.includes(cat)
        ? f.focusCategories.filter(c => c !== cat)
        : [...f.focusCategories, cat]
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile({ goals: form })
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
          ✓ Goals saved.
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-ink-sub uppercase tracking-wide mb-2 block">
          Daily task target
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range" min={1} max={20} value={form.dailyTaskTarget}
            onChange={e => setForm(f => ({ ...f, dailyTaskTarget: +e.target.value }))}
            className="flex-1 accent-brand-600"
          />
          <span className="text-sm font-medium text-ink w-6 text-center">
            {form.dailyTaskTarget}
          </span>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-ink-sub uppercase tracking-wide mb-2 block">
          Weekly XP goal
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range" min={100} max={2000} step={50} value={form.weeklyXpGoal}
            onChange={e => setForm(f => ({ ...f, weeklyXpGoal: +e.target.value }))}
            className="flex-1 accent-brand-600"
          />
          <span className="text-sm font-medium text-ink w-12 text-center">
            {form.weeklyXpGoal}
          </span>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-ink-sub uppercase tracking-wide mb-2 block">
          Focus categories
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCat(cat)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium border capitalize transition-all
                ${form.focusCategories.includes(cat)
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-ink-sub hover:border-gray-300'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Button size="md" loading={loading} onClick={handleSave}>
        Save goals
      </Button>
    </div>
  )
}
