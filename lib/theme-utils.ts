/**
 * Theme Utilities
 * 
 * This file provides helper functions for working with the design system.
 */

// Theme toggle function
export const toggleTheme = (): void => {
  if (typeof window !== 'undefined') {
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }
};

// Initialize theme based on user preference or system preference
export const initializeTheme = (): void => {
  if (typeof window !== 'undefined') {
    // Check for stored preference
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // If no stored preference, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }
};

// Get CSS variable value
export const getCssVariable = (variableName: string): string => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${variableName}`)
      .trim();
  }
  return '';
};

// Set CSS variable value
export const setCssVariable = (variableName: string, value: string): void => {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty(`--${variableName}`, value);
  }
};

// Convert hex color to HSL format for CSS variables
export const hexToHSL = (hex: string): string => {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  
  let h = 0;
  let s = 0;
  let l = 0;
  
  // Calculate hue
  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  // Calculate lightness
  l = (cmax + cmin) / 2;
  
  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  
  // Convert to percentages
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  
  return `${h} ${s}% ${l}%`;
};

// Apply a custom theme
export const applyTheme = (theme: Record<string, string>): void => {
  Object.entries(theme).forEach(([key, value]) => {
    // If it's a hex color, convert to HSL for CSS variables
    if (value.startsWith('#')) {
      setCssVariable(key, hexToHSL(value));
    } else {
      setCssVariable(key, value);
    }
  });
};

// Get spacing value in pixels
export const getSpacing = (multiplier: number): string => {
  return `${multiplier * 8}px`;
};

// Media query breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Helper for responsive design
export const mediaQuery = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};
