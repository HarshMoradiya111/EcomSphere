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

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm" role="status"></div>Synchronizing payload...</div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Marketing Vectors</h2>
          <p className="text-muted small fw-bold tracking-widest text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>Promotional Ops & Subscriber Graph</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-3">
              <h3 className="fs-6 fw-bold text-dark text-uppercase tracking-widest mb-0">Hero Banners</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleBannerSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Asset Source</label>
                  <input type="file" className="form-control form-control-sm" required onChange={(e) => setBannerForm({...bannerForm, image: e.target.files?.[0] || null})} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Vector Title</label>
                  <input 
                      type="text" 
                      className="form-control form-control-sm"
                      placeholder="SUMMER COLLECTION" 
                      required 
                      value={bannerForm.title} 
                      onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})} 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Subtitle</label>
                  <input 
                      type="text" 
                      className="form-control form-control-sm"
                      placeholder="e.g. Up to 50% Off" 
                      required 
                      value={bannerForm.subtitle}
                      onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                  />
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Trigger Text</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm"
                      value={bannerForm.buttonText} 
                      onChange={(e) => setBannerForm({...bannerForm, buttonText: e.target.value})} 
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Target Node</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm"
                      value={bannerForm.link}
                      onChange={(e) => setBannerForm({...bannerForm, link: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-sm btn-primary w-100 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Deploy Banner</button>
              </form>

              <hr className="my-4 text-muted" />

              <div className="d-flex flex-column gap-3">
                {banners.length > 0 ? banners.map((banner: any) => (
                  <div key={banner._id} className="p-3 bg-light border rounded d-flex align-items-center gap-3 shadow-sm">
                    <img
                      src={banner.image?.startsWith('http') ? banner.image : `${API_URL}/uploads/${banner.image}`}
                      className="img-thumbnail p-0 rounded"
                      style={{ width: '80px', height: '48px', objectFit: 'cover' }}
                      alt="banner"
                    />
                    <div className="flex-grow-1">
                      <h5 className="mb-1 text-dark fw-bold text-uppercase" style={{ fontSize: '13px' }}>{banner.title}</h5>
                      <p className="mb-0 text-muted small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>{banner.subtitle}</p>
                    </div>
                    <button onClick={() => deleteBanner(banner._id)} className="btn btn-sm btn-outline-danger border-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                )) : (
                  <p className="text-center text-muted small py-4 text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px' }}>Memory Empty</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Flash Sale Management */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-3">
              <h3 className="fs-6 fw-bold text-dark text-uppercase tracking-widest mb-0">Chronos Events</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleFlashSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Anomaly Title</label>
                  <input 
                      type="text" 
                      className="form-control form-control-sm"
                      placeholder="FLASH DEALS" 
                      required 
                      value={flashForm.title}
                      onChange={(e) => setFlashForm({...flashForm, title: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Yield Deviation</label>
                  <input 
                      type="text" 
                      className="form-control form-control-sm"
                      placeholder="70% REDUCTION" 
                      required 
                      value={flashForm.discountText}
                      onChange={(e) => setFlashForm({...flashForm, discountText: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Termination Sequence</label>
                  <input 
                      type="datetime-local" 
                      className="form-control form-control-sm"
                      required 
                      value={flashForm.endTime}
                      onChange={(e) => setFlashForm({...flashForm, endTime: e.target.value})}
                  />
                </div>
                <div className="form-check form-switch mb-4">
                  <input 
                      type="checkbox" 
                      id="fsActive" 
                      checked={flashForm.isActive} 
                      onChange={(e) => setFlashForm({...flashForm, isActive: e.target.checked})}
                      className="form-check-input"
                      style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="fsActive" className="form-check-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px', cursor: 'pointer' }}>Broadcast to Homepage</label>
                </div>
                <button type="submit" className="btn btn-sm btn-primary w-100 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Update Pulse</button>
              </form>

              <h5 className="text-muted small fw-bold text-uppercase text-center mt-5 mb-3" style={{ letterSpacing: '2px' }}>Active Temporal Events</h5>

              <div className="d-flex flex-column gap-3">
                {flashSales.length > 0 ? flashSales.slice(0, 3).map((sale: any) => (
                  <div key={sale._id} className={`p-3 rounded border ${sale.isActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary bg-light'}`}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className={`text-uppercase small fw-bold mb-0 ${sale.isActive ? 'text-primary' : 'text-dark'}`} style={{ letterSpacing: '1px' }}>{sale.title}</strong>
                      <span className={`badge px-2 py-1 text-uppercase ${sale.isActive ? 'bg-primary' : 'bg-secondary'}`}>{sale.isActive ? 'ON-AIR' : 'DARK'}</span>
                    </div>
                    <p className="fw-bold text-dark mb-1" style={{ fontSize: '12px' }}>{sale.discountText}</p>
                    <p className="text-muted small fw-bold text-uppercase mb-0" style={{ fontSize: '10px', letterSpacing: '1px' }}>EXP: {new Date(sale.endTime).toLocaleString()}</p>
                  </div>
                )) : (
                  <p className="text-center text-muted small py-3 text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px' }}>No Temporal Anomalies</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Letter Subscribers */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
          <h3 className="fs-6 fw-bold text-dark text-uppercase tracking-widest mb-0">Network Subscribers</h3>
          <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">{subscribers.length} Nodes</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: '400px' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: '12px' }}>
                <tr>
                  <th className="ps-4">Broadcasting Node</th>
                  <th>Established At</th>
                  <th className="text-end pe-4">Ops</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length > 0 ? subscribers.map((sub: any) => (
                  <tr key={sub._id}>
                    <td className="ps-4 fw-bold text-dark">{sub.email}</td>
                    <td className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '1px', fontSize: '11px' }}>{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-danger fw-bold text-uppercase" style={{ fontSize: '11px', padding: '4px 12px' }}>Terminate</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-5 text-center text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '3px' }}>No Nodes Connected</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
