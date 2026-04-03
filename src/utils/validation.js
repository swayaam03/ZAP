export const validate = {
  email: (v = '') =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? null
      : 'Enter a valid email address',

  displayName: (v = '') =>
    v.trim().length >= 2
      ? null
      : 'Name must be at least 2 characters',

  password: (v = '') => {
    if (v.length < 8)       return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(v))   return 'Include at least one uppercase letter'
    if (!/[0-9]/.test(v))   return 'Include at least one number'
    return null
  },

  confirmPassword: (v, pw) =>
    v === pw ? null : 'Passwords do not match',

  taskTitle: (v = '') =>
    v.trim().length >= 1
      ? null
      : 'Task title is required',

  phone: (v = '') =>
    !v || /^\+?[\d\s\-().]{7,15}$/.test(v)
      ? null
      : 'Enter a valid phone number',
}

export const FIREBASE_ERRORS = {
  'auth/user-not-found':         'No account found with this email.',
  'auth/wrong-password':         'Incorrect password. Please try again.',
  'auth/email-already-in-use':   'An account with this email already exists.',
  'auth/weak-password':          "Password doesn't meet our requirements.",
  'auth/invalid-email':          'Please enter a valid email address.',
  'auth/too-many-requests':      'Too many attempts. Please wait a few minutes.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/popup-closed-by-user':   'Google sign-in was cancelled.',
  'auth/requires-recent-login':  'Please sign out and sign in again to continue.',
  'auth/invalid-credential':     'Invalid email or password.',
}

export const friendlyAuthError = (err) => {
  if (!err) return 'Something went wrong. Please try again.'
  return FIREBASE_ERRORS[err.code] || err.message || 'Something went wrong.'
}

export function passwordStrength(pw = '') {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)          score++
  if (pw.length >= 12)         score++
  if (/[A-Z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score: 1, label: 'Weak',   color: '#dc2626' }
  if (score === 2) return { score: 2, label: 'Fair',   color: '#d97706' }
  if (score === 3) return { score: 3, label: 'Good',   color: '#0d9488' }
  return             { score: 4, label: 'Strong', color: '#059669' }
}
