'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';
import { getImageUrl } from '@/utils/imagePaths';

export default function MarketingEngine() {
  const router = useRouter();
  const [banners, setBanners] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', buttonText: 'Shop Now', buttonLink: '/shop' });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [flashSaleForm, setFlashSaleForm] = useState({ title: '', discountText: '', endTime: '', isActive: true });

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [bRes, fRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/admin/banners`, { headers }),
        fetch(`${API_URL}/api/v1/admin/flash-sale`, { headers }),
        fetch(`${API_URL}/api/v1/admin/subscribers`, { headers })
      ]);

      const [bData, fData, sData] = await Promise.all([bRes.json(), fRes.json(), sRes.json()]);
      
      if (bData.success) setBanners(bData.banners);
      if (fData.success) setFlashSales(fData.flashSales);
      if (sData.success) setSubscribers(sData.subscribers);
    } catch (err) {
      console.error('Core sync failed', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('title', bannerForm.title);
    formData.append('subtitle', bannerForm.subtitle);
    formData.append('buttonText', bannerForm.buttonText);
    formData.append('buttonLink', bannerForm.buttonLink);
    if (bannerFile) formData.append('image', bannerFile);

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/banners`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setBannerForm({ title: '', subtitle: '', buttonText: 'Shop Now', buttonLink: '/shop' });
        setBannerFile(null);
        fetchData();
      }
    } catch (err) {
      console.error('Deployment failed', err);
    }
  };

  const deleteBanner = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/banners/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Purge failed', err);
    }
  };

  const handleFlashSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/flash-sale`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(flashSaleForm)
      });
      if (res.ok) {
        alert('Campaign Initialized 🕒');
        fetchData();
      }
    } catch (err) {
      console.error('Initialization failed', err);
    }
  };

  const deleteSubscriber = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/subscribers/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Purge failed', err);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Marketing Stream...</p>
      </div>
    </div>
  );

  return (
    <div className="p-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-cyan-500">
           <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span> Campaign Management
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase">Marketing <span className="text-cyan-400 not-italic">Engine</span></h1>
        <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-widest text-xs">Orchestrate global hero banners and flash sale pulses</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Banner Control Hub */}
        <section className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 pb-4 border-b border-slate-800/50">Hero Banners</h2>
          <form onSubmit={handleBannerSubmit} className="space-y-6 mb-12">
             <div className="grid grid-cols-2 gap-6">
                <input 
                  type="text" placeholder="Campaign Title" required value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
                />
                <input 
                  type="text" placeholder="Subtitle / Promo Code" required value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
                />
             </div>
             <div className="grid grid-cols-2 gap-6">
                <input 
                  type="text" placeholder="Button Text" value={bannerForm.buttonText} onChange={e => setBannerForm({...bannerForm, buttonText: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
                />
                <input 
                  type="text" placeholder="Redirect Link" value={bannerForm.buttonLink} onChange={e => setBannerForm({...bannerForm, buttonLink: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
                />
             </div>
             <div className="relative group overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all hover:border-cyan-500/50">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 px-1">High-Res Asset Upload</label>
                <input 
                  type="file" 
                  onChange={e => setBannerFile(e.target.files?.[0] || null)} 
                  className="text-slate-400 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer" 
                />
             </div>
             <button type="submit" className="w-full py-5 bg-cyan-500 text-slate-950 font-black rounded-3xl hover:bg-white transition-all uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/20">
               Deploy New Hero Asset
             </button>
          </form>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
            {banners.map((b, idx) => (
              <div key={idx} className="flex gap-6 p-4 rounded-3xl bg-slate-900 border border-slate-800 group transition-all hover:border-cyan-500">
                <div className="w-32 h-20 rounded-2xl overflow-hidden border border-slate-800 shadow-inner shrink-0">
                   <img src={getImageUrl(b.image)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="banner" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-black text-sm uppercase tracking-tighter">{b.title}</h4>
                  <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{b.subtitle}</p>
                </div>
                <button onClick={() => deleteBanner(b._id)} className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">🗑️</button>
              </div>
            ))}
          </div>
        </section>

        {/* Flash Sale Pulse */}
        <section className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 pb-4 border-b border-slate-800/50">Flash Sale Pulse</h2>
          <form onSubmit={handleFlashSaleSubmit} className="space-y-6 mb-12">
             <input 
               type="text" placeholder="Campaign Label (e.g. Black Friday)" required value={flashSaleForm.title} onChange={e => setFlashSaleForm({...flashSaleForm, title: e.target.value})}
               className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
             />
             <input 
               type="text" placeholder="Discount Payload (e.g. 70% OFF)" required value={flashSaleForm.discountText} onChange={e => setFlashSaleForm({...flashSaleForm, discountText: e.target.value})}
               className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
             />
             <div className="grid grid-cols-2 gap-6 items-center">
                <input 
                  type="datetime-local" required value={flashSaleForm.endTime} onChange={e => setFlashSaleForm({...flashSaleForm, endTime: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
                />
                <div className="flex items-center gap-4 px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl">
                   <input 
                    type="checkbox" 
                    checked={flashSaleForm.isActive} 
                    onChange={e => setFlashSaleForm({...flashSaleForm, isActive: e.target.checked})} 
                    className="w-5 h-5 rounded-md border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500" 
                  />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Pulse</span>
                </div>
             </div>
             <button type="submit" className="w-full py-5 bg-white text-slate-950 font-black rounded-3xl hover:bg-cyan-500 transition-all uppercase tracking-widest text-xs shadow-xl">
               Execute Campaign Sync
             </button>
          </form>

          <div className="space-y-4">
             {flashSales.slice(0, 2).map((s, idx) => (
                <div key={idx} className={`p-8 rounded-[2.5rem] border ${s.isActive ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900 border-slate-800'}`}>
                   <div className="flex justify-between items-center mb-6">
                      <span className="text-white font-black uppercase text-sm tracking-tight italic">{s.title}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${s.isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                        {s.isActive ? 'Live Pulse' : 'Offline'}
                      </span>
                   </div>
                   <p className="text-4xl font-black text-white italic tracking-tighter mb-4">{s.discountText}</p>
                   <div className="flex items-center gap-2 text-slate-500">
                      <span className="text-[10px] font-black uppercase tracking-widest">Expiration Protocol:</span>
                      <span className="text-xs font-mono">{new Date(s.endTime).toLocaleString()}</span>
                   </div>
                </div>
             ))}
          </div>
        </section>
      </div>

      {/* Newsletter Intelligence */}
      <section className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl">
         <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800/50">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Subscriber Intelligence</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Operational Newsletter Core Database</p>
            </div>
            <span className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-inner">{subscribers.length} Identifiers Verified</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                     <th className="px-8 py-4">Network Identity (Email)</th>
                     <th className="px-8 py-4">Protocol Sync Status</th>
                     <th className="px-8 py-4 text-right">Emergency Purge</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/10">
                  {subscribers.map((s, idx) => (
                    <tr key={idx} className="group hover:bg-cyan-500/[0.02] transition-colors">
                       <td className="px-8 py-8 font-black text-white tracking-tight text-sm uppercase">{s.email}</td>
                       <td className="px-8 py-8">
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Logged: </span>
                          <span className="text-slate-300 font-mono text-xs">{new Date(s.subscribedAt).toDateString()}</span>
                       </td>
                       <td className="px-8 py-8 text-right">
                          <button 
                            onClick={() => deleteSubscriber(s._id)} 
                            className="bg-rose-500/10 text-rose-500 px-6 py-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-[0.2em]"
                          >
                            Purge
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>
    </div>
  );
}
