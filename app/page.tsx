'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem('authToken');
    const unlockTime = localStorage.getItem('unlockTime');
    
    if (authToken && unlockTime) {
      // User is authenticated, redirect to main app
      router.push('/log-entry');
    } else {
      // Not authenticated, redirect to login
      router.push('/login');
    }
  }, [router]);

  // Return null as this is just a redirect page
  return null;
}
