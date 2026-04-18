import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';

export default async function PrivacyPage() {
  const initialPayload = await fetchRemotePagePayload('/privacy');
  return <RemoteHtmlPage path="/privacy" initialPayload={initialPayload} />;
}
