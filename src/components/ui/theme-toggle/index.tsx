'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/src/context/theme';
import { cn } from '@/src/lib/utils';
import './theme-toggle.css';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-700 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg mb-2",
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="mr-3 h-5 w-5">
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </span>
      <span className="text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
};

export default ThemeToggle;
