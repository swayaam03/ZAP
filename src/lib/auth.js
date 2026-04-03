// Low-level Firebase Auth wrappers
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password)

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const loginWithGoogle = () =>
  signInWithPopup(auth, googleProvider)

export const logout = () =>
  signOut(auth)

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email)

export const updateDisplayName = (name) =>
  updateProfile(auth.currentUser, { displayName: name })

export const updateUserEmail = (email) =>
  updateEmail(auth.currentUser, email)

export const updateUserPassword = (password) =>
  updatePassword(auth.currentUser, password)

export const reauthenticate = (password) => {
  const credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    password
  )
  return reauthenticateWithCredential(auth.currentUser, credential)
}

export const deleteCurrentUser = () =>
  deleteUser(auth.currentUser)
