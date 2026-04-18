import { cookies } from 'next/headers';
import { API_URL } from '@/config';


export async function getSessionUsername(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    // Call the new JSON API instead of legacy HTML page
    const response = await fetch(`${API_URL}/api/v1/user/profile`, {
      cache: 'no-store',
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success && data.user ? data.user.username : null;
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
}
