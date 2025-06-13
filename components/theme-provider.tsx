"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { initializeTheme } from "../lib/theme-utils"

// Using any type for props to avoid type errors
type ThemeProviderProps = {
  children: React.ReactNode
  [key: string]: any
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    // Initialize theme based on user preference or system preference
    initializeTheme();
  }, []);

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
