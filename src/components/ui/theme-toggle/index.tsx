'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/src/context/theme';
import { cn } from '@/src/lib/utils';
import { themeToggleStyles } from './theme-toggle.styles';
import { ThemeToggleProps } from './theme-toggle.types';
import './theme-toggle.css';

/**
 * ThemeToggle component
 * 
 * A button that toggles between light and dark themes
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className,
  ...props
}) => {
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        themeToggleStyles.button,
        "theme-toggle-button",
        className
      )}
      aria-label={`Switch to ${isLightMode ? 'dark' : 'light'} mode`}
      title={`Switch to ${isLightMode ? 'dark' : 'light'} mode`}
      {...props}
    >
      <span className={themeToggleStyles.iconContainer}>
        {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
      </span>
      <span className={themeToggleStyles.label}>
        {isLightMode ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
