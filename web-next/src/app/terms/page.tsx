import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';

export default async function TermsPage() {
  const initialPayload = await fetchRemotePagePayload('/terms');
  return <RemoteHtmlPage path="/terms" initialPayload={initialPayload} />;
}
