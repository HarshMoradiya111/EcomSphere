'use client';

import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    // 1. Clear the token cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    
    // 2. Clear localStorage just in case legacy code used it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 3. Redirect to home and refresh to clear state
    window.location.href = '/';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Spartan, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Logging out...</h2>
        <p>Clearing your session and returning to home.</p>
      </div>
    </div>
  );
}
