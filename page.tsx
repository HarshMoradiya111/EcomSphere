// web-next/src/app/faq/page.tsx
import type { Metadata } from 'next';
import { getFaqs } from '@/lib/api/faq';
import FaqClient from '@/components/faq/FaqClient';

export const metadata: Metadata = {
  title: 'FAQ | Your Store Name',
  description: 'Find answers to frequently asked questions about orders, shipping, returns, and more.',
};

export default async function FaqPage() {
  let groupedFaqs = {};

  try {
    groupedFaqs = await getFaqs();
  } catch (err) {
    console.error('[FaqPage] fetch error:', err);
    // Renders empty state — no hard crash
  }

  return (
    <main className="faq-page">
      <div className="faq-hero">
        <h1 className="faq-hero-title">Frequently Asked Questions</h1>
        <p className="faq-hero-subtitle">
          Can&apos;t find an answer? <a href="/contact">Contact our support team</a>.
        </p>
      </div>

      <FaqClient groupedFaqs={groupedFaqs} />
    </main>
  );
}
