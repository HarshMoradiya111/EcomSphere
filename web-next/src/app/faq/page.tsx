import type { Metadata } from 'next';
import { getFaqs } from '@/lib/api/faq';
import FaqClient from '@/components/faq/FaqClient';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';

export const metadata: Metadata = {
  title: 'FAQ | EcomSphere',
  description: 'Find answers to frequently asked questions about orders, shipping, returns, and more.',
};

export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  let groupedFaqs = {};
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();

  try {
    groupedFaqs = await getFaqs();
  } catch (err) {
    console.error('[FaqPage] fetch error:', err);
  }

  return (
    <>
      <HeaderPartial 
        activePage="faq" 
        sessionUser={sessionUser} 
        settings={settings} 
      />
      
      <main style={{ backgroundColor: '#fcfcfc', minHeight: '80vh' }}>
        {/* Modern Hero Section */}
        <section style={{
          backgroundImage: 'linear-gradient(rgba(4, 30, 66, 0.8), rgba(4, 30, 66, 0.8)), url("/img/about/banner.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '100px 20px',
          textAlign: 'center',
          color: '#fff'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '900',
            marginBottom: '15px',
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: '-1px'
          }}>#HaveQuestions?</h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: '0.9',
            fontFamily: "'Poppins', sans-serif",
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Find answers to common queries about our shop and services.
          </p>
        </section>

        <FaqClient groupedFaqs={groupedFaqs} />
      </main>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
