'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/config';

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

  if (loading) return <div className="p-10 font-bold text-[#64748b]">Reading configuration...</div>;

  return (
    <div className="settings-page">
      <div className="flex justify-between items-end mb-6 pb-6 border-b border-[var(--border)]">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Configuration</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-[0.2em] opacity-60">Core Store Parameters & Environmental Variables</p>
        </div>
      </div>

      <div className="admin-card max-w-5xl settings-card">
        <form className="settings-form">
            <div className="form-group">
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Enterprise Identity</label>
              <input type="text" defaultValue={settings.siteName} />
            </div>
            <div className="form-group">
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Support Endpoint</label>
              <input type="email" defaultValue={settings.supportEmail} />
            </div>

            <div className="form-group">
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Financial Basis</label>
              <select defaultValue={settings.currency}>
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Logistics Threshold (₹)</label>
              <input type="number" defaultValue={settings.freeShippingThreshold} />
            </div>

            <div className="form-group">
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">SKU Protocol Prefix</label>
              <input type="text" defaultValue={settings.orderPrefix} />
            </div>

            <div className="p-6 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] rounded-xl flex items-center justify-between">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-[var(--danger)] mb-1 block">Maintenance Protocol</label>
                <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tight">Restricts public access during active state</p>
              </div>
              <input type="checkbox" defaultChecked={settings.maintenanceMode} className="w-10 h-5 cursor-pointer accent-[var(--danger)]" />
            </div>

            <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
              <button type="submit" className="btn-core btn-primary !h-12 !px-8">
                Commit System Changes
              </button>
              <button type="button" className="btn-core btn-secondary !h-12 !px-8">
                Discard
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
