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
      <style jsx>{`
        .forgot-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 200px);
          background: #f0f2f5;
          padding: 40px 20px;
        }
        .forgot-box {
          background: #fff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 440px;
        }
        .forgot-box h2 { text-align: center; margin-bottom: 20px; color: #222; }
        .forgot-box p { text-align: center; color: #888; margin-bottom: 24px; }
        .input-field {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 15px;
          margin-bottom: 16px;
          box-sizing: border-box;
          transition: border 0.3s;
        }
        .input-field:focus { border-color: #088178; outline: none; }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #088178;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }
        .submit-btn:hover { background: #066b64; }
        .submit-btn:disabled { background: #ccc; cursor: not-allowed; }
        .back-link { text-align: center; margin-top: 18px; }
        .back-link a { color: #088178; text-decoration: none; font-weight: 600; }
        .flash-msg {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 14px;
        }
        .flash-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .flash-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
      `}</style>

      <div className="forgot-container">
        <div className="forgot-box">
          <h2>🔐 Forgot Password</h2>
          <p>Enter your email address and we'll send you a reset link.</p>

          {message && (
            <div className={`flash-msg flash-${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              name="email" 
              className="input-field" 
              placeholder="Your email address" 
              required 
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          
          <div className="back-link">
            <p><Link href="/auth/login">← Back to Login</Link></p>
          </div>
        </div>
      </div>
      <FooterPartial />
    </>
  );
}
