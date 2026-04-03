// Higher-level auth operations (thin wrapper used by AuthContext)
// Direct Firebase calls live in src/lib/auth.js
export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  updateDisplayName,
  updateUserEmail,
  updateUserPassword,
  reauthenticate,
  deleteCurrentUser,
} from '../lib/auth'
