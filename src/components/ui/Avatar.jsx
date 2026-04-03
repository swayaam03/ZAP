export default function Avatar({ profile, size = 36, className = '' }) {
  const initials = profile?.displayName
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  const fontSize = Math.round(size * 0.36)

  return (
    <div
      className={`rounded-full flex-shrink-0 overflow-hidden bg-brand-100 border border-brand-200 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {profile?.photoURL ? (
        <img
          src={profile.photoURL}
          alt={profile.displayName || 'Avatar'}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          className="font-semibold text-brand-700 select-none"
          style={{ fontSize }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}
