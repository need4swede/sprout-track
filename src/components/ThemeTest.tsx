'use client';

import React from 'react';
import { useTheme } from '@/src/context/theme';

export function ThemeTest() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Theme Test Component</h2>
      <p className="mb-4">Current theme: {theme}</p>
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-500 rounded"></div>
        <div className="w-8 h-8 bg-gray-400 dark:bg-gray-400 rounded"></div>
      </div>
      <button 
        onClick={toggleTheme}
        className="mt-4 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-800"
      >
        Toggle Theme
      </button>
    </div>
  );
}
