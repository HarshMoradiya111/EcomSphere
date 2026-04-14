import RemoteHtmlPage from '@/src/components/ejs-partials/RemoteHtmlPage';

export default function OrderSuccessPage({ params }: { params: { orderId: string } }) {
  return <RemoteHtmlPage path={`/order-success/${params.orderId}`} />;
}
