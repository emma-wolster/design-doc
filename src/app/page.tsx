'use client';

import DocxUpload from '@/components/DocxUpload';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 32px 80px',
        minHeight: '100vh',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: 24, right: 32 }}>
        <ThemeToggle />
      </div>

      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 600,
          background: 'radial-gradient(ellipse, rgba(0,101,255,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 680, width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '.22em',
            textTransform: 'uppercase' as const,
            color: 'var(--accent)',
            marginBottom: 20,
          }}
        >
          Course Journey Storyboard
        </div>

        {/* Hero heading */}
        <h1
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: 'var(--text-bright)',
            letterSpacing: '-.035em',
            lineHeight: 1.08,
            marginBottom: 24,
          }}
        >
          See your course come<br />
          to <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>life</em>
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: 18,
            color: 'var(--muted)',
            lineHeight: 1.6,
            marginBottom: 56,
            maxWidth: 500,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Upload a design doc with modules and objectives to
          generate an interactive learner journey map.
        </p>

        {/* Upload area */}
        <DocxUpload />

        {/* Format hint */}
        <p
          style={{
            fontSize: 13,
            color: 'var(--muted)',
            marginTop: 40,
            lineHeight: 1.6,
          }}
        >
          Accepts <strong style={{ color: 'var(--text)' }}>.docx</strong> files with the two‑table format
          — one table for modules, one for objectives.
        </p>
      </div>
    </div>
  );
}
