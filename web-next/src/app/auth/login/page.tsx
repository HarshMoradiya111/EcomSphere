'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';

export default function LoginPage() {
  const router = useRouter();
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
    // Load Boxicons dynamically
    const link = document.createElement('link');
    link.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

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
        setSuccess('Account created! Please login.');
        setIsRegister(false);
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
    <div className="auth-body">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        :root {
          --white: #fff;
          --black: #000;
          --lightBlue: #17a;
          --primary: #088178;
        }

        .auth-body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
          display: grid;
          place-items: center;
          min-height: 100vh;
          background: #f0f2f5;
          padding: 20px;
        }

        .wrapper {
          position: relative;
          width: 750px;
          height: 520px;
          background: var(--white);
          border: 2px solid var(--black);
          border-radius: 12px;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .wrapper .form-box {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          display: flex;
          justify-content: center;
          flex-direction: column;
          overflow-y: auto;
        }

        .wrapper .form-box.login {
          left: 0;
          padding: 0 60px 0 40px;
          transition: 0.7s ease;
          transition-delay: 0.7s;
        }

        .wrapper.active .form-box.login {
          transform: translateX(-100%);
          transition-delay: 0s;
          opacity: 0;
        }

        .form-box h2 {
          margin-bottom: 25px;
          position: relative;
          font-size: 32px;
          font-weight: 800;
          color: var(--black);
          text-align: center;
        }

        .form-box h2::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 4px;
          background: var(--black);
        }

        .form-box .input-box {
          position: relative;
          width: 100%;
          height: 50px;
          margin: 20px 0;
        }

        .input-box input {
          width: 100%;
          height: 100%;
          background: transparent;
          color: var(--black);
          font-size: 15px;
          font-weight: 500;
          border: none;
          outline: none;
          border-bottom: 2px solid var(--black);
          transition: 0.5s;
          padding-right: 23px;
        }

        .input-box label {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          font-size: 15px;
          color: var(--black);
          pointer-events: none;
          transition: 0.5s;
        }

        .input-box input:focus ~ label,
        .input-box input:valid ~ label {
          top: -5px;
          color: var(--lightBlue);
          font-size: 12px;
        }

        .input-box i {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          font-size: 18px;
          transition: 0.5s;
        }

        .btn {
          width: 100%;
          height: 42px;
          background-color: var(--black);
          color: var(--white);
          border: none;
          outline: none;
          border-radius: 40px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: 0.3s;
          margin-top: 10px;
        }

        .btn:hover {
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
        }

        .forgot-link { margin: -10px 0 10px; text-align: right; }
        .forgot-link a { color: var(--lightBlue); font-size: 13px; text-decoration: none; }

        .linkTxt {
          font-size: 13px;
          color: var(--black);
          text-align: center;
          margin: 15px 0 8px;
        }

        .linkTxt p a {
          color: blue;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
        }

        .wrapper .info-text {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .wrapper .info-text.login {
          right: 0;
          text-align: right;
          padding: 0 40px 60px 150px;
          transition: 0.7s ease;
          transition-delay: 0.7s;
        }

        .wrapper.active .info-text.login {
          transform: translateX(100%);
          transition-delay: 0s;
          opacity: 0;
        }

        .wrapper .info-text h2 { font-size: 30px; color: var(--white); line-height: 1.3; text-transform: uppercase; }
        .wrapper .info-text p { font-size: 14px; color: var(--white); }

        .wrapper .rotate-bg {
          position: absolute;
          top: -4px;
          right: 0;
          width: 850px;
          height: 650px;
          background: #000;
          transform: rotate(10deg) skewY(40deg);
          transform-origin: bottom right;
          transition: 1.5s ease;
          transition-delay: 1.6s;
          z-index: -1;
        }

        .wrapper.active .rotate-bg {
          transform: rotate(0) skewY(0);
          transition-delay: 0.5s;
        }

        .wrapper .form-box.register {
          padding: 20px 40px 20px 60px;
          right: 0;
          transform: translateX(100%);
          transition: 0.7s ease;
          transition-delay: 0s;
          opacity: 0;
          pointer-events: none;
        }

        .wrapper.active .form-box.register {
          transform: translateX(0);
          transition-delay: 0.7s;
          opacity: 1;
          pointer-events: auto;
        }

        .wrapper .info-text.register {
          left: 0;
          text-align: left;
          padding: 0 150px 60px 40px;
          transform: translateX(-100%);
          transition: 0.7s ease;
          transition-delay: 0s;
          opacity: 0;
          pointer-events: none;
        }

        .wrapper.active .info-text.register {
          transform: translateX(0);
          transition-delay: 0.7s;
          opacity: 1;
          pointer-events: auto;
        }

        .wrapper .rotate-bg2 {
          position: absolute;
          top: 100%;
          left: 250px;
          width: 850px;
          height: 700px;
          background: var(--white);
          transform: rotate(0) skewY(0);
          transform-origin: bottom left;
          transition: 1.5s ease;
          transition-delay: 0.5s;
          z-index: -1;
        }

        .wrapper.active .rotate-bg2 {
          transform: rotate(-11deg) skewY(-40deg);
          transition-delay: 1.2s;
        }

        .alert {
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 15px;
          font-size: 13px;
          text-align: center;
        }
        .alert-danger { background: #ffebee; color: #c62828; }
        .alert-success { background: #e8f5e9; color: #2e7d32; }

        @media (max-width: 768px) {
          .wrapper { width: 100%; max-width: 380px; height: auto; min-height: 550px; }
          .wrapper .rotate-bg, .wrapper .rotate-bg2 { display: none; }
          .wrapper .info-text { display: none; }
          .wrapper .form-box { width: 100%; padding: 40px 20px; position: relative; transform: none !important; opacity: 1 !important; pointer-events: auto !important; }
          .wrapper.active .form-box.login { display: none; }
          .wrapper:not(.active) .form-box.register { display: none; }
        }
      `}</style>

      <div className={`wrapper ${isRegister ? 'active' : ''}`}>
        <span className="rotate-bg"></span>
        <span className="rotate-bg2"></span>

        {/* Login Form */}
        <div className="form-box login">
          <h2 className="title">Login</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-box">
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required 
              />
              <label>Email</label>
              <i className='bx bxs-envelope'></i>
            </div>

            <div className="input-box">
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required 
              />
              <label>Password</label>
              <i className='bx bxs-lock-alt'></i>
            </div>

            <div className="forgot-link">
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Processing...' : 'Login'}
            </button>

            <div className="social-login" style={{ marginTop: '15px', textAlign: 'center' }}>
              <p style={{ marginBottom: '10px', fontSize: '12px' }}>Or sign in with</p>
              <a href="#" className="google-btn" style={{ 
                background: '#f1f1f1', color: '#444', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', gap: '10px', textDecoration: 'none', fontSize: '14px',
                fontWeight: '600', borderRadius: '40px', height: '40px' 
              }}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="16" />
                Google
              </a>
            </div>

            <div className="linkTxt">
              <p>Don't have an account? <a onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}>Sign Up</a></p>
            </div>
          </form>
        </div>

        <div className="info-text login">
          <h2>Welcome Back!</h2>
          <p>Shop the latest trends with EcomSphere. Sign in to access your cart, orders, and profile.</p>
        </div>

        {/* Register Form */}
        <div className="form-box register">
          <h2 className="title">Sign Up</h2>
          <form onSubmit={handleRegister}>
            <div className="input-box">
              <input 
                type="text" 
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required 
              />
              <label>Username</label>
              <i className='bx bxs-user'></i>
            </div>

            <div className="input-box">
              <input 
                type="email" 
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required 
              />
              <label>Email</label>
              <i className='bx bxs-envelope'></i>
            </div>

            <div className="input-box">
              <input 
                type="password" 
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required 
              />
              <label>Password</label>
              <i className='bx bxs-lock-alt'></i>
            </div>

            <div className="input-box">
              <input 
                type="password" 
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                required 
              />
              <label>Confirm Password</label>
              <i className='bx bxs-lock-alt'></i>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </button>

            <div className="linkTxt">
              <p>Already have an account? <a onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}>Login</a></p>
            </div>
          </form>
        </div>

        <div className="info-text register">
          <h2>Join EcomSphere!</h2>
          <p>Create your account and start shopping from our premium collection today.</p>
        </div>
      </div>
    </div>
  );
}
