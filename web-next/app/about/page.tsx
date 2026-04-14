import RemoteHtmlPage from '@/src/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/src/server/remotePagePayload';

export default async function AboutPage() {
  const initialPayload = await fetchRemotePagePayload('/about');
  return <RemoteHtmlPage path="/about" initialPayload={initialPayload} />;
}
