'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PublicLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.error || 'Identity Verification Failed');
      }
    } catch (err) {
      setError('Connection Timeout. Check Server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans">
      <div className="w-full max-w-sm">
          <header className="mb-12">
            <h1 className="text-5xl font-black text-teal-950 tracking-tighter">Welcome <span className="text-teal-600">Back.</span></h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Access your EcomSphere profile</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
              <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                  <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 text-teal-950 font-bold focus:border-teal-600 outline-none transition-all placeholder:text-gray-300"
                      placeholder="you@domain.com"
                  />
              </div>

              <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Security Shield: Password</label>
                  <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 text-teal-950 font-bold focus:border-teal-600 outline-none transition-all placeholder:text-gray-300"
                      placeholder="••••••••"
                  />
              </div>

              {error && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 text-[10px] font-black text-center uppercase tracking-widest italic animate-pulse">
                      ⚠️ {error}
                  </div>
              )}

              <button 
                  disabled={loading}
                  className="w-full py-5 bg-teal-950 text-white font-black rounded-3xl hover:bg-teal-600 transition-all uppercase tracking-widest text-[10px] shadow-2xl"
              >
                  {loading ? 'Verifying...' : 'Sign In'}
              </button>
          </form>

          <footer className="mt-12 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              New prospect? <Link href="/register" className="text-teal-600 hover:underline">Apply for Membership</Link>
          </footer>
      </div>
    </div>
  );
}
