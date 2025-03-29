'use client';

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/src/context/theme';
import { cn } from '@/src/lib/utils';
import './theme-toggle.css';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, useSystemTheme, toggleTheme, toggleUseSystemTheme } = useTheme();

  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2", className)}>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className={cn(
          "flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-700 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg",
          useSystemTheme && "opacity-50 cursor-not-allowed"
        )}
        disabled={useSystemTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={useSystemTheme ? "Disable 'Use System Theme' to manually set theme" : `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <span className="mr-2 h-4 w-4">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </span>
        <span className="text-xs">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
      </button>

      {/* System theme toggle - rocker switch */}
      <div className="flex items-center px-4 py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Use System</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={useSystemTheme}
            onChange={toggleUseSystemTheme}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            <Monitor className="h-4 w-4" />
          </span>
        </label>
      </div>
    </div>
  );
};

export default ThemeToggle;
