import {
  doc, collection, getDoc, getDocs,
  setDoc, updateDoc, onSnapshot,
  serverTimestamp, arrayUnion,
} from 'firebase/firestore'
import { db } from '../firebase'
import { calculateStreak } from '../utils/streakCalculator'
import { format } from 'date-fns'

export function getUserStreaks(uid, onSuccess, onError) {
  const ref = collection(db, 'users', uid, 'streaks')
  return onSnapshot(ref,
    (snap) => {
      const data = {}
      snap.docs.forEach(d => { data[d.id] = d.data() })
      onSuccess(data)
    },
    (err) => onError?.(err)
  )
}

export async function updateStreakOnCompletion(uid, category) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const ref   = doc(db, 'users', uid, 'streaks', category)
  const snap  = await getDoc(ref)

  if (snap.exists()) {
    const existing = snap.data()
    const dates    = existing.completionDates || []
    if (dates.includes(today)) return // already logged today

    const newDates = [...dates, today]
    const { current, longest, isOnIce, iceExpiresAt } = calculateStreak(newDates)

    await updateDoc(ref, {
      completionDates: arrayUnion(today),
      current,
      longest: Math.max(longest, existing.longest || 0),
      isOnIce,
      iceExpiresAt,
      lastUpdated: serverTimestamp(),
    })
  } else {
    const { current, longest, isOnIce, iceExpiresAt } = calculateStreak([today])
    await setDoc(ref, {
      category,
      completionDates: [today],
      current,
      longest,
      isOnIce,
      iceExpiresAt,
      lastUpdated: serverTimestamp(),
    })
  }
}

export async function getStreakStats(uid) {
  const snap       = await getDocs(collection(db, 'users', uid, 'streaks'))
  const categories = snap.docs.map(d => d.data())
  return {
    totalDays:   categories.reduce((a, c) => a + (c.current || 0), 0),
    longestEver: Math.max(...categories.map(c => c.longest || 0), 0),
    activeCount: categories.filter(c => (c.current || 0) > 0).length,
    categories,
  }
}