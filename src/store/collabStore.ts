import { create } from 'zustand';

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  collaborators: string[];
  lastEditedBy: string;
  updatedAt: number;
}

interface CollabStore {
  notes: Note[];
  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  setNotes: (notes: Note[]) => void;
  updateNoteContent: (id: string, content: string) => void;
}

export const useCollabStore = create<CollabStore>((set) => ({
  notes: [],
  activeNote: null,
  setActiveNote: (note) => set({ activeNote: note }),
  setNotes: (notes) => set((state) => {
    const updatedActiveNote = state.activeNote 
      ? notes.find((n) => n.id === state.activeNote!.id) || null
      : null;
    return { notes, activeNote: updatedActiveNote };
  }),
  updateNoteContent: (id, content) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, content } : n)),
      activeNote: state.activeNote?.id === id ? { ...state.activeNote, content } : state.activeNote,
    })),
}));