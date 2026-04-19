import type { Metadata } from 'next';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
import CheckoutClient from '@/components/checkout/CheckoutClient';
import { getUserProfile } from '@/lib/api/user';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Checkout | EcomSphere',
};

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();
  
  const token = cookies().get('token')?.value;
  if (!token) {
    redirect('/auth');
  }

  const userRes = await getUserProfile(token);
  const user = userRes.success ? userRes.user : null;

  return (
    <CheckoutClient 
      sessionUser={sessionUser} 
      settings={settings} 
      user={user} 
    />
  );
}
