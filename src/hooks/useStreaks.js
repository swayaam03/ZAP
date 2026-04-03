import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { getUserStreaks, getStreakStats } from '../services/streakService'

export function useStreaks() {
  const { user } = useAuth()
  const [streaks, setStreaks]   = useState({})
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!user?.uid) {
      setStreaks({})
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = getUserStreaks(user.uid, (data) => {
      setStreaks(data)
      setLoading(false)
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })

    return () => unsubscribe && unsubscribe()
  }, [user?.uid])

  const refreshStats = async () => {
    if (!user?.uid) return
    try {
      const data = await getStreakStats(user.uid)
      setStats(data)
    } catch (err) {
      setError(err.message)
    }
  }

  return { streaks, stats, loading, error, refreshStats }
}
