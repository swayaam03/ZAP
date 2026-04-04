// src/pages/NotesPage.tsx
import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotesLoader } from '../hooks/useNotesLoader';
import { useCollabStore } from '../store/collabStore';
import SubjectFolder from '../components/collab/SubjectFolder';
import SharedNoteEditor from '../components/collab/SharedNoteEditor';
import FocusMode from '../components/focus/FocusMode';
import { calculateFocusXP } from '../utils/xpCalculator';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function NotesPage() {
  const { user, profile, addXP } = useAuth() as any;
  const userId = (user as any)?.uid || '';

  useNotesLoader(userId);
  const { notes } = useCollabStore();

  const [showFocus, setShowFocus]       = useState(false);
  const [showNewNote, setShowNewNote]   = useState(false);
  const [newTitle, setNewTitle]         = useState('');
  const [newSubject, setNewSubject]     = useState('');
  const [creating, setCreating]         = useState(false);

  const subjects = useMemo(() => {
    if (!notes.length) return [];
    return [...new Set(notes.map((n) => n.subject))].sort();
  }, [notes]);

const handleCreateNote = async () => {
  if (!newTitle.trim() || !newSubject.trim()) return;
  setCreating(true);
  try {
    console.log('Creating note with userId:', userId);
    const docRef = await addDoc(collection(db, 'notes'), {
      title:         newTitle.trim(),
      subject:       newSubject.trim(),
      content:       '',
      collaborators: [userId],
      lastEditedBy:  userId,
      updatedAt:     Date.now(),
    });
    
    console.log('Note created:', docRef.id);
    setNewTitle('');
    setNewSubject('');
    setShowNewNote(false);
  } catch (err) {
    console.error('Error creating note:', err);
  } finally {
    setCreating(false);
  }
};

  const handleXPEarned = async () => {
    const xp = calculateFocusXP({ streakDays: profile?.currentStreak || 0 });
    await addXP(xp);
    setShowFocus(false);
  };

  if (!userId) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#94a3b8' }}>Please log in to access your notebooks</p>
    </div>
  );

  if (showFocus) return <FocusMode onXPEarned={handleXPEarned} onExit={() => setShowFocus(false)} />;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 4rem)', background: '#faf9f6' }}>

      {/* Left Sidebar */}
      <aside style={{
        width: 280, borderRight: '1px solid #e2e8f0',
        background: '#ffffff', padding: '24px 16px',
        overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#0f172a', margin: 0 }}>
            📚 My Notebooks
          </h2>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => setShowNewNote(!showNewNote)}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 8,
              background: '#0d9488', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
            }}
          >
            ✏️ New Note
          </button>
          <button
            onClick={() => setShowFocus(true)}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 8,
              background: '#1e293b', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
            }}
          >
            ⚡ Focus Mode
          </button>
        </div>

        {/* New Note Form */}
        {showNewNote && (
          <div style={{
            background: '#f8fafc', borderRadius: 10, padding: 14,
            border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Note title..."
              style={{
                padding: '8px 10px', borderRadius: 7, border: '1px solid #e2e8f0',
                fontSize: 13, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <input
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              placeholder="Subject (e.g. Math, Physics)..."
              style={{
                padding: '8px 10px', borderRadius: 7, border: '1px solid #e2e8f0',
                fontSize: 13, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleCreateNote}
              disabled={creating || !newTitle.trim() || !newSubject.trim()}
              style={{
                padding: '8px', borderRadius: 7, background: '#0d9488',
                color: '#fff', border: 'none', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', opacity: creating ? 0.6 : 1,
              }}
            >
              {creating ? 'Creating...' : 'Create ✓'}
            </button>
          </div>
        )}

        {/* Subject Folders */}
        {subjects.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 32 }}>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No notes yet</p>
            <p style={{ color: '#cbd5e1', fontSize: 12 }}>Click "New Note" to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {subjects.map((sub) => (
              <SubjectFolder key={sub} subject={sub} />
            ))}
          </div>
        )}
      </aside>

      {/* Right: Editor */}
      <main style={{ flex: 1, background: '#faf9f6' }}>
        <SharedNoteEditor userId={userId} />
      </main>
    </div>
  );
}