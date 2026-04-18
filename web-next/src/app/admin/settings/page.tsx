'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/config';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'EcomSphere',
    supportEmail: 'support@ecomsphere.com',
    currency: 'INR',
    maintenanceMode: false,
    orderPrefix: 'ORD-',
    freeShippingThreshold: 500
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (e) {} finally {
            setLoading(false);
        }
    };
    fetchSettings();
  }, []);

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm" role="status"></div>Reading configuration...</div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">System Configuration</h2>
          <p className="text-muted small fw-bold tracking-widest text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>Core Store Parameters & Environmental Variables</p>
        </div>
      </div>

      <div className="card shadow-sm border-0" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4">
          <form className="settings-form">
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Enterprise Identity</label>
                  <input type="text" className="form-control" defaultValue={settings.siteName} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Support Endpoint</label>
                  <input type="email" className="form-control" defaultValue={settings.supportEmail} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Financial Basis</label>
                  <select className="form-select" defaultValue={settings.currency}>
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Logistics Threshold (₹)</label>
                  <input type="number" className="form-control" defaultValue={settings.freeShippingThreshold} />
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>SKU Protocol Prefix</label>
                  <input type="text" className="form-control" defaultValue={settings.orderPrefix} />
                </div>
              </div>

              <div className="p-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded mb-4 d-flex align-items-center justify-content-between">
                <div>
                  <label className="text-danger fw-bold text-uppercase mb-1 d-block" style={{ fontSize: '13px', letterSpacing: '1px' }}>Maintenance Protocol</label>
                  <p className="text-muted small fw-bold text-uppercase mb-0" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Restricts public access during active state</p>
                </div>
                <div className="form-check form-switch fs-4 mb-0">
                  <input className="form-check-input border-danger" type="checkbox" role="switch" defaultChecked={settings.maintenanceMode} style={{ cursor: 'pointer' }} />
                </div>
              </div>

              <div className="d-flex gap-3 pt-4 border-top">
                <button type="submit" className="btn btn-primary fw-bold text-uppercase px-4 py-2" style={{ letterSpacing: '1px' }}>
                  Commit System Changes
                </button>
                <button type="button" className="btn btn-light border fw-bold text-uppercase px-4 py-2" style={{ letterSpacing: '1px' }}>
                  Discard
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
