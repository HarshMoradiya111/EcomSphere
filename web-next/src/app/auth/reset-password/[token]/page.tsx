'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match" });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: "Password reset successful! Redirecting to login..." });
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setMessage({ type: 'error', text: "Invalid or expired reset link" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Password reset failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderPartial />
      <style jsx>{`
        .reset-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 200px);
          background: #f0f2f5;
          padding: 40px 20px;
        }
        .reset-box {
          background: #fff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 440px;
        }
        .reset-box h2 { text-align: center; margin-bottom: 20px; color: #222; }
        .input-field {
          width: 100%;
          padding: 14px;
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

      <div className="reset-container">
        <div className="reset-box">
          <h2>🔒 Reset Password</h2>

          {message && (
            <div className={`flash-msg flash-${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="New Password (min 6 chars)"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              name="confirmPassword"
              className="input-field"
              placeholder="Confirm New Password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
      <FooterPartial />
    </>
  );
}
