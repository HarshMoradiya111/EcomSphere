'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/config';
import './auth.css';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const authError = searchParams.get('error');

    if (token) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      
      setSuccess('Logged in via Google! Redirecting...');
      window.location.href = '/'; 
    }

    if (authError) {
      setError(authError);
    }

    if (!document.querySelector('link[href*="boxicons"]')) {
      const link = document.createElement('link');
      link.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `token=${data.token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
        window.location.href = '/'; 
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (data.success) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `token=${data.token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => { window.location.href = '/'; }, 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className={`wrapper ${isRegister ? 'active' : ''}`}>
        <span className="rotate-bg"></span>
        <span className="rotate-bg2"></span>

        <div className="form-box login">
          <h2 className="title animation" style={{ "--i": 0, "--j": 21 } as any}>Login</h2>
          {error && <div className="auth-alert auth-alert-danger">{error}</div>}
          {success && <div className="auth-alert auth-alert-success">{success}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="input-box animation" style={{ "--i": 1, "--j": 22 } as any}>
              <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="email" />
              <label>Email</label>
              <i className='bx bxs-envelope'></i>
            </div>

            <div className="input-box animation" style={{ "--i": 2, "--j": 23 } as any}>
              <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoComplete="current-password" />
              <label>Password</label>
              <i className='bx bxs-lock-alt'></i>
            </div>

            <button type="submit" className="auth-btn animation" style={{ "--i": 4, "--j": 25 } as any} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="social-login animation" style={{ "--i": 5, "--j": 26, marginTop: '15px', textAlign: 'center' } as any}>
              <p style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>Or sign in with</p>
              <a href={`${API_URL}/api/v1/auth/google`} className="google-btn" style={{ 
                background: '#f1f1f1', color: '#444', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', gap: '10px', textDecoration: 'none', fontSize: '14px',
                fontWeight: '600', borderRadius: '40px', height: '40px' 
              }}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="16" />
                Google
              </a>
            </div>

            <div className="logreg-link animation" style={{ "--i": 6, "--j": 27 } as any}>
              <p>Don't have an account? <a href="#" className="register-link" onClick={(e) => { e.preventDefault(); setIsRegister(true); }}>Sign Up</a></p>
            </div>
          </form>
        </div>

        <div className="info-text login">
          <h2 className="animation" style={{ "--i": 0, "--j": 20 } as any}>Welcome Back!</h2>
          <p className="animation" style={{ "--i": 1, "--j": 21 } as any}>Log in to access your orders, wishlist, and personalized recommendations.</p>
        </div>

        <div className="form-box register">
          <h2 className="title animation" style={{ "--i": 17, "--j": 0 } as any}>Sign Up</h2>
          <form onSubmit={handleRegister}>
            <div className="input-box animation" style={{ "--i": 18, "--j": 1 } as any}>
              <input type="text" required value={regUsername} onChange={(e) => setRegUsername(e.target.value)} autoComplete="username" />
              <label>Username</label>
              <i className='bx bxs-user'></i>
            </div>

            <div className="input-box animation" style={{ "--i": 19, "--j": 2 } as any}>
              <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} autoComplete="email" />
              <label>Email</label>
              <i className='bx bxs-envelope'></i>
            </div>

            <div className="input-box animation" style={{ "--i": 20, "--j": 3 } as any}>
              <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} autoComplete="new-password" />
              <label>Password</label>
              <i className='bx bxs-lock-alt'></i>
            </div>

            <div className="input-box animation" style={{ "--i": 20, "--j": 4 } as any}>
              <input type="password" required value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} autoComplete="new-password" />
              <label>Confirm Password</label>
              <i className='bx bxs-lock-alt'></i>
            </div>

            <button type="submit" className="auth-btn animation" style={{ "--i": 21, "--j": 5 } as any} disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="logreg-link animation" style={{ "--i": 22, "--j": 6 } as any}>
              <p>Already have an account? <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); setIsRegister(false); }}>Login</a></p>
            </div>
          </form>
        </div>

        <div className="info-text register">
          <h2 className="animation" style={{ "--i": 17, "--j": 0 } as any}>Join Us Today!</h2>
          <p className="animation" style={{ "--i": 18, "--j": 1 } as any}>Create an account to track your orders, save items to your wishlist, and enjoy a seamless shopping experience.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
