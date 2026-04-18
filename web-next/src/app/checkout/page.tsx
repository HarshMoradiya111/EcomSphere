import RemoteHtmlPage from '@/src/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/src/server/remotePagePayload';

export default async function CheckoutPage() {
  const initialPayload = await fetchRemotePagePayload('/checkout');
  return <RemoteHtmlPage path="/checkout" initialPayload={initialPayload} />;
}
