import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot,
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
      const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      onSuccess(tasks)
    },
    (err) => onError?.(err)
  )
}

export async function createTask(uid, data) {
  return addDoc(collection(db, TASKS(uid)), {
    title:          data.title?.trim() || '',
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
  if ((task.completedDates || []).includes(today)) return 0

  // Update task completedDates + per-task streak
  const newDates    = [...(task.completedDates || []), today]
  const { current } = calculateStreak(newDates)

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

  // Recalculate user-level streak from ALL tasks combined
  const userRef  = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const userData = userSnap.data()
    const newXp    = (userData.xp || 0) + xp
    const newLevel = Math.floor(newXp / 100) + 1

    // Compute global streak: days user completed at least one task
    // We'll get all task completion dates merged
    // For simplicity: use the current task's streak as a proxy
    // For real global streak, pass all completedDates from all tasks
    const currentStreak  = Math.max(current, userData.currentStreak || 0)
    const longestStreak  = Math.max(currentStreak, userData.longestStreak || 0)

    await updateDoc(userRef, {
      xp:                  newXp,
      level:               newLevel,
      totalTasksCompleted: increment(1),
      todayCompleted:      increment(1),
      currentStreak,
      longestStreak,
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