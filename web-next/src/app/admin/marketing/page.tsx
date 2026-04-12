'use client';

import { useEffect, useState } from 'react';

export default function MarketingEngine() {
  const [banners, setBanners] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', buttonText: 'Shop Now', buttonLink: '/shop' });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [flashSaleForm, setFlashSaleForm] = useState({ title: '', discountText: '', endTime: '', isActive: true });

  const fetchData = async () => {
    try {
      const [bRes, fRes, sRes] = await Promise.all([
        fetch('http://127.0.0.1:3000/api/v1/admin/banners'),
        fetch('http://127.0.0.1:3000/api/v1/admin/flash-sale'),
        fetch('http://127.0.0.1:3000/api/v1/admin/subscribers')
      ]);
      const [bData, fData, sData] = await Promise.all([bRes.json(), fRes.json(), sRes.json()]);
      if (bData.success) setBanners(bData.banners);
      if (fData.success) setFlashSales(fData.flashSales);
      if (sData.success) setSubscribers(sData.subscribers);
    } catch (err) {
      console.error('Core sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', bannerForm.title);
    formData.append('subtitle', bannerForm.subtitle);
    formData.append('buttonText', bannerForm.buttonText);
    formData.append('buttonLink', bannerForm.buttonLink);
    if (bannerFile) formData.append('image', bannerFile);

    try {
      const res = await fetch('http://127.0.0.1:3000/api/v1/admin/banners', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert('Banner Deployed 🚀');
        fetchData();
      }
    } catch (err) {
      console.error('Deployment failed');
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await fetch(`http://127.0.0.1:3000/api/v1/admin/banners/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Purge failed');
    }
  };

  const handleFlashSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:3000/api/v1/admin/flash-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flashSaleForm)
      });
      if (res.ok) {
        alert('Campaign Initialized 🕒');
        fetchData();
      }
    } catch (err) {
      console.error('Initialization failed');
    }
  };

  const deleteSubscriber = async (id: string) => {
    try {
      await fetch(`http://127.0.0.1:3000/api/v1/admin/subscribers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Purge failed');
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-amber-500 font-black uppercase tracking-widest text-xs">Synchronizing Marketing Stream...</div>;

  return (
    <div className="p-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-amber-500">
           <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Campaign Management
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter italic">Marketing <span className="text-amber-500 not-italic">Engine</span></h1>
        <p className="text-slate-500 font-medium text-lg mt-2">Orchestrate global hero banners and flash sale pulses</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Banner Control Hub */}
        <section className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 pb-4 border-b border-slate-800/50">Hero Banners</h2>
          <form onSubmit={handleBannerSubmit} className="space-y-6 mb-12">
             <div className="grid grid-cols-2 gap-6">
                <input 
                  type="text" placeholder="Campaign Title" required value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-amber-500 outline-none"
                />
                <input 
                  type="text" placeholder="Subtitle / Promo Code" required value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-amber-500 outline-none"
                />
             </div>
             <div className="grid grid-cols-2 gap-6">
                <input 
                  type="text" placeholder="Button Text" value={bannerForm.buttonText} onChange={e => setBannerForm({...bannerForm, buttonText: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-amber-500 outline-none"
                />
                <input 
                  type="text" placeholder="Redirect Link" value={bannerForm.buttonLink} onChange={e => setBannerForm({...bannerForm, buttonLink: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-amber-500 outline-none"
                />
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">High-Res Asset Upload</label>
                <input type="file" onChange={e => setBannerFile(e.target.files?.[0] || null)} className="text-slate-400 text-xs" />
             </div>
             <button type="submit" className="w-full py-5 bg-amber-500 text-white font-black rounded-3xl hover:bg-amber-400 transition-all uppercase tracking-tighter shadow-xl shadow-amber-500/20">
               Deploy New Banner
             </button>
          </form>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
            {banners.map((b, idx) => (
              <div key={idx} className="flex gap-6 p-4 rounded-3xl bg-slate-900 border border-slate-800 group transition-all hover:border-amber-500">
                <img src={`http://127.0.0.1:3000/uploads/${b.image}`} className="w-32 h-20 object-cover rounded-2xl" />
                <div className="flex-1">
                  <h4 className="text-white font-black text-sm uppercase tracking-tighter">{b.title}</h4>
                  <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{b.subtitle}</p>
                </div>
                <button onClick={() => deleteBanner(b._id)} className="text-rose-500 hover:rotate-12 transition-transform">🗑️</button>
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
               className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-amber-500 outline-none"
             />
             <input 
               type="text" placeholder="Discount Payload (e.g. 70% OFF)" required value={flashSaleForm.discountText} onChange={e => setFlashSaleForm({...flashSaleForm, discountText: e.target.value})}
               className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-amber-500 outline-none"
             />
             <div className="grid grid-cols-2 gap-6 items-center">
                <input 
                  type="datetime-local" required value={flashSaleForm.endTime} onChange={e => setFlashSaleForm({...flashSaleForm, endTime: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-amber-500 outline-none"
                />
                <div className="flex items-center gap-4 px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl">
                   <input type="checkbox" checked={flashSaleForm.isActive} onChange={e => setFlashSaleForm({...flashSaleForm, isActive: e.target.checked})} className="w-5 h-5 accent-amber-500" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Pulse</span>
                </div>
             </div>
             <button type="submit" className="w-full py-5 bg-white text-black font-black rounded-3xl hover:bg-amber-500 hover:text-white transition-all uppercase tracking-tighter shadow-xl">
               Update Campaign Status
             </button>
          </form>

          <div className="space-y-4">
             {flashSales.slice(0, 2).map((s, idx) => (
                <div key={idx} className={`p-6 rounded-3xl border ${s.isActive ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900 border-slate-800'}`}>
                   <div className="flex justify-between mb-4">
                      <span className="text-white font-black uppercase tracking-tighter">{s.title}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${s.isActive ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        {s.isActive ? 'Live Pulse' : 'Offline'}
                      </span>
                   </div>
                   <p className="text-2xl font-black text-white italic tracking-tighter mb-2">{s.discountText}</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expires: {new Date(s.endTime).toLocaleString()}</p>
                </div>
             ))}
          </div>
        </section>
      </div>

      {/* Newsletter Intelligence */}
      <section className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-700/30 shadow-2xl">
         <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-800/50">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Newsletter Intelligence</h2>
            <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-full">{subscribers.length} Global Subscribers</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                     <th className="px-6 py-4">Identity (Email)</th>
                     <th className="px-6 py-4">Protocol Sync (Date)</th>
                     <th className="px-6 py-4 text-right">Operational Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/30">
                  {subscribers.map((s, idx) => (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="px-6 py-6 font-bold text-white uppercase tracking-tighter text-sm">{s.email}</td>
                       <td className="px-6 py-6 text-slate-500 text-xs font-mono">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                       <td className="px-6 py-6 text-right">
                          <button onClick={() => deleteSubscriber(s._id)} className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">Purge</button>
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
