import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot,
  serverTimestamp, increment, getDoc, arrayUnion,
} from 'firebase/firestore'
import { db } from '../firebase'
import { calculateTaskXP } from '../utils/xpCalculator'
import { calculateStreak } from '../utils/streakCalculator'
import { format } from 'date-fns'

const TASKS = (uid) => `users/${uid}/tasks`

export function getUserTasks(uid, filters = {}, onSuccess, onError) {
  const q = query(
    collection(db, TASKS(uid)),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q,
    (snap) => {
      let tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      if (filters.focusArea && filters.focusArea !== 'all') {
        tasks = tasks.filter(t => t.focusArea === filters.focusArea)
      }
      if (filters.status === 'active') {
        tasks = tasks.filter(t => !isCompletedToday(t))
      }
      if (filters.status === 'completed') {
        tasks = tasks.filter(t => isCompletedToday(t))
      }

      onSuccess(tasks)
    },
    (err) => onError?.(err)
  )
}

function isCompletedToday(task) {
  const today = format(new Date(), 'yyyy-MM-dd')
  return (task.completedDates || []).includes(today)
}

export async function createTask(uid, data) {
  return addDoc(collection(db, TASKS(uid)), {
    title:          data.title.trim(),
    description:    data.description?.trim() || '',
    focusArea:      data.focusArea      || 'deepWork',
    priority:       data.priority       || 'medium',
    estimatedTime:  data.estimatedTime  || '30 min',
    schedule:       data.schedule       || { type: 'once', days: [], time: '' },
    startDate:      data.startDate      || format(new Date(), 'yyyy-MM-dd'),
    streak:         0,
    completedDates: [],
    isAiGenerated:  data.isAiGenerated  || false,
    createdAt:      serverTimestamp(),
    updatedAt:      serverTimestamp(),
  })
}

export async function updateTask(uid, taskId, updates) {
  await updateDoc(doc(db, TASKS(uid), taskId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTask(uid, taskId) {
  await deleteDoc(doc(db, TASKS(uid), taskId))
}

export async function completeTask(uid, taskId) {
  const today   = format(new Date(), 'yyyy-MM-dd')
  const taskRef = doc(db, TASKS(uid), taskId)
  const snap    = await getDoc(taskRef)
  if (!snap.exists()) throw new Error('Task not found')

  const task = snap.data()
  if ((task.completedDates || []).includes(today)) return 0 // already done today

  // Recalculate streak
  const newDates = [...(task.completedDates || []), today]
  const { current } = calculateStreak(newDates)

  // Update task
  await updateDoc(taskRef, {
    completedDates: arrayUnion(today),
    streak:         current,
    updatedAt:      serverTimestamp(),
  })

  // Calculate XP
  const xp = calculateTaskXP({
    priority:      task.priority,
    estimatedTime: task.estimatedTime,
    streakDays:    current,
  })

  // Update user profile
  const userRef  = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  if (userSnap.exists()) {
    const userData = userSnap.data()
    const newXp    = (userData.xp || 0) + xp
    const newLevel = Math.floor(newXp / 100) + 1
    await updateDoc(userRef, {
      xp:                 newXp,
      level:              newLevel,
      totalTasksCompleted: increment(1),
      todayCompleted:     increment(1),
    })
  }

  return xp
}

export async function uncompleteTask(uid, taskId) {
  const today   = format(new Date(), 'yyyy-MM-dd')
  const taskRef = doc(db, TASKS(uid), taskId)
  const snap    = await getDoc(taskRef)
  if (!snap.exists()) return

  const task     = snap.data()
  const newDates = (task.completedDates || []).filter(d => d !== today)
  const { current } = calculateStreak(newDates)

  await updateDoc(taskRef, {
    completedDates: newDates,
    streak:         current,
    updatedAt:      serverTimestamp(),
  })

  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    todayCompleted: increment(-1),
  })
}
