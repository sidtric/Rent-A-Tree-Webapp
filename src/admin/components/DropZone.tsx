import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import './DropZone.css';

interface Props {
  onFiles: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  staged?: FileList | null;
  compact?: boolean;
}

export default function DropZone({ onFiles, accept, multiple = true, disabled, staged, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setOver(false);
    if (disabled || !e.dataTransfer.files.length) return;
    onFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!disabled) setOver(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      onFiles(e.target.files);
      e.target.value = '';
    }
  }

  const count = staged?.length ?? 0;
  const cls = ['dz', compact ? 'dz--compact' : '', over ? 'dz--over' : '', disabled ? 'dz--disabled' : ''].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setOver(false)}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <span className="dz-icon">{over ? '📂' : count > 0 ? '✅' : '📁'}</span>
      <span className="dz-main">
        {count > 0
          ? `${count} file${count > 1 ? 's' : ''} selected`
          : over
          ? 'Drop to upload'
          : 'Drag & drop photos / videos here'}
      </span>
      {!over && count === 0 && <span className="dz-hint">or click to browse</span>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
