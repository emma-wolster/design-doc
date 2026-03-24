'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = 'course-journey-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Rehydrate from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(THEME_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  // Apply data-theme attribute to <html> for CSS variable switching
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      sessionStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
