'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/src/config';

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
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-[20px] font-sans">
      <div className="w-full max-w-[420px] bg-[#1e293b] p-[48px_40px] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <div className="text-center mb-[30px]">
          <div className="text-[40px] mb-[8px]">🛍️</div>
          <h2 className="text-[#ffd700] text-[26px] font-[700]">EcomSphere Admin</h2>
          <p className="text-[#94a3b8] text-[14px]">Sign in to manage your store</p>
        </div>

        {error && (
          <div className="bg-[rgba(220,53,69,0.15)] border border-[#dc3545] text-[#ff6b6b] p-[10px_14px] rounded-[8px] mb-[15px] text-[14px]">
            <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col">
          <label className="block text-[#cbd5e1] text-[13px] font-[600] mb-[6px] uppercase tracking-[0.5px]">Username</label>
          <input 
            type="text" 
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-[13px_16px] border border-[#334155] bg-[#0f172a] text-[#f1f5f9] rounded-[8px] text-[15px] mb-[18px] focus:border-[#ffd700] outline-none transition-all"
            placeholder="admin"
          />

          <label className="block text-[#cbd5e1] text-[13px] font-[600] mb-[6px] uppercase tracking-[0.5px]">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-[13px_16px] border border-[#334155] bg-[#0f172a] text-[#f1f5f9] rounded-[8px] text-[15px] mb-[18px] focus:border-[#ffd700] outline-none transition-all"
            placeholder="••••••••"
          />

          <button 
            disabled={loading}
            className="w-full p-[15px] bg-[#ffd700] text-[#0f172a] border-none rounded-[8px] text-[16px] font-[700] cursor-pointer hover:bg-[#f0c800] transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-right-to-bracket"></i> {loading ? 'Checking...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-[20px]">
          <a href="/" className="text-[#64748b] text-[13px] hover:text-[#ffd700] transition-all">
            <i className="fa-solid fa-arrow-left"></i> Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}
