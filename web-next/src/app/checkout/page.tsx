import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';

export default async function CheckoutPage() {
  const initialPayload = await fetchRemotePagePayload('/checkout');
  return <RemoteHtmlPage path="/checkout" initialPayload={initialPayload} />;
}
