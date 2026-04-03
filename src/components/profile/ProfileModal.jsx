import { useState } from 'react'
import Modal    from '../ui/Modal'
import Avatar   from '../ui/Avatar'
import { useAuth } from '../../hooks/useAuth'
import AccountTab     from './AccountTab'
import SecurityTab    from './SecurityTab'
import PhotoTab       from './PhotoTab'
import PreferencesTab from './PreferencesTab'
import GoalsTab       from './GoalsTab'
import StatsTab       from './StatsTab'

const TABS = [
  { id: 'account',     label: 'Account'     },
  { id: 'security',    label: 'Security'    },
  { id: 'photo',       label: 'Photo'       },
  { id: 'preferences', label: 'Preferences' },
  { id: 'goals',       label: 'Goals'       },
  { id: 'stats',       label: 'Stats'       },
]

export default function ProfileModal({ open, onClose }) {
  const { profile } = useAuth()
  const [tab, setTab] = useState('account')

  return (
    <Modal open={open} onClose={onClose} size="lg" showClose title="">
      {/* Custom header */}
      <div className="px-5 pt-4 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <Avatar profile={profile} size={40} />
          <div>
            <p className="font-semibold text-ink">{profile?.displayName}</p>
            <p className="text-xs text-ink-dim">{profile?.email}</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 border-b border-gray-100 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`
                px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${tab === t.id
                  ? 'border-brand-500 text-brand-700'
                  : 'border-transparent text-ink-sub hover:text-ink'}
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-5">
        {tab === 'account'     && <AccountTab     onClose={onClose} />}
        {tab === 'security'    && <SecurityTab    />}
        {tab === 'photo'       && <PhotoTab       />}
        {tab === 'preferences' && <PreferencesTab />}
        {tab === 'goals'       && <GoalsTab       />}
        {tab === 'stats'       && <StatsTab       />}
      </div>
    </Modal>
  )
}
