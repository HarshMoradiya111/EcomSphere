'use client';

import { useEffect, useState } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3000/api/v1/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to access customer nodes');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('🚨 CRITICAL: This will purge the customer profile and all associated link-data. Proceed?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/v1/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== id));
      }
    } catch (err) {
      console.error('Purge failed');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-emerald-400 font-black uppercase tracking-widest text-xs">Scanning Customer Nodes...</div>;

  return (
    <div className="p-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      <header className="mb-16">
          <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-emerald-400">
             <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Identity Management
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter italic">Customer <span className="text-emerald-400 not-italic">Profiles</span></h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Manage global user identities and access tiers</p>
      </header>

      <div className="bg-slate-800/10 backdrop-blur-3xl rounded-[4rem] border border-slate-700/30 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/50 bg-slate-900/30">
              <th className="px-10 py-10 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Identity Hub</th>
              <th className="px-10 py-10 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Access Endpoint (Email)</th>
              <th className="px-10 py-10 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Tier Status</th>
              <th className="px-10 py-10 text-right text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Lifecycle Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {users.map((u) => (
              <tr key={u._id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-10 py-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400">
                         {u.username?.[0] || 'U'}
                      </div>
                      <span className="text-lg font-black text-white uppercase tracking-tighter">{u.username}</span>
                   </div>
                </td>
                <td className="px-10 py-10 font-bold text-slate-400 font-mono text-sm uppercase">{u.email}</td>
                <td className="px-10 py-10">
                   <span className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                      {u.role || 'customer'}
                   </span>
                </td>
                <td className="px-10 py-10 text-right">
                   <button 
                      onClick={() => deleteUser(u._id)}
                      className="px-8 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-2xl font-black text-[10px] uppercase tracking-widest"
                   >
                      Purge Identity
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
