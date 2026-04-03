import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react'
import { useTasks } from '../../hooks/useTasks'
import Card      from '../ui/Card'
import Button    from '../ui/Button'
import Badge     from '../ui/Badge'
import TaskModal from './TaskModal'
import TaskFilters from './TaskFilters'

export default function TaskList() {
  const [filters, setFilters] = useState({ category: 'all', status: 'all' })
  const { tasks, loading, finishTask, removeTask } = useTasks(filters)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask,  setEditTask]  = useState(null)

  const handleEdit = (task) => {
    setEditTask(task)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditTask(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl font-light text-ink">Tasks</h2>
        <Button size="sm" onClick={() => setModalOpen(true)} icon={<Plus size={13} />}>
          New task
        </Button>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="space-y-2 mt-4">
          {[1,2,3,4].map(i => <div key={i} className="h-16 skeleton rounded-2xl" />)}
        </div>
      ) : tasks.length === 0 ? (
        <Card padding="lg" className="text-center mt-4">
          <p className="text-sm text-ink-sub">No tasks found. Try adjusting filters or add a new task.</p>
        </Card>
      ) : (
        <div className="space-y-2 mt-4">
          <AnimatePresence>
            {tasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  padding="md"
                  className={`flex items-start gap-3 priority-${task.priority} ${task.completed ? 'opacity-60' : ''}`}
                >
                  <button
                    onClick={() => finishTask(task.id, task.category)}
                    disabled={task.completed}
                    className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-brand-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {task.completed
                      ? <CheckCircle2 size={18} className="text-brand-500" />
                      : <Circle size={18} />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.completed ? 'line-through text-ink-dim' : 'text-ink'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-ink-dim mt-0.5 truncate">{task.description}</p>
                    )}
                    <div className="flex gap-1.5 mt-1.5">
                      <Badge variant={task.category}>{task.category}</Badge>
                      <Badge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'default'}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!task.completed && (
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1.5 rounded-lg text-ink-dim hover:text-ink hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => removeTask(task.id)}
                      className="p-1.5 rounded-lg text-ink-dim hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskModal open={modalOpen} onClose={handleClose} task={editTask} />
    </div>
  )
}
