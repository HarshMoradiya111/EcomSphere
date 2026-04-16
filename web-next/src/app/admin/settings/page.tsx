'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/config';
import { getImageUrl } from '@/utils/imagePaths';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    hours: '',
    email: '',
    logo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/admin/settings`);
        const data = await res.json();
        if (data.success) {
          setFormData(data.settings);
        }
      } catch (err) {
        console.error('Core sync failed');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formDataPayload = new FormData();
    formDataPayload.append('address', formData.address);
    formDataPayload.append('phone', formData.phone);
    formDataPayload.append('email', formData.email);
    formDataPayload.append('hours', formData.hours);
    if (logoFile) formDataPayload.append('logo', logoFile);

    try {
      await fetch(`${API_URL}/api/v1/admin/settings`, {
        method: 'PUT',
        body: formDataPayload,
      });
      alert('Global Cluster Synchronized ✅');
    } catch (err) {
      console.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 uppercase font-black tracking-widest text-xs">Accessing System Core...</div>;

  return (
    <div className="p-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
      <header className="mb-16">
          <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-rose-400">
             <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span> Global Configuration
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter">System <span className="text-slate-500">Core</span></h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Modify global website attributes and contact routing</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-slate-800/10 backdrop-blur-3xl p-12 rounded-[4rem] border border-slate-700/30 space-y-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Headquarters Address</label>
                  <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-bold focus:border-rose-500 outline-none transition-all shadow-inner"
                  />
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Contact Line</label>
                  <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-bold focus:border-rose-500 outline-none transition-all shadow-inner"
                  />
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Support Email</label>
                  <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-bold focus:border-rose-500 outline-none transition-all shadow-inner"
                  />
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Hours</label>
                  <input 
                      type="text" 
                      value={formData.hours}
                      onChange={(e) => setFormData({...formData, hours: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-bold focus:border-rose-500 outline-none transition-all shadow-inner"
                  />
              </div>

              <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Asset (Logo)</label>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex items-center justify-between">
                      <input 
                          type="file" 
                          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                          className="text-slate-400 text-xs font-bold"
                          accept="image/*"
                      />
                      {formData.logo && (
                          <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-slate-600 uppercase">Current Profile:</span>
                              <img src={getImageUrl(formData.logo)} className="h-10 w-auto rounded border border-slate-700" alt="Current Logo" />
                          </div>
                      )}
                  </div>
              </div>
          </div>

          <div className="pt-8 border-t border-slate-800/50 flex justify-end">
              <button 
                  type="submit"
                  disabled={saving}
                  className="px-12 py-5 bg-white text-black font-black rounded-3xl hover:bg-rose-500 hover:text-white transition-all uppercase tracking-tighter shadow-xl disabled:opacity-50"
              >
                  {saving ? 'Syncing...' : 'Commit Changes'}
              </button>
          </div>
      </form>
    </div>
  );
}
