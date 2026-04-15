import RemoteHtmlPage from '@/src/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/src/server/remotePagePayload';

export default async function PrivacyPage() {
  const initialPayload = await fetchRemotePagePayload('/privacy');
  return <RemoteHtmlPage path="/privacy" initialPayload={initialPayload} />;
}
