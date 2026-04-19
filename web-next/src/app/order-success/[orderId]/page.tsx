import type { Metadata } from 'next';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
import { API_URL } from '@/config';
import { getImageUrl } from '@/utils/imagePaths';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Order Successful | EcomSphere',
};

export const dynamic = 'force-dynamic';

async function getOrderDetails(orderId: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/orders/${orderId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.order : null;
  } catch (err) {
    return null;
  }
}

import DownloadInvoiceButton from '@/components/order/DownloadInvoiceButton';

export default async function OrderSuccessPage({ params }: { params: { orderId: string } }) {
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();
  const order = await getOrderDetails(params.orderId);

  if (!order) {
    redirect('/');
  }

  return (
    <>
      <HeaderPartial activePage="" sessionUser={sessionUser} settings={settings} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .success-container { max-width: 700px; margin: 60px auto; text-align: center; padding: 60px 40px; background: #fff; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.06); font-family: 'Poppins', sans-serif; }
        .success-icon { font-size: 80px; color: #28a745; margin-bottom: 25px; animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes bounceIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        
        .success-container h2 { color: #1a1a1a; font-size: 2.2rem; font-weight: 800; margin-bottom: 10px; }
        .order-id-badge { background: #f0fff4; border: 1px solid #28a745; border-radius: 12px; padding: 12px 25px; display: inline-block; margin: 20px 0; font-size: 16px; font-weight: 700; color: #166534; }
        
        .order-details-box { text-align: left; background: #fcfcfc; border: 1px solid #eee; border-radius: 15px; padding: 30px; margin: 30px 0; }
        .item-row { display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
        .item-row:last-child { border-bottom: none; }
        
        .btn-stack { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 30px; }
        .btn-es { padding: 16px 35px; border-radius: 12px; font-weight: 700; text-decoration: none; transition: 0.3s; font-size: 15px; border: none; outline: none; }
        .btn-es-primary { background: #088178; color: #fff; }
        .btn-es-primary:hover { background: #06655e; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(8, 129, 120, 0.2); }
        .btn-es-outline { border: 2px solid #088178; color: #088178; background: transparent; }
        .btn-es-outline:hover { background: #088178; color: #fff; }
      `}} />

      <section className="section-p1">
        <div className="success-container">
          <div className="success-icon">
            <i className="fa-solid fa-circle-check"></i>
          </div>

          <h2>Order Successful!</h2>
          <p style={{ color: '#666', fontSize: '18px' }}>Thank you for shopping with EcomSphere 🎉</p>

          <div className="order-id-badge">
            ORDER ID: #{order._id.toString().slice(-8).toUpperCase()}
          </div>

          <div className="order-details-box">
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Summary</h3>

            {order.items.map((item: any, i: number) => (
              <div key={i} className="item-row">
                <img src={getImageUrl(item.image)} width="60" height="60" style={{ borderRadius: '10px', objectFit: 'cover' }} alt={item.name} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>{item.name}</p>
                  <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                <div style={{ fontWeight: 700, color: '#088178' }}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800 }}>
                <span>Total Amount Paid</span>
                <span style={{ color: '#088178' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginTop: '25px', padding: '15px', background: '#fff', borderRadius: '10px', border: '1px solid #eee' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}><strong>Deliver to:</strong> {order.checkoutInfo.name}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{order.checkoutInfo.address}</p>
            </div>
          </div>

          <div className="btn-stack">
            <a href="/" className="btn-es btn-es-primary">Continue Shopping</a>
            <DownloadInvoiceButton orderId={params.orderId} />
            <a href="/profile" className="btn-es btn-es-outline">My Orders</a>
            <a href={`/track-order?orderId=${order._id}`} className="btn-es btn-es-outline">Track Order</a>
          </div>
        </div>
      </section>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
