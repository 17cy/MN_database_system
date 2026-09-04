'use client';

import { useState, useEffect, useRef } from 'react';

const DEFAULT_NAME = 'Insert Branch Name';

export default function BranchTitle() {
  const [name, setName] = useState(DEFAULT_NAME);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    fetch('/api/branch-name')
      .then((res) => res.json())
      .then((data) => {
        if (data.branchName) setName(data.branchName);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEdit() {
    setDraft(name);
    cancelledRef.current = false;
    setEditing(true);
  }

  async function save() {
    const trimmed = draft.trim();
    const nextName = trimmed || DEFAULT_NAME;
    setEditing(false);
    if (nextName === name) return;
    setName(nextName);
    try {
      await fetch('/api/branch-name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchName: nextName }),
      });
    } catch {
      // Ignore — the name still updates locally; a page refresh will pull the last saved value.
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (cancelledRef.current) {
            cancelledRef.current = false;
            return;
          }
          save();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelledRef.current = true;
            setEditing(false);
          }
        }}
        className="font-semibold bg-white border border-slate-300 rounded px-1 -mx-1 min-w-[10ch] focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
    );
  }

  return (
    <span
      className="font-semibold cursor-text select-none"
      title="Double-click to rename"
      onDoubleClick={startEdit}
    >
      {name}
    </span>
  );
}
