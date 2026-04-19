import type { Metadata } from 'next';
import WishlistClient from '@/components/wishlist/WishlistClient';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
import { getWishlist } from '@/lib/api/user';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Wishlist | EcomSphere',
};

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const sessionUser = await getSessionUsername();
  
  if (!sessionUser) {
    redirect('/login');
  }

  const wishlist = await getWishlist();
  const settings = await getSiteSettings();

  return (
    <WishlistClient 
      initialWishlist={wishlist} 
      sessionUser={sessionUser} 
      settings={settings} 
    />
  );
}
