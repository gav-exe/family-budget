import { useState, useRef, useEffect } from 'react';

export default function EditableCell({ value, onChange, prefix = '', type = 'number', className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef();

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    const parsed = type === 'number' ? parseFloat(draft) || 0 : draft;
    if (parsed !== value) onChange(parsed);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className={`bg-slate-700 text-white rounded px-2 py-1 w-full outline-none ring-1 ring-blue-500 ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer hover:bg-slate-700/50 rounded px-2 py-1 transition-colors ${className}`}
      title="Click to edit"
    >
      {prefix}{type === 'number' ? Number(value).toLocaleString('en-US', { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 }) : value}
    </span>
  );
}
