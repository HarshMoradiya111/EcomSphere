import RemoteHtmlPage from '@/src/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/src/server/remotePagePayload';

export default async function BlogPage() {
  const initialPayload = await fetchRemotePagePayload('/blog');
  return <RemoteHtmlPage path="/blog" initialPayload={initialPayload} />;
}
