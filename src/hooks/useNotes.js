import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getUserNotes, createNote, updateNote, deleteNote } from '../services/notesService'

export function useNotes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.uid) { setNotes([]); setLoading(false); return }
    setLoading(true)
    const unsub = getUserNotes(
      user.uid,
      (data) => { setNotes(data); setLoading(false) },
      (err)  => { setError(err.message); setLoading(false) }
    )
    return () => unsub?.()
  }, [user?.uid])

  const addNote   = useCallback(async (content, tags) => { if (!user?.uid) return; await createNote(user.uid, content, tags) }, [user?.uid])
  const editNote  = useCallback(async (id, upd) => { if (!user?.uid) return; await updateNote(user.uid, id, upd) }, [user?.uid])
  const removeNote= useCallback(async (id)      => { if (!user?.uid) return; await deleteNote(user.uid, id) }, [user?.uid])

  return { notes, loading, error, addNote, editNote, removeNote }
}
