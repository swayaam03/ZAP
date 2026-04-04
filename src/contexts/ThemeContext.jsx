import { createContext, useContext, useEffect, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'

const ThemeContext = createContext(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}

export function ThemeProvider({ children }) {
  const { user, profile } = useAuth()

  const getInitialTheme = () => {
    // 1. LocalStorage
    const saved = localStorage.getItem('qm-theme')
    if (saved === 'dark' || saved === 'light') return saved
    // 2. System preference
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  }

  const [theme, setThemeState] = useState(getInitialTheme)

  // Sync from Firestore profile when loaded
  useEffect(() => {
    if (profile?.preferences?.theme) {
      applyTheme(profile.preferences.theme)
    }
  }, [profile?.preferences?.theme])

  // Apply theme to <html> element
  const applyTheme = (t) => {
    setThemeState(t)
    localStorage.setItem('qm-theme', t)
    document.documentElement.setAttribute('data-theme', t)
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light'
    applyTheme(next)
    // Persist to Firestore
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          'preferences.theme': next,
        })
      } catch (_) { /* silent fail */ }
    }
  }

  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}