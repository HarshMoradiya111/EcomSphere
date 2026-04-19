import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  const initialPayload = await fetchRemotePagePayload('/terms');
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();
  return (
    <>
      <HeaderPartial 
        activePage="" 
        sessionUser={sessionUser} 
        settings={settings} 
      />
      <RemoteHtmlPage path="/terms" initialPayload={initialPayload} />
      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
