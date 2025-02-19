'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Baby } from '@prisma/client';

interface BabyContextType {
  selectedBaby: Baby | null;
  setSelectedBaby: (baby: Baby | null) => void;
  sleepingBabies: Set<string>;
  setSleepingBabies: (babies: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
}

const BabyContext = createContext<BabyContextType>({
  selectedBaby: null,
  setSelectedBaby: () => {},
  sleepingBabies: new Set(),
  setSleepingBabies: () => {},
});

interface BabyProviderProps {
  children: React.ReactNode;
}

export function BabyProvider({ children }: BabyProviderProps) {
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedBaby');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [sleepingBabies, setSleepingBabies] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sleepingBabies');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  // Persist selected baby
  useEffect(() => {
    if (selectedBaby) {
      localStorage.setItem('selectedBaby', JSON.stringify(selectedBaby));
    } else {
      localStorage.removeItem('selectedBaby');
    }
  }, [selectedBaby]);

  // Persist sleeping babies
  useEffect(() => {
    localStorage.setItem('sleepingBabies', JSON.stringify(Array.from(sleepingBabies)));
  }, [sleepingBabies]);

  // Update URL when selected baby changes
  useEffect(() => {
    if (selectedBaby) {
      const url = new URL(window.location.href);
      url.searchParams.set('babyId', selectedBaby.id);
      window.history.replaceState({}, '', url.toString());
    }
  }, [selectedBaby]);

  return (
    <BabyContext.Provider value={{ selectedBaby, setSelectedBaby, sleepingBabies, setSleepingBabies }}>
      {children}
    </BabyContext.Provider>
  );
}

export function useBaby() {
  const context = useContext(BabyContext);
  if (!context) {
    throw new Error('useBaby must be used within a BabyProvider');
  }
  return context;
}
