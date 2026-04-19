import type { Metadata } from 'next';
import ProfileClient from '@/components/profile/ProfileClient';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
import { getFullProfile } from '@/lib/api/user';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Profile | EcomSphere',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const sessionUser = await getSessionUsername();
  
  if (!sessionUser) {
    redirect('/login');
  }

  const profileData = await getFullProfile();
  if (!profileData) {
    redirect('/login');
  }

  const settings = await getSiteSettings();

  return (
    <ProfileClient 
      initialData={profileData} 
      sessionUser={sessionUser} 
      settings={settings} 
    />
  );
}
