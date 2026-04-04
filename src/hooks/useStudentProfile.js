// FILE: src/hooks/useStudentProfile.js
// ACTION: Create New
// QUESTMIND INTEGRATION: New hook for ZAP student data (does not affect existing hooks)

import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'
import { defaultStudentProfile } from '../types/student'

export function useStudentProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load student profile on mount
  useEffect(() => {
    if (!user?.uid) {
      setProfile(null)
      setLoading(false)
      return
    }

    const loadProfile = async () => {
      try {
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)
        
        if (snap.exists()) {
          const data = snap.data()
          // Merge with defaults to ensure all fields exist
          setProfile({
            ...defaultStudentProfile,
            ...(data.studentProfile || {}),
          })
        } else {
          setProfile({ ...defaultStudentProfile })
        }
        setLoading(false)
      } catch (err) {
        console.error('Error loading student profile:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    loadProfile()
  }, [user?.uid])

  // Update student profile
  const updateProfile = async (updates) => {
    if (!user?.uid) throw new Error('Not authenticated')
    
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        studentProfile: {
          ...profile,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      })
      setProfile(prev => ({ ...prev, ...updates }))
      return true
    } catch (err) {
      console.error('Error updating student profile:', err)
      setError(err.message)
      return false
    }
  }

  return { profile, loading, error, updateProfile }
}