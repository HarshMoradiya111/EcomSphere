import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';

export default async function AboutPage() {
  const initialPayload = await fetchRemotePagePayload('/about');
  return <RemoteHtmlPage path="/about" initialPayload={initialPayload} />;
}
