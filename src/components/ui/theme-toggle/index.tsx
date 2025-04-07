'use client';

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/src/context/theme';
import { cn } from '@/src/lib/utils';
import { Checkbox } from '@/src/components/ui/checkbox';
import { themeToggleStyles } from './theme-toggle.styles';
import { ThemeToggleProps } from './theme-toggle.types';
import './theme-toggle.css';

/**
 * ThemeToggle component
 * 
 * A component that allows toggling between light and dark themes
 * and provides an option to use system theme preference
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className,
  ...props
}) => {
  const { theme, toggleTheme, useSystemTheme, toggleUseSystemTheme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    <div className="theme-toggle-container">
      <div className="theme-toggle-row">
      <button
          onClick={toggleTheme}
          className={cn(
            themeToggleStyles.button,
            "theme-toggle-button",
            useSystemTheme && "theme-toggle-button-disabled",
            className
          )}
          aria-label={`Switch to ${isLightMode ? 'dark' : 'light'} mode`}
          title={`Switch to ${isLightMode ? 'dark' : 'light'} mode`}
          disabled={useSystemTheme}
          {...props}
        >
          <span className={themeToggleStyles.iconContainer}>
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </span>
          <span className={themeToggleStyles.label}>
            {isLightMode ? 'Dark' : 'Light'}
          </span>
        </button>
        
        <div className="system-theme-toggle">
          <label className="system-toggle-label">
            <span className="system-theme-label">
              <Monitor size={14} className="system-theme-icon" />
              System
            </span>
            <Checkbox
              checked={useSystemTheme}
              onCheckedChange={toggleUseSystemTheme}
              id="system-theme-toggle"
              variant="primary"
              size="sm"
              className="system-theme-checkbox"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
