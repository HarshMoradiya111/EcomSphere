'use client';

import { useEffect, useState } from 'react';

export default function AdminAnalytics() {
  const [topSearches, setTopSearches] = useState<{ _id: string; count: number }[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatrix = async () => {
    try {
      const [searchRes, couponRes, bannerRes] = await Promise.all([
        fetch('${API_URL}/api/v1/admin/search-analytics'),
        fetch('${API_URL}/api/v1/admin/coupons'),
        fetch('${API_URL}/api/v1/admin/banners')
      ]);

      const [searchData, couponData, bannerData] = await Promise.all([
        searchRes.json(),
        couponRes.json(),
        bannerRes.json()
      ]);

      if (searchData.success) setTopSearches(searchData.topSearches);
      if (couponData.success) setCoupons(couponData.coupons);
      if (bannerData.success) setBanners(bannerData.banners);
    } catch (err) {
      console.error('Analytics cluster sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-cyan-400 font-black uppercase tracking-widest text-xs">Calibrating Market Sensors...</div>;

  return (
    <div className="p-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      <header className="mb-16">
          <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-cyan-400">
             <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Sensor Intelligence
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter italic">Market <span className="text-cyan-400 not-italic">Velocity</span></h1>
          <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-[0.2em] text-xs">Sentiment Analysis & Marketing Penetration</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Top Searches */}
          <div className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl">
              <h2 className="text-xl font-black text-white mb-10 flex items-center gap-3 uppercase tracking-tighter">
                  <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                  Consumer Intent
              </h2>
              <div className="space-y-6">
                  {topSearches.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center group">
                          <p className="text-slate-200 font-bold uppercase tracking-widest text-[11px] group-hover:text-cyan-400 transition-colors">"{s._id}"</p>
                          <div className="flex items-center gap-3">
                              <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, s.count * 10)}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-slate-500">{s.count} Hits</span>
                          </div>
                      </div>
                  ))}
                  {topSearches.length === 0 && <p className="text-slate-600 italic text-sm">No search data decoded yet.</p>}
              </div>
          </div>

          {/* Active Campaigns - Banners */}
          <div className="xl:col-span-2 bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl overflow-hidden relative">
              <h2 className="text-xl font-black text-white mb-10 flex items-center gap-3 uppercase tracking-tighter">
                  <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                  Marketing Deployment (Hero)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {banners.map((b, idx) => (
                       <div key={idx} className="relative aspect-video rounded-[2rem] overflow-hidden border border-slate-800 group">
                           <img src={`${API_URL}${b.image}`} alt="Banner" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                           <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-950 to-transparent">
                               <p className="text-white font-black text-xs uppercase tracking-widest">{b.title || 'Untitled Campaign'}</p>
                           </div>
                       </div>
                   ))}
                   {banners.length === 0 && (
                       <div className="aspect-video rounded-[2rem] bg-slate-900/50 border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-700 font-black uppercase text-[10px] tracking-widest">
                           No Active Hero Assets
                       </div>
                   )}
              </div>
          </div>
      </div>

      {/* Coupons Matrix */}
      <div className="mt-10 bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl relative">
          <h2 className="text-xl font-black text-white mb-10 flex items-center gap-3 uppercase tracking-tighter">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              Revenue Booster: Coupons
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {coupons.map((c, idx) => (
                  <div key={idx} className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800 relative group overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 blur-[40px] group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
                      <p className="text-emerald-400 font-black text-xl tracking-tighter mb-1">{c.code}</p>
                      <p className="text-slate-600 text-[10px] font-black uppercase">-{c.discount}% OFF</p>
                  </div>
              ))}
              {coupons.length === 0 && <p className="text-slate-600 col-span-full py-10 text-center uppercase font-black text-xs tracking-widest">No Active Discount Codes</p>}
          </div>
      </div>
    </div>
  );
}
