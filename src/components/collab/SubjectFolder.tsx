// src/components/collab/SubjectFolder.tsx
import React, { useState } from 'react';
import { useCollabStore } from '../../store/collabStore';

export default function SubjectFolder({ subject }: { subject: string }) {
  const { notes, setActiveNote } = useCollabStore();
  const [open, setOpen] = useState(false);
  
  const subjectNotes = notes.filter((n) => n.subject === subject);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 rounded-xl hover:bg-teal-50 transition-colors duration-200 group"
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700 group-hover:text-teal-700">
            📁 {subject}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {subjectNotes.length}
          </span>
        </div>
      </button>
      
      {open && (
        <ul className="ml-4 mt-1 space-y-1">
          {subjectNotes.map((note) => (
            <li
              key={note.id}
              onClick={() => setActiveNote(note)}
              className="cursor-pointer px-4 py-2 rounded-lg hover:bg-teal-50 text-sm text-gray-600 hover:text-teal-700 transition-colors duration-200"
            >
              📄 {note.title}
            </li>
          ))}
          {subjectNotes.length === 0 && (
            <li className="text-xs text-gray-300 px-4 py-2 italic">No notes yet</li>
          )}
        </ul>
      )}
    </div>
  );
}