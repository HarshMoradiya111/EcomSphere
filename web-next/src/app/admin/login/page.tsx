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
        // Store JWT token for subsequent API calls
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Identity Verification Failed');
      }
    } catch (err) {
      setError('Firewall/Connection Error. Check Backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_50%)]"></div>
        
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-3xl border border-slate-800/50 p-12 rounded-[3.5rem] shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
            <header className="text-center mb-10">
                <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-4">Secure Terminal</div>
                <h1 className="text-4xl font-black text-white tracking-tighter">EcomSphere <span className="text-cyan-500 italic">Auth</span></h1>
                <p className="text-slate-500 mt-2 font-medium">Restricted Access: Administrators Only</p>
            </header>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Username</label>
                    <input 
                        type="text" 
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder-slate-700 focus:border-cyan-500 outline-none transition-all"
                        placeholder="Enter credentials..."
                    />
                </div>

                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Security Key</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder-slate-700 focus:border-cyan-500 outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center animate-shake">
                        ⚠️ {error}
                    </div>
                )}

                <button 
                    disabled={loading}
                    className="w-full py-5 bg-white text-black font-black rounded-3xl hover:bg-cyan-400 transition-all uppercase tracking-tighter shadow-xl hover:shadow-cyan-500/20 disabled:opacity-50"
                >
                    {loading ? 'Decrypting Access...' : 'Authenticate'}
                </button>
            </form>

            <footer className="mt-12 text-center border-t border-slate-800/50 pt-8">
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Protection Level: Tier 3</p>
                <div className="flex justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/20"></div>
                </div>
            </footer>
        </div>
    </div>
  );
}
