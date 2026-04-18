import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';

export default async function FaqPage() {
  const initialPayload = await fetchRemotePagePayload('/faq');
  return <RemoteHtmlPage path="/faq" initialPayload={initialPayload} />;
}
