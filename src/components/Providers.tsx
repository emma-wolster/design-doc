'use client';

import { ReactNode } from 'react';
import { JourneyProvider } from '@/lib/JourneyContext';
import { ThemeProvider } from '@/lib/ThemeContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <JourneyProvider>{children}</JourneyProvider>
    </ThemeProvider>
  );
}
