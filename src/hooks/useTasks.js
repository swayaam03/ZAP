import { useState, useEffect, useCallback, useMemo } from 'react'
import { format, isToday, parseISO, getDay } from 'date-fns'
import { useAuth } from './useAuth'
import {
  getUserTasks, createTask, updateTask,
  deleteTask, completeTask, uncompleteTask,
} from '../services/taskService'

// Day index: 0=Sun, 1=Mon, ... 6=Sat
const DAY_MAP = { Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6, Sun:0 }

export function isTaskScheduledToday(task) {
  const todayStr  = format(new Date(), 'yyyy-MM-dd')
  const todayIdx  = getDay(new Date()) // 0=Sun, 1=Mon, ...
  const isWeekday = todayIdx >= 1 && todayIdx <= 5

  const { schedule, startDate } = task

  // Once: only on its start date
  if (!schedule || schedule.type === 'once') {
    return startDate === todayStr
  }

  // Check startDate hasn't passed yet
  if (startDate && startDate > todayStr) return false

  switch (schedule.type) {
    case 'daily':
      return true

    case 'weekdays':
      return isWeekday

    case 'weekly': {
      // Same weekday as startDate
      if (!startDate) return false
      const start = parseISO(startDate)
      return getDay(start) === todayIdx
    }

    case 'custom': {
      const days = schedule.days || []
      return days.some(d => DAY_MAP[d] === todayIdx)
    }

    default:
      return startDate === todayStr
  }
}

export function useTasks(filters = {}) {
  const { user } = useAuth()
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!user?.uid) { setTasks([]); setLoading(false); return }
    setLoading(true)
    const unsub = getUserTasks(
      user.uid,
      {},  // fetch all, filter client-side
      (data) => { setTasks(data); setLoading(false) },
      (err)  => { setError(err.message); setLoading(false) }
    )
    return () => unsub?.()
  }, [user?.uid])

  // Today's tasks — scheduled for today
  const todayTasks = useMemo(() =>
    tasks.filter(isTaskScheduledToday),
    [tasks]
  )

  const today = format(new Date(), 'yyyy-MM-dd')

  // Today's tasks completed
  const todayCompleted = useMemo(() =>
    todayTasks.filter(t => (t.completedDates || []).includes(today)),
    [todayTasks, today]
  )

  // Today's tasks active (not completed)
  const todayActive = useMemo(() =>
    todayTasks.filter(t => !(t.completedDates || []).includes(today)),
    [todayTasks, today]
  )

  // Apply extra filters if passed (for TaskList page)
  const filteredTasks = useMemo(() => {
    let result = [...tasks]
    if (filters.focusArea && filters.focusArea !== 'all') {
      result = result.filter(t => t.focusArea === filters.focusArea)
    }
    if (filters.status === 'active') {
      result = result.filter(t => !(t.completedDates || []).includes(today))
    }
    if (filters.status === 'completed') {
      result = result.filter(t => (t.completedDates || []).includes(today))
    }
    return result
  }, [tasks, filters.focusArea, filters.status, today])

  const addTask    = useCallback(async (data)    => { if (!user?.uid) return; await createTask(user.uid, data) }, [user?.uid])
  const editTask   = useCallback(async (id, upd) => { if (!user?.uid) return; await updateTask(user.uid, id, upd) }, [user?.uid])
  const removeTask = useCallback(async (id)      => { if (!user?.uid) return; await deleteTask(user.uid, id) }, [user?.uid])
  const finishTask = useCallback(async (id)      => { if (!user?.uid) return 0; return completeTask(user.uid, id) }, [user?.uid])
  const undoTask   = useCallback(async (id)      => { if (!user?.uid) return; await uncompleteTask(user.uid, id) }, [user?.uid])

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    todayTasks,
    todayCompleted,
    todayActive,
    loading,
    error,
    addTask, editTask, removeTask, finishTask, undoTask,
  }
}