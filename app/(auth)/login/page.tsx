'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginSecurity from '@/src/components/LoginSecurity';

export default function LoginPage() {
  const router = useRouter();

  // Handle successful authentication
  const handleUnlock = (caretakerId?: string) => {
    // Redirect to main app after successful authentication
    router.push('/log-entry');
  };

  // Check if already authenticated on page load
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const unlockTime = localStorage.getItem('unlockTime');
    
    // If user is authenticated, redirect to main app
    // The app layout will handle checking for session expiration
    if (authToken && unlockTime) {
      router.push('/log-entry');
    }
  }, [router]);

  return <LoginSecurity onUnlock={handleUnlock} />;
}
