import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'atlassian-blue': '#0052CC',
        'atlassian-teal': '#00B8D9',
        'atlassian-green': '#36B37E',
        'atlassian-purple': '#6554C0',
        'atlassian-yellow': '#FFAB00',
        'atlassian-red': '#FF5630',
      },
    },
  },
  plugins: [],
};

export default config;
