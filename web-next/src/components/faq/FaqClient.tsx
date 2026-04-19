'use client';

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
      style={{
        border: '1px solid #e1e1e1',
        borderRadius: '12px',
        marginBottom: '15px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        background: '#fff',
        cursor: 'pointer',
        boxShadow: open ? '0 10px 20px rgba(0,0,0,0.05)' : 'none',
        borderColor: open ? '#088178' : '#e1e1e1'
      }}
    >
      <div className="faq-question" style={{
        padding: '20px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: '600',
        fontSize: '17px',
        color: open ? '#088178' : '#1a1a1a',
        fontFamily: "'Poppins', sans-serif"
      }}>
        <span>{question}</span>
        <svg
          className={`faq-chevron ${open ? 'faq-chevron--open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transition: 'transform 0.3s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            color: open ? '#088178' : '#999'
          }}
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="faq-answer-wrapper" style={{ 
        maxHeight: open ? '1000px' : '0',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: open ? 1 : 0
      }}>
        <div className="faq-answer" style={{
          padding: '0 25px 20px',
          color: '#555',
          lineHeight: '1.8',
          fontSize: '15px',
          fontFamily: "'Poppins', sans-serif"
        }}>
          {answer}
        </div>
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
    <div className="faq-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Search */}
      <div className="faq-search" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        border: '2px solid #eee',
        borderRadius: '50px',
        padding: '15px 25px',
        marginBottom: '50px',
        background: '#fff',
        transition: 'all 0.3s ease',
        boxShadow: '0 5px 15px rgba(0,0,0,0.02)'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#088178' }}>
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search for answers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            background: 'transparent',
            color: '#1a1a1a',
            fontFamily: "'Poppins', sans-serif"
          }}
          aria-label="Search FAQs"
        />
        {search && (
          <button 
            onClick={() => setSearch('')} 
            style={{
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#666',
              fontSize: '12px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Categories */}
      {isEmpty ? (
        <div className="faq-empty" style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>
          <i className="fa-solid fa-face-meh" style={{ fontSize: '50px', marginBottom: '20px', display: 'block' }}></i>
          <p style={{ fontSize: '18px', fontFamily: "'Poppins', sans-serif" }}>No results for "{search}". Try a different term.</p>
        </div>
      ) : (
        Object.entries(filtered).map(([category, faqs]) => (
          <div key={category} className="faq-category" style={{ marginBottom: '50px' }}>
            <h2 className="faq-category-title" style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '25px',
              color: '#1a1a1a',
              borderBottom: '2px solid #088178',
              display: 'inline-block',
              paddingBottom: '8px',
              fontFamily: "'Poppins', sans-serif"
            }}>{category}</h2>
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
