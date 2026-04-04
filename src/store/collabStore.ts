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
  setActiveNote: (note: Note) => void;
  setNotes: (notes: Note[]) => void;
  updateNoteContent: (id: string, content: string) => void;
}

export const useCollabStore = create<CollabStore>((set) => ({
  notes: [],
  activeNote: null,
  setActiveNote: (note) => set({ activeNote: note }),
  setNotes: (notes) => set({ notes }),
  updateNoteContent: (id, content) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, content } : n)),
    })),
}));