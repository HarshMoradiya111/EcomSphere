import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';

export default async function RefundShippingPage() {
  const initialPayload = await fetchRemotePagePayload('/refund-shipping');
  return <RemoteHtmlPage path="/refund-shipping" initialPayload={initialPayload} />;
}
