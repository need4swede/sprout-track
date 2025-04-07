'use client';

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/src/context/theme';
import { cn } from '@/src/lib/utils';
import { themeToggleStyles } from './theme-toggle.styles';
import { ThemeToggleProps } from './theme-toggle.types';
import './theme-toggle.css';

/**
 * ThemeToggle component
 * 
 * A component that allows cycling between light, dark, and system themes
 * with visual indication of the current active theme
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className,
  ...props
}) => {
  const { theme, toggleTheme, useSystemTheme, toggleUseSystemTheme } = useTheme();
  
  // Function to cycle between light, dark, and system modes
  const cycleTheme = () => {
    if (useSystemTheme) {
      // If currently using system, always switch to explicit light mode
      // regardless of the current system preference
      toggleUseSystemTheme();
      
      // Force light mode
      localStorage.setItem('theme', 'light');
      
      // Update the DOM directly
      document.documentElement.classList.remove('dark');
      
      // Force a re-render to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 50);
    } else if (theme === 'light') {
      // If light, switch to dark
      toggleTheme();
    } else {
      // If dark, switch to system
      toggleUseSystemTheme();
    }
  };

  // Determine the next theme in the cycle for the button text
  const getNextTheme = () => {
    if (useSystemTheme) return 'light';
    if (theme === 'light') return 'dark';
    return 'system';
  };

  // Get the appropriate icon and label for the current theme
  const getCurrentThemeIcon = () => {
    if (useSystemTheme) return <Monitor size={16} />;
    return theme === 'light' ? <Sun size={16} /> : <Moon size={16} />;
  };

  const getCurrentThemeLabel = () => {
    if (useSystemTheme) return 'System';
    return theme === 'light' ? 'Light' : 'Dark';
  };

  return (
    <div className="theme-toggle-container">
      <div className="theme-toggle-row">
        <button
          onClick={cycleTheme}
          className={cn(
            themeToggleStyles.button,
            "theme-toggle-button",
            className
          )}
          aria-label={`Switch to ${getNextTheme()} mode`}
          title={`Switch to ${getNextTheme()} mode`}
          {...props}
        >
          <span className="theme-icon-container">
            <span className={cn(
              "theme-icon",
              useSystemTheme && "active-system",
              !useSystemTheme && theme === 'light' && "active-light",
              !useSystemTheme && theme === 'dark' && "active-dark"
            )}>
              {getCurrentThemeIcon()}
            </span>
          </span>
          <span className="theme-info">
            <span className="current-theme">{getCurrentThemeLabel()}</span>
            <span className="next-theme">Switch to {getNextTheme()}</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
