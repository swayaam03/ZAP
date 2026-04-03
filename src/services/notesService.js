import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

const NOTES = (uid) => `users/${uid}/notes`

export function getUserNotes(uid, onSuccess, onError) {
  const q = query(
    collection(db, NOTES(uid)),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q,
    (snap) => {
      const notes = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      onSuccess(notes)
    },
    (err) => onError?.(err)
  )
}

export async function createNote(uid, content, tags = []) {
  return addDoc(collection(db, NOTES(uid)), {
    content: content.trim(),
    tags,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateNote(uid, noteId, updates) {
  await updateDoc(doc(db, NOTES(uid), noteId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteNote(uid, noteId) {
  await deleteDoc(doc(db, NOTES(uid), noteId))
}
