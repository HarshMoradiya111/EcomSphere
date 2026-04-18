'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Identity Verification Failed');
      }
    } catch (err) {
      setError('Connection failure. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 bg-dark d-flex align-items-center justify-content-center p-3">
      <div className="card border-0 shadow-lg p-4 p-md-5 w-100 bg-dark text-light" style={{ maxWidth: '420px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <div className="display-4 mb-2">🛍️</div>
          <h2 className="fs-3 fw-bold text-warning mb-1">EcomSphere Admin</h2>
          <p className="text-muted small">Sign in to manage your store</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-3 py-2 px-3 small" role="alert">
            <i className="fa-solid fa-circle-exclamation me-2"></i> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="d-flex flex-column">
          <label className="form-label text-light fw-bold small text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Username</label>
          <input 
            type="text" 
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control bg-dark text-light border-secondary mb-3 py-2"
            placeholder="admin"
          />

          <label className="form-label text-light fw-bold small text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control bg-dark text-light border-secondary mb-4 py-2"
            placeholder="••••••••"
          />

          <button 
            disabled={loading}
            className="btn btn-warning w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
          >
            <i className="fa-solid fa-right-to-bracket"></i> {loading ? 'Checking...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/" className="text-muted text-decoration-none small transition-all">
            <i className="fa-solid fa-arrow-left me-1"></i> Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}
