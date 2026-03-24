import '../styles/globals.css';
import '../styles/journey.css';
import { ReactNode } from 'react';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Course Journey Storyboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full" data-theme="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily: "'Sora', sans-serif",
          minHeight: '100vh',
        }}
      >
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
