'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/config';

export default function MarketingPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', buttonText: 'Shop Now', link: '/shop', image: null as File | null });
  const [flashForm, setFlashForm] = useState({ title: '', discountText: '', endTime: '', isActive: true });

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/marketing`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners || []);
        setFlashSales(data.flashSales || []);
        setSubscribers(data.subscribers || []);
      }
    } catch (e) {
      console.error('Failed to fetch marketing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('title', bannerForm.title);
    formData.append('subtitle', bannerForm.subtitle);
    formData.append('buttonText', bannerForm.buttonText);
    formData.append('link', bannerForm.link);
    if (bannerForm.image) formData.append('image', bannerForm.image);

    try {
        const res = await fetch(`${API_URL}/api/v1/admin/marketing/banners`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            setBannerForm({ title: '', subtitle: '', buttonText: 'Shop Now', link: '/shop', image: null });
            fetchData();
        }
    } catch (e) {
        alert('Banner deployment failed: Uplink unstable.');
    }
  };

  const handleFlashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
        const res = await fetch(`${API_URL}/api/v1/admin/marketing/flash-sales`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(flashForm)
        });
        const data = await res.json();
        if (data.success) fetchData();
    } catch (e) {
        alert('Chronos event sync failed.');
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Abort this banner vector?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`${API_URL}/api/v1/admin/marketing/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  if (loading) return <div className="p-10 font-black text-[#64748b] tracking-widest uppercase text-[12px]">Synchronizing payload...</div>;

  return (
    <div className="marketing-page">
      <div className="flex justify-between items-end mb-6 pb-6 border-b border-[var(--border)]">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Marketing Vectors</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-[0.2em] opacity-60">Promotional Ops & Subscriber Graph</p>
        </div>
      </div>

      <div className="marketing-grid">
        <div className="admin-card marketing-section">
          <div className="card-header">
            <h3 className="text-[14px] font-[800] text-white uppercase tracking-widest">Hero Banners</h3>
          </div>
          <div>
            <form className="marketing-form" onSubmit={handleBannerSubmit}>
              <div className="form-group">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Asset Source</label>
                <input type="file" required onChange={(e) => setBannerForm({...bannerForm, image: e.target.files?.[0] || null})} />
              </div>
              <div className="form-group">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Vector Title</label>
                <input 
                    type="text" 
                    placeholder="SUMMER COLLECTION" 
                    required 
                    value={bannerForm.title} 
                    onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Subtitle</label>
                <input 
                    type="text" 
                    placeholder="e.g. Up to 50% Off" 
                    required 
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="form-group">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Trigger Text</label>
                  <input 
                    type="text" 
                    value={bannerForm.buttonText} 
                    onChange={(e) => setBannerForm({...bannerForm, buttonText: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Target Node</label>
                  <input 
                    type="text" 
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({...bannerForm, link: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="btn-core btn-primary w-full">Deploy Banner</button>
            </form>

            <div className="h-[1px] bg-[var(--border)] my-8"></div>

            <div className="space-y-4">
              {banners.length > 0 ? banners.map((banner: any) => (
                <div key={banner._id} className="p-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg flex items-center gap-4">
                  <img
                    src={banner.image?.startsWith('http') ? banner.image : `${API_URL}/uploads/${banner.image}`}
                    className="w-20 h-12 object-cover rounded border border-[var(--border)]"
                    alt="banner"
                  />
                  <div className="flex-1">
                    <h5 className="text-[13px] font-bold text-white uppercase">{banner.title}</h5>
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">{banner.subtitle}</p>
                  </div>
                  <button onClick={() => deleteBanner(banner._id)} className="text-[var(--danger)] opacity-40 hover:opacity-100 transition-opacity">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              )) : (
                <p className="text-center text-[var(--text-muted)] text-sm py-8 uppercase tracking-[4px] font-black">Memory Empty</p>
              )}
            </div>
          </div>
        </div>

        {/* Flash Sale Management */}
        <div className="admin-card marketing-section">
          <div className="card-header">
            <h3 className="text-[14px] font-[800] text-white uppercase tracking-widest">Chronos Events</h3>
          </div>
          <div>
            <form className="marketing-form" onSubmit={handleFlashSubmit}>
              <div className="form-group">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Anomaly Title</label>
                <input 
                    type="text" 
                    placeholder="FLASH DEALS" 
                    required 
                    value={flashForm.title}
                    onChange={(e) => setFlashForm({...flashForm, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Yield Deviation</label>
                <input 
                    type="text" 
                    placeholder="70% REDUCTION" 
                    required 
                    value={flashForm.discountText}
                    onChange={(e) => setFlashForm({...flashForm, discountText: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Termination Sequence</label>
                <input 
                    type="datetime-local" 
                    required 
                    value={flashForm.endTime}
                    onChange={(e) => setFlashForm({...flashForm, endTime: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input 
                    type="checkbox" 
                    id="fsActive" 
                    checked={flashForm.isActive} 
                    onChange={(e) => setFlashForm({...flashForm, isActive: e.target.checked})}
                    className="w-4 h-4 rounded border-[var(--border)] accent-[var(--accent)]" 
                />
                <label htmlFor="fsActive" className="text-[11px] font-black uppercase tracking-widest text-white">Broadcast to Homepage</label>
              </div>
              <button type="submit" className="btn-core btn-primary w-full">Update Pulse</button>
            </form>

            <h5 className="text-[11px] font-black uppercase tracking-[3px] text-[var(--text-muted)] mt-10 mb-4 text-center">Active Temporal Events</h5>


            <div className="space-y-3">
              {flashSales.length > 0 ? flashSales.slice(0, 3).map((sale: any) => (
                <div key={sale._id} className={`p-4 rounded-lg border ${sale.isActive ? 'border-[var(--accent)] bg-[var(--accent-muted)]' : 'border-[var(--border)] bg-[var(--surface-raised)]'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <strong className={`uppercase text-xs tracking-widest ${sale.isActive ? 'text-[var(--accent)]' : 'text-white'}`}>{sale.title}</strong>
                    <span className="badge-pill">{sale.isActive ? 'ON-AIR' : 'DARK'}</span>
                  </div>
                  <p className="text-[11px] font-bold text-white mb-1">{sale.discountText}</p>
                  <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider">EXP: {new Date(sale.endTime).toLocaleString()}</p>
                </div>
              )) : (
                <p className="text-center text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[3px] py-4">No Temporal Anomalies</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* News Letter Subscribers */}
      <div className="admin-card">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-[14px] font-[800] text-white uppercase tracking-widest">Network Subscribers</h3>
          <span className="badge-pill">{subscribers.length} Nodes</span>
        </div>
        <div className="overflow-x-auto max-h-[400px]">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Broadcasting Node</th>
                <th>Established At</th>
                <th className="text-right">Ops</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length > 0 ? subscribers.map((sub: any) => (
                <tr key={sub._id}>
                  <td className="font-bold text-white tracking-tight">{sub.email}</td>
                  <td className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-widest">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    <button className="btn-core btn-secondary !p-[4px_12px] !h-8 !text-[11px] hover:!border-[var(--danger)] hover:!text-[var(--danger)]">Terminate</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="py-20 text-center uppercase text-[var(--text-muted)] font-black tracking-[5px] text-xs">No Nodes Connected</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
