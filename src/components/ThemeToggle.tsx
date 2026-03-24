'use client';

import { useTheme } from '@/lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: 24,
        border: '1px solid var(--border-hi)',
        background: 'var(--s2)',
        color: 'var(--text)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all .2s ease',
        fontFamily: 'inherit',
      }}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
