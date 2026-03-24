'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Module, Objective, ParseResult } from '@/types/journey';

// ----------------------------------------------------------------
// Shape of the context
// ----------------------------------------------------------------

interface JourneyContextValue {
  modules: Module[];
  objectives: Objective[];
  warnings: string[];
  courseName: string;
  /** Call this after a successful parse to store the data. */
  setParseResult: (result: ParseResult) => void;
  /** True once data has been loaded (from parse or sessionStorage). */
  isLoaded: boolean;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

// ----------------------------------------------------------------
// SessionStorage key
// ----------------------------------------------------------------

const STORAGE_KEY = 'course-journey-data';

// ----------------------------------------------------------------
// Provider
// ----------------------------------------------------------------

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [courseName, setCourseName] = useState('Course Journey Storyboard');
  const [isLoaded, setIsLoaded] = useState(false);

  // On first render, try to rehydrate from sessionStorage.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as ParseResult;
        setModules(data.modules ?? []);
        setObjectives(data.objectives ?? []);
        setWarnings(data.warnings ?? []);
        setCourseName(data.courseName || 'Course Journey Storyboard');
        setIsLoaded(true);
      }
    } catch {
      // sessionStorage unavailable or corrupted – start fresh.
    }
  }, []);

  function setParseResult(result: ParseResult) {
    setModules(result.modules);
    setObjectives(result.objectives);
    setWarnings(result.warnings ?? []);
    setCourseName(result.courseName || 'Course Journey Storyboard');
    setIsLoaded(true);

    // Persist to sessionStorage so a page refresh keeps the data.
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch {
      // Storage full or unavailable – data will still work in memory.
    }
  }

  return (
    <JourneyContext.Provider
      value={{ modules, objectives, warnings, courseName, setParseResult, isLoaded }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

// ----------------------------------------------------------------
// Hook
// ----------------------------------------------------------------

export function useJourney(): JourneyContextValue {
  const ctx = useContext(JourneyContext);
  if (!ctx) {
    throw new Error('useJourney must be used inside <JourneyProvider>');
  }
  return ctx;
}
