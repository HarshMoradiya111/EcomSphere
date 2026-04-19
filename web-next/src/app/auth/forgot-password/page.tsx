'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/config';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // The backend view route expects form data or JSON
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Since the backend might redirect or return flash messages in HTML, 
      // we handle the response carefully. For a headless API approach, 
      // the backend would return JSON. Assuming it's still EJS-based:
      if (response.ok) {
        setMessage({ type: 'success', text: "If an account exists with that email, a reset link has been sent." });
      } else {
        setMessage({ type: 'error', text: "No account found with that email address." });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderPartial />

      {/* Page Wrapper */}
      <div
        style={{
          minHeight: 'calc(100vh - 200px)',
          background: 'linear-gradient(135deg, #f7f8fc 0%, #e8f8f7 50%, #f7f8fc 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 20px',
        }}
      >
        {/* Decorative blob */}
        <div
          style={{
            position: 'fixed',
            top: '-120px',
            right: '-120px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(8,129,120,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Card */}
        <div
          className="fade-in-up"
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #edf2f7',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(8,129,120,0.06)',
            width: '100%',
            maxWidth: '460px',
            padding: '48px 44px',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #088178, #06a899, #088178)',
              borderRadius: '20px 20px 0 0',
            }}
          />

          {/* Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #088178, #06a899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(8,129,120,0.25)',
            }}
          >
            <i className="fa-solid fa-lock" style={{ fontSize: '26px', color: '#fff' }} />
          </div>

          {/* Heading */}
          <h2
            style={{
              textAlign: 'center',
              fontSize: '26px',
              fontWeight: 800,
              color: '#1a1a2e',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px',
            }}
          >
            Forgot Password?
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: '#718096',
              fontSize: '14px',
              lineHeight: 1.6,
              margin: '0 0 32px 0',
            }}
          >
            Enter your email and we&apos;ll send you a secure reset link right away.
          </p>

          {/* Flash Message */}
          {message && (
            <div
              className="fade-in"
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                marginBottom: '24px',
                fontSize: '13.5px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: message.type === 'success' ? '#d4f5f0' : '#fde8ea',
                border: `1px solid ${message.type === 'success' ? '#a8e6df' : '#f5c6cb'}`,
                color: message.type === 'success' ? '#0a5c55' : '#922b35',
              }}
            >
              <i
                className={`fa-solid fa-${message.type === 'success' ? 'circle-check' : 'circle-exclamation'}`}
                style={{ flexShrink: 0, fontSize: '15px' }}
              />
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="forgot-email"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#718096',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '8px',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fa-regular fa-envelope"
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#a0aec0',
                    fontSize: '14px',
                  }}
                />
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  className="modern-input"
                  placeholder="yourname@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                fontSize: '15px',
                fontWeight: 700,
                padding: '15px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                border: 'none',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '28px 0 24px',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#edf2f7' }} />
            <span style={{ fontSize: '12px', color: '#a0aec0', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#edf2f7' }} />
          </div>

          {/* Back to login */}
          <p style={{ textAlign: 'center', margin: 0, fontSize: '14px', color: '#718096' }}>
            Remember your password?{' '}
            <Link
              href="/auth/login"
              style={{
                color: '#088178',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
            >
              Back to Login →
            </Link>
          </p>
        </div>
      </div>

      <FooterPartial />
    </>
  );
}
