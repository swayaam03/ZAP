import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  getUserTasks, createTask, updateTask,
  deleteTask, completeTask, uncompleteTask,
} from '../services/taskService'

export function useTasks(filters = {}) {
  const { user } = useAuth()
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!user?.uid) { setTasks([]); setLoading(false); return }
    setLoading(true)
    const unsub = getUserTasks(
      user.uid, filters,
      (data) => { setTasks(data); setLoading(false) },
      (err)  => { setError(err.message); setLoading(false) }
    )
    return () => unsub?.()
  }, [user?.uid, filters.focusArea, filters.status])

  const addTask    = useCallback(async (data)    => { if (!user?.uid) return; await createTask(user.uid, data) }, [user?.uid])
  const editTask   = useCallback(async (id, upd) => { if (!user?.uid) return; await updateTask(user.uid, id, upd) }, [user?.uid])
  const removeTask = useCallback(async (id)      => { if (!user?.uid) return; await deleteTask(user.uid, id) }, [user?.uid])
  const finishTask = useCallback(async (id)      => { if (!user?.uid) return 0; return completeTask(user.uid, id) }, [user?.uid])
  const undoTask   = useCallback(async (id)      => { if (!user?.uid) return; await uncompleteTask(user.uid, id) }, [user?.uid])

  return { tasks, loading, error, addTask, editTask, removeTask, finishTask, undoTask }
}
