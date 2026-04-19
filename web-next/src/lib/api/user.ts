import { cookies } from 'next/headers';
import { API_URL } from '@/config';

export async function getWishlist() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return [];

    const response = await fetch(`${API_URL}/api/v1/user/wishlist`, {
      cache: 'no-store',
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.success ? data.wishlist : [];
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    return [];
  }
}

export async function getUserProfile(token?: string) {
  try {
    const activeToken = token || (await cookies()).get('token')?.value;
    if (!activeToken) return { success: false, error: 'No token' };

    const response = await fetch(`${API_URL}/api/v1/user/profile`, {
      cache: 'no-store',
      headers: { 
        'Authorization': `Bearer ${activeToken}` 
      },
    });

    if (!response.ok) return { success: false, error: 'Fetch failed' };

    return await response.json();
  } catch (error) {
    console.error('Fetch profile error:', error);
    return { success: false, error: 'Internal error' };
  }
}

export async function getFullProfile() {
  return getUserProfile();
}
