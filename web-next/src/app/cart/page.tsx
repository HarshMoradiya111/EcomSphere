import type { Metadata } from 'next';
import CartPageClient from './CartPageClient';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';

export const metadata: Metadata = {
  title: 'Shopping Bag | EcomSphere',
  description: 'Review your handpicked selection and proceed to secure checkout.',
};

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();

  return (
    <CartPageClient 
      sessionUser={sessionUser} 
      settings={settings} 
    />
  );
}
