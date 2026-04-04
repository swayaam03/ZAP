import { useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useCollabStore, Note } from '../store/collabStore';

export function useNotesLoader(userId: string) {
  const { setNotes } = useCollabStore();

  useEffect(() => {
    if (!userId) return;

    // Fetch notes where the user is a collaborator
    const q = query(
      collection(db, 'notes'),
      where('collaborators', 'array-contains', userId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const loadedNotes: Note[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Note, 'id'>),
      }));
      setNotes(loadedNotes);
    });

    return () => unsub();
  }, [userId, setNotes]);
}