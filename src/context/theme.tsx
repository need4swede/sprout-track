'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme state based on localStorage or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'; // Default for SSR
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Effect to apply theme class to HTML element and listen for system changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Apply the current theme state to the DOM
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Listener for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        // Only update if NO user preference is stored in localStorage
        if (!localStorage.getItem('theme')) {
          const systemTheme: Theme = e.matches ? 'dark' : 'light';
          setTheme(systemTheme); // Update state, which triggers this effect again
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]); // Re-run this effect whenever the theme state changes

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    // Save the user's explicit preference to localStorage
    localStorage.setItem('theme', newTheme);
    // Update the theme state, triggering the useEffect to update the DOM
    setTheme(newTheme);

    // Optional: Keep debug info if needed
    console.log('Theme toggled to:', newTheme);
    console.log('localStorage theme:', localStorage.getItem('theme'));
    console.log('Dark class present:', document.documentElement.classList.contains('dark'));
    console.log('HTML classes:', document.documentElement.className);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
