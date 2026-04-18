import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';

export default async function WishlistPage() {
  const initialPayload = await fetchRemotePagePayload('/wishlist');
  return <RemoteHtmlPage path="/wishlist" initialPayload={initialPayload} />;
}
