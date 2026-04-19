import type { Metadata } from 'next';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
import { API_URL } from '@/config';

export const metadata: Metadata = {
  title: 'Track Order | EcomSphere',
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

import TrackOrderClient from '@/components/order/TrackOrderClient';

export default async function TrackOrderPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();
  const orderId = searchParams.orderId;
  const order = orderId ? await getOrderDetails(orderId) : null;

  return (
    <>
      <HeaderPartial activePage="" sessionUser={sessionUser} settings={settings} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .track-container { max-width: 800px; margin: 60px auto; padding: 40px; background: #fff; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); font-family: 'Poppins', sans-serif; }
        .track-container h2 { text-align: center; margin-bottom: 20px; font-size: 2.5rem; font-weight: 800; color: #1a1a1a; }
        
        .timeline { display: flex; justify-content: space-between; position: relative; margin: 60px 0 40px; }
        .timeline::before { content: ""; position: absolute; top: 20px; left: 0; width: 100%; height: 4px; background: #f0f0f0; z-index: 1; border-radius: 10px; }
        .timeline-progress { position: absolute; top: 20px; left: 0; height: 4px; background: #088178; z-index: 2; transition: 1s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 10px; }
        
        .timeline-step { position: relative; z-index: 3; text-align: center; width: 25%; }
        .timeline-step .icon { width: 45px; height: 45px; border-radius: 50%; background: #f0f0f0; color: #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 18px; border: 4px solid #fff; transition: 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .timeline-step.active .icon, .timeline-step.completed .icon { background: #088178; color: #fff; }
        .timeline-step div { font-size: 13px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .timeline-step.completed div, .timeline-step.active div { color: #088178; }

        .track-details { background: #f8fbfb; padding: 30px; border-radius: 15px; margin-top: 30px; border: 1px solid #eef2f2; }
        .track-details h4 { font-size: 18px; margin-bottom: 20px; color: #1a1a1a; border-bottom: 1px solid #eef2f2; padding-bottom: 10px; }
        .track-details p { margin: 12px 0; font-size: 15px; color: #444; display: flex; justify-content: space-between; }
        .track-details p strong { color: #777; font-weight: 500; }

        .status-cancelled { text-align: center; color: #dc3545; padding: 40px; border: 2px dashed #dc3545; border-radius: 15px; margin: 20px 0; }
        
        .btn-primary { display: inline-block; margin-top: 20px; padding: 15px 35px; background: #088178; color: #fff; border-radius: 10px; text-decoration: none; font-weight: 700; transition: 0.3s; }
        .btn-primary:hover { background: #06655e; transform: translateY(-2px); }
      `}} />

      <section className="section-p1">
        <div className="track-container">
          <h2>Track Your Order</h2>
          <TrackOrderClient initialOrder={order} />
        </div>
      </section>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
