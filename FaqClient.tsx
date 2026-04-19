'use client';

// web-next/src/components/faq/FaqClient.tsx
import { useState, useMemo } from 'react';
import type { GroupedFaqs } from '@/lib/api/faq';

interface Props {
  groupedFaqs: GroupedFaqs;
}

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`faq-item ${open ? 'faq-item--open' : ''}`}
      onClick={() => setOpen(!open)}
    >
      <div className="faq-question">
        <span>{question}</span>
        <svg
          className={`faq-chevron ${open ? 'faq-chevron--open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="faq-answer-wrapper" style={{ maxHeight: open ? '500px' : '0' }}>
        <div className="faq-answer">{answer}</div>
      </div>
    </div>
  );
}

export default function FaqClient({ groupedFaqs }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo<GroupedFaqs>(() => {
    if (!search.trim()) return groupedFaqs;
    const q = search.toLowerCase();
    const result: GroupedFaqs = {};
    for (const [cat, faqs] of Object.entries(groupedFaqs)) {
      const matches = faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      );
      if (matches.length) result[cat] = matches;
    }
    return result;
  }, [search, groupedFaqs]);

  const isEmpty = Object.keys(filtered).length === 0;

  return (
    <div className="faq-container">
      {/* Search */}
      <div className="faq-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search for answers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="faq-search-input"
          aria-label="Search FAQs"
        />
        {search && (
          <button className="faq-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      {/* Categories */}
      {isEmpty ? (
        <div className="faq-empty">
          <p>No results for &quot;{search}&quot;. Try a different term.</p>
        </div>
      ) : (
        Object.entries(filtered).map(([category, faqs]) => (
          <div key={category} className="faq-category">
            <h2 className="faq-category-title">{category}</h2>
            <div className="faq-list">
              {faqs.map((faq) => (
                <AccordionItem key={faq._id} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
