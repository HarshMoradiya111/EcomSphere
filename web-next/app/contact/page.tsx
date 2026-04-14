import RemoteHtmlPage from '@/src/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/src/server/remotePagePayload';

export default async function ContactPage() {
  const initialPayload = await fetchRemotePagePayload('/contact');
  return <RemoteHtmlPage path="/contact" initialPayload={initialPayload} />;
}
