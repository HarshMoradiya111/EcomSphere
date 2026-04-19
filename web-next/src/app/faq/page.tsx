import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
export const dynamic = 'force-dynamic';

export default async function FAQPage() {
  const initialPayload = await fetchRemotePagePayload('/faq');
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();
  return (
    <>
      <HeaderPartial 
        activePage="faq" 
        sessionUser={sessionUser} 
        settings={settings} 
      />
      <RemoteHtmlPage path="/faq" initialPayload={initialPayload} />
      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
