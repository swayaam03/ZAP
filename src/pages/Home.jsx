import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Flame, BarChart2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-alt flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-600" />
          <span className="font-display text-lg font-medium text-ink tracking-tight">ZAP</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm text-ink-sub hover:text-ink transition-colors">Sign in</Link>
          <Link
            to="/auth"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium mb-6">
            <Zap size={12} />  Habit Intelligence For Students.
          </div>

          <h1 className="font-display text-5xl font-light tracking-tight text-ink leading-tight mb-4">
            Break the loop.<br />
            <em>Create the future.</em>
          </h1>

          <p className="text-lg text-ink-sub font-light mb-10 leading-relaxed">
            ZAP turns your daily tasks into measurable progress. Prevent clashes, optimize your schedule, and unlock your potential with AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors text-sm"
            >
              Start for free <ArrowRight size={15} />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 text-ink font-medium rounded-xl transition-colors text-sm"
            >
              Sign in
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { icon: <Flame size={16} className="text-orange-500" />, label: 'Streak system', desc: 'Per-category + ice protection' },
              { icon: <Zap size={16} className="text-brand-500" />,    label: 'XP & Levels',  desc: '100 levels, adaptive scoring' },
              { icon: <BarChart2 size={16} className="text-purple-500" />, label: 'AI Insights', desc: 'Pattern analysis & nudges' },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white border border-gray-100 rounded-2xl p-4 text-left shadow-card"
              >
                <div className="mb-2">{f.icon}</div>
                <p className="text-sm font-medium text-ink mb-0.5">{f.label}</p>
                <p className="text-xs text-ink-dim">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="text-center py-6 text-xs text-ink-dim border-t border-gray-100">
        ZAP · St. Francis Institute of Technology 
      </footer>
    </div>
  )
}
