'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/config';

export default function AdminAnalytics() {
  const [topSearches, setTopSearches] = useState<{ _id: string; count: number }[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatrix = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const [searchRes, couponRes, bannerRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/admin/search-analytics`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/v1/admin/coupons`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/v1/admin/banners`, { headers: { 'Authorization': `Bearer ${token}` } })
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

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm text-primary" role="status"></div><span className="text-uppercase fw-bold small tracking-widest text-primary">Calibrating Market Sensors...</span></div>;

  return (
    <div className="container-fluid p-0">
      <header className="mb-5 pb-3 border-bottom">
          <div className="d-flex align-items-center gap-2 mb-2 text-primary text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>
             <span className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></span> Sensor Intelligence
          </div>
          <h1 className="display-6 fw-bold text-dark mb-0">Market <span className="text-primary">Velocity</span></h1>
          <p className="text-muted text-uppercase fw-bold mb-0 mt-2" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>Sentiment Analysis & Marketing Penetration</p>
      </header>

      <div className="row g-4 mb-4">
          {/* Top Searches */}
          <div className="col-xl-4">
              <div className="card shadow-sm border-0 h-100">
                  <div className="card-body p-4">
                      <h2 className="fs-6 fw-bold text-dark mb-4 d-flex align-items-center gap-2 text-uppercase tracking-widest">
                          <span className="bg-info rounded-pill" style={{ width: '6px', height: '24px' }}></span>
                          Consumer Intent
                      </h2>
                      <div className="d-flex flex-column gap-3">
                          {topSearches.map((s, idx) => (
                              <div key={idx} className="d-flex justify-content-between align-items-center">
                                  <p className="mb-0 text-dark fw-bold text-uppercase" style={{ fontSize: '12px' }}>"{s._id}"</p>
                                  <div className="d-flex align-items-center gap-2">
                                      <div className="progress" style={{ width: '80px', height: '6px' }}>
                                          <div className="progress-bar bg-info" role="progressbar" style={{ width: `${Math.min(100, s.count * 10)}%` }} aria-valuenow={s.count * 10} aria-valuemin={0} aria-valuemax={100}></div>
                                      </div>
                                      <span className="text-muted fw-bold" style={{ fontSize: '11px' }}>{s.count} Hits</span>
                                  </div>
                              </div>
                          ))}
                          {topSearches.length === 0 && <p className="text-muted small fst-italic mb-0">No search data decoded yet.</p>}
                      </div>
                  </div>
              </div>
          </div>

          {/* Active Campaigns - Banners */}
          <div className="col-xl-8">
              <div className="card shadow-sm border-0 h-100">
                  <div className="card-body p-4">
                      <h2 className="fs-6 fw-bold text-dark mb-4 d-flex align-items-center gap-2 text-uppercase tracking-widest">
                          <span className="bg-primary rounded-pill" style={{ width: '6px', height: '24px' }}></span>
                          Marketing Deployment (Hero)
                      </h2>
                      <div className="row g-3">
                           {banners.map((b, idx) => (
                               <div key={idx} className="col-md-6">
                                   <div className="position-relative overflow-hidden rounded border shadow-sm" style={{ aspectRatio: '16/9' }}>
                                       <img src={`${API_URL}${b.image}`} alt="Banner" className="w-100 h-100 object-fit-cover" />
                                       <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                           <p className="text-white fw-bold text-uppercase mb-0" style={{ fontSize: '11px', letterSpacing: '1px' }}>{b.title || 'Untitled Campaign'}</p>
                                       </div>
                                   </div>
                               </div>
                           ))}
                           {banners.length === 0 && (
                               <div className="col-12">
                                   <div className="d-flex align-items-center justify-content-center bg-light border border-secondary border-dashed rounded" style={{ aspectRatio: '16/9' }}>
                                       <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>No Active Hero Assets</span>
                                   </div>
                               </div>
                           )}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Coupons Matrix */}
      <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
              <h2 className="fs-6 fw-bold text-dark mb-4 d-flex align-items-center gap-2 text-uppercase tracking-widest">
                  <span className="bg-success rounded-pill" style={{ width: '6px', height: '24px' }}></span>
                  Revenue Booster: Coupons
              </h2>
              <div className="row g-3">
                  {coupons.map((c, idx) => (
                      <div key={idx} className="col-6 col-md-3 col-lg-2">
                          <div className="p-3 rounded bg-light border text-center h-100 d-flex flex-column justify-content-center align-items-center">
                              <p className="text-success fw-bold fs-5 mb-1 text-break">{c.code}</p>
                              <p className="text-muted fw-bold text-uppercase mb-0" style={{ fontSize: '10px' }}>-{c.discount}% OFF</p>
                          </div>
                      </div>
                  ))}
                  {coupons.length === 0 && (
                      <div className="col-12">
                          <p className="text-muted text-center py-4 fw-bold text-uppercase mb-0" style={{ fontSize: '11px', letterSpacing: '2px' }}>No Active Discount Codes</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
