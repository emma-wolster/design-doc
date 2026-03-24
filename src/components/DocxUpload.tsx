'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ParseResult } from '@/types/journey';
import { useJourney } from '@/lib/JourneyContext';

export default function DocxUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();
  const { setParseResult } = useJourney();
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/parse-docx', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to parse document.');
      setIsUploading(false);
      return;
    }

    const data = (await res.json()) as ParseResult;
    setParseResult(data);
    setIsUploading(false);
    router.push('/journey');
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      processFile(file);
    } else {
      setError('Please drop a .docx file.');
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--border-hi)'}`,
          borderRadius: 16,
          padding: '48px 32px',
          cursor: 'pointer',
          background: isDragOver
            ? 'rgba(0,101,255,0.06)'
            : 'var(--s2)',
          transition: 'all .2s ease',
          textAlign: 'center',
        }}
      >
        {/* Upload icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(0,101,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 24,
            color: 'var(--accent)',
          }}
        >
          ↑
        </div>

        {isUploading ? (
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text-bright)',
                marginBottom: 8,
              }}
            >
              Parsing your document…
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>
              Extracting modules and objectives
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text-bright)',
                marginBottom: 8,
              }}
            >
              Drop your design doc here
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
              or click to browse
            </div>
            <div
              style={{
                display: 'inline-block',
                padding: '10px 28px',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                transition: 'background .15s',
              }}
            >
              Choose file
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".docx"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: 16,
            padding: '10px 16px',
            borderRadius: 8,
            background: 'rgba(255,86,48,0.08)',
            border: '1px solid rgba(255,86,48,0.25)',
            fontSize: 13,
            color: 'rgba(255,86,48,0.85)',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
