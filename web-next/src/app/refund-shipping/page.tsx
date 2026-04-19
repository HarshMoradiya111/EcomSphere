import type { Metadata } from 'next';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';

export const metadata: Metadata = {
  title: 'Refund & Shipping Policy | EcomSphere',
};

export default async function RefundPage() {
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();

  return (
    <>
      <HeaderPartial activePage="" sessionUser={sessionUser} settings={settings} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .legal-content { max-width: 800px; margin: 60px auto; padding: 0 20px; line-height: 1.8; color: #444; font-family: 'Poppins', sans-serif; }
        .legal-content h1 { font-size: 36px; color: #1a1a1a; margin-bottom: 30px; font-weight: 800; }
        .legal-content h2 { font-size: 22px; color: #088178; margin-top: 40px; margin-bottom: 15px; font-weight: 700; }
        .legal-content p { margin-bottom: 20px; font-size: 15px; }
        .legal-content ul { margin-bottom: 25px; padding-left: 20px; list-style: none; }
        .legal-content li { margin-bottom: 12px; position: relative; padding-left: 25px; font-size: 15px; }
        .legal-content li::before { content: "→"; position: absolute; left: 0; color: #088178; font-weight: 700; }
        .last-updated { font-style: italic; color: #888; margin-bottom: 10px; font-size: 14px; }
        
        #page-header.policy-bg { background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/img/about/banner.png'); background-size: cover; height: 35vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: #fff; padding: 14px; }
        #page-header h2 { font-size: 3.5rem; font-weight: 800; }
        #page-header p { font-size: 1.2rem; }
      `}} />

      <section id="page-header" className="policy-bg">
        <h2>#ReliableService</h2>
        <p>Learn about our shipping procedures and return policies</p>
      </section>

      <div className="legal-content">
        <p className="last-updated">Last Updated: April 3, 2026</p>
        
        <h1>Refund & Shipping Policy</h1>
        
        <p>At EcomSphere, we aim to provide a seamless and satisfying shopping experience. If you are not completely satisfied with your purchase, we are here to help.</p>

        <h2>1. Shipping Policy</h2>
        <p>We process and ship orders as quickly as possible. Most orders are dispatched within 24-48 hours of placement.</p>
        <ul>
          <li>Standard shipping: 3-5 business days.</li>
          <li>Express shipping: 1-2 business days.</li>
          <li>Shipping costs are calculated at checkout and are free for orders over ₹999.</li>
          <li>A tracking ID will be shared for all orders via email/SMS.</li>
        </ul>

        <h2>2. Return & Exchange Policy</h2>
        <p>Our returns policy is valid for 7 days from the date of delivery. If 7 days have passed since your delivery, we cannot offer you a refund or exchange.</p>
        <ul>
          <li>Items must be unused, in the original condition, and in their original packaging with all tags intact.</li>
          <li>Certain items (e.g., innerwear, cosmetics, personalized items) are not eligible for return due to hygiene reasons.</li>
          <li>Return requests can be initiated from the "My Orders" section in your profile.</li>
        </ul>

        <h2>3. Refunds</h2>
        <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original method of payment within 5-7 business days.</p>

        <h2>4. Damaged or Defective Items</h2>
        <p>If you receive a damaged or defective item, please contact our support team immediately (within 24 hours of delivery) with photos of the product and the packaging. We will provide a free replacement or a full refund.</p>

        <h2>Contact Us</h2>
        <p>If you have any questions regarding our shipping and refund policy, you may contact us at support@ecomsphere.com.</p>
      </div>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
