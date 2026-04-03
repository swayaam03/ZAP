const CATEGORIES = ['all','work','health','learning','relationships','personal']
const STATUSES   = ['all','active','completed']

export default function TaskFilters({ filters, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onChange(f => ({ ...f, category: cat }))}
            className={`
              px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize
              ${filters.category === cat
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-gray-200 text-ink-sub hover:border-gray-300'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="w-px bg-gray-100 mx-1 hidden sm:block" />

      {/* Status filter */}
      <div className="flex gap-1">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => onChange(f => ({ ...f, status: s }))}
            className={`
              px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize
              ${filters.status === s
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-gray-200 text-ink-sub hover:border-gray-300'}
            `}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
