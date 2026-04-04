// src/components/collab/SharedNoteEditor.tsx
import React, { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCollabStore } from '../../store/collabStore';

export default function SharedNoteEditor({ userId }: { userId: string }) {
  const { activeNote, updateNoteContent } = useCollabStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showShare, setShowShare]       = useState(false);
  const [shareEmail, setShareEmail]     = useState('');
  const [shareUid, setShareUid]         = useState('');
  const [sharing, setSharing]           = useState(false);
  const [shareMsg, setShareMsg]         = useState('');
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    if (!activeNote) return;
    const unsub = onSnapshot(doc(db, 'notes', activeNote.id), (snap) => {
      if (snap.exists()) {
        updateNoteContent(activeNote.id, snap.data().content);
      }
    });
    return () => unsub();
  }, [activeNote?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeNote) return;
    const content = e.target.value;
    updateNoteContent(activeNote.id, content);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await updateDoc(doc(db, 'notes', activeNote.id), {
        content,
        lastEditedBy: userId,
        updatedAt: Date.now(),
      });
    }, 500);
  };

  const handleCopyId = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCollaborator = async () => {
    if (!activeNote || !shareUid.trim()) return;
    setSharing(true);
    setShareMsg('');
    try {
      await updateDoc(doc(db, 'notes', activeNote.id), {
        collaborators: arrayUnion(shareUid.trim()),
      });
      setShareMsg('✅ Collaborator added!');
      setShareUid('');
      setShareEmail('');
    } catch (err) {
      setShareMsg('❌ Failed. Make sure the UID is correct.');
    } finally {
      setSharing(false);
    }
  };

  const wordCount = activeNote?.content
    ? activeNote.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  if (!activeNote) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">Select a note to start editing</p>
          <p className="text-gray-300 text-sm">Choose from your notebooks on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">

        {/* Note Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-gray-800">{activeNote.title}</h1>
            <p className="text-xs text-gray-400 mt-1">{activeNote.subject}</p>
          </div>
          {/* Share button */}
          <button
            onClick={() => setShowShare(!showShare)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors duration-200"
          >
            👥 Share
          </button>
        </div>

        {/* Share Panel */}
        {showShare && (
          <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-700">Share this note</p>

            {/* Copy note ID */}
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-white border border-gray-200 rounded px-3 py-2 text-gray-500 truncate">
                Note ID: {activeNote.id}
              </code>
              <button
                onClick={handleCopyId}
                className="px-3 py-2 rounded-lg bg-teal-500 text-white text-xs font-medium hover:bg-teal-600 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Add by UID */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400">Add collaborator by their Firebase UID:</p>
              <div className="flex gap-2">
                <input
                  value={shareUid}
                  onChange={e => setShareUid(e.target.value)}
                  placeholder="Paste their UID here..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-400"
                />
                <button
                  onClick={handleAddCollaborator}
                  disabled={sharing || !shareUid.trim()}
                  className="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
                >
                  {sharing ? 'Adding...' : 'Add'}
                </button>
              </div>
              {shareMsg && <p className="text-xs">{shareMsg}</p>}
              <p className="text-xs text-gray-300">
                💡 Your UID: <code className="bg-white border border-gray-100 px-1 rounded">{userId}</code>
              </p>
            </div>
          </div>
        )}

        {/* Editor */}
        <textarea
          value={activeNote.content}
          onChange={handleChange}
          className="flex-1 w-full p-6 text-gray-700 text-base leading-relaxed resize-none focus:outline-none bg-transparent font-sans"
          placeholder="Start writing your thoughts..."
        />

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Last edited {new Date(activeNote.updatedAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </p>
        </div>
      </div>
    </div>
  );
}