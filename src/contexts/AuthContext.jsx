import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import {
  registerWithEmail, loginWithEmail, loginWithGoogle,
  logout, resetPassword, updateDisplayName,
  updateUserPassword, reauthenticate, deleteCurrentUser,
} from '../lib/auth'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

function defaultProfile(uid, displayName, email, photoURL) {
  return {
    uid,
    displayName:        displayName || '',
    email:              email       || '',
    photoURL:           photoURL    || '',
    phoneNumber:        '',
    bio:                '',
    focusAreas:         [],
    rhythm:             '',
    onboardingComplete: false,
    xp:                 0,
    level:              1,
    currentStreak:      0,
    longestStreak:      0,
    todayCompleted:     0,
    iceStreaks:         {},
    preferences: {
      theme:         'light',
      notifications: { email: true, push: false },
      timezone:      Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekStartsOn:  'monday',
    },
    goals: {
      dailyTaskTarget: 5,
      focusCategories: [],
      weeklyXpGoal:    500,
    },
    createdAt: serverTimestamp(),
    lastLogin:  serverTimestamp(),
  }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await loadOrCreate(firebaseUser)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const loadOrCreate = async (firebaseUser) => {
    try {
      const ref  = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setProfile(snap.data())
        await updateDoc(ref, { lastLogin: serverTimestamp() })
      } else {
        const p = defaultProfile(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email, firebaseUser.photoURL)
        await setDoc(ref, p)
        setProfile(p)
      }
    } catch (err) {
      console.error('loadOrCreate:', err)
    }
  }

  const register = async ({ displayName, email, password }) => {
    const { user: fu } = await registerWithEmail(email, password)
    await updateDisplayName(displayName)
    const ref = doc(db, 'users', fu.uid)
    const p   = defaultProfile(fu.uid, displayName, email, '')
    await setDoc(ref, p)
    setProfile(p)
    setUser({ ...fu, displayName })
    return fu
  }

  const login = async ({ email, password }) => {
    const { user: fu } = await loginWithEmail(email, password)
    setUser(fu)
    await loadOrCreate(fu)
    return fu
  }

  const loginGoogle = async () => {
    const { user: fu } = await loginWithGoogle()
    setUser(fu)
    await loadOrCreate(fu)
    return fu
  }

  const signOut = async () => {
    await logout()
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates) => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    await updateDoc(ref, updates)
    setProfile(prev => ({ ...prev, ...updates }))
    if (updates.displayName) await updateDisplayName(updates.displayName)
  }

  const changePassword = async ({ currentPassword, newPassword }) => {
    await reauthenticate(currentPassword)
    await updateUserPassword(newPassword)
  }

  const deleteAccount = async (password) => {
    await reauthenticate(password)
    await deleteCurrentUser()
    setUser(null)
    setProfile(null)
  }

  const sendReset = async (email) => resetPassword(email)

  const addXP = async (amount) => {
    if (!user || !profile) return
    const newXp    = (profile.xp || 0) + amount
    const newLevel = Math.floor(newXp / 100) + 1
    await updateProfile({ xp: newXp, level: newLevel })
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      register, login, loginGoogle, signOut,
      updateProfile, changePassword, deleteAccount, sendReset, addXP,
    }}>
      {children}
    </AuthContext.Provider>
  )
}