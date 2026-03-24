// Atlassian-inspired color tokens.
// Each entry has a name and a hex value for use in both CSS classes and SVG.

export interface ColorToken {
  name: string;
  hex: string;
}

export const moduleColors: ColorToken[] = [
  { name: 'orange', hex: '#FF991F' },
  { name: 'teal',   hex: '#00B8D9' },
  { name: 'green',  hex: '#36B37E' },
  { name: 'blue',   hex: '#0052CC' },
  { name: 'purple', hex: '#6554C0' },
  { name: 'yellow', hex: '#FFAB00' },
];

export function getModuleColor(index: number): ColorToken {
  return moduleColors[index % moduleColors.length];
}
