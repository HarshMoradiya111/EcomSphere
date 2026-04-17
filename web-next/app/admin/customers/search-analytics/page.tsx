'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/config';

export default function SearchAnalyticsPage() {
  const [topSearches, setTopSearches] = useState([]);
  const [zeroResults, setZeroResults] = useState([]);
  const [recentLog, setRecentLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/customers/search-analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTopSearches(data.topSearches || []);
                setZeroResults(data.zeroResultsQueries || []);
                setRecentLog(data.recentQueries || []);
            }
        } catch (e) {} finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 font-bold text-[#64748b]">Mapping intent signals...</div>;

  return (
    <div className="admin-content" style={{ padding: '25px 30px' }}>
      <style>{`
        .analytics-card { background: var(--bg-card); border-radius: 12px; padding: 25px; border: 1px solid var(--border-color); margin-bottom: 25px; }
        .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .query-tag { background: rgba(255, 215, 0, 0.1); padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; color: var(--accent); }
        .query-count { color: var(--text-secondary); font-size: 12px; margin-left: 8px; }
        .zero-badge { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; border: 1px solid rgba(239, 68, 68, 0.2); }
        .search-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid var(--border-color); }
        .search-item:last-child { border-bottom: none; }
      `}</style>

      <div className="card-header" style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            <i className="fa-solid fa-magnifying-glass-chart" style={{ color: 'var(--accent)', marginRight: '10px' }}></i> 
            Search & Intent Analytics
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Analyze user intent signals to optimize inventory and metadata.</p>
      </div>

      <div className="analytics-grid">
        {/* Top Searches */}
        <div className="analytics-card">
          <h3 style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--text-primary)' }}>
            <i className="fa-solid fa-fire" style={{ color: '#f97316', marginRight: '10px' }}></i> 
            Top Search Queries
          </h3>
          {topSearches.length > 0 ? topSearches.map((search: any, i) => (
            <div key={i} className="search-item">
              <div>
                <span className="query-tag">#{search._id}</span>
                <span className="query-count">{search.count} searches</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Avg. {Math.round(search.avgResults)} results
              </div>
            </div>
          )) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>No search trends detected.</p>
          )}
        </div>

        {/* Zero Results */}
        <div className="analytics-card" style={{ borderTop: '4px solid #ef4444' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--text-primary)' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444', marginRight: '10px' }}></i> 
            Zero Results (Missed Opportunities)
          </h3>
          {zeroResults.length > 0 ? zeroResults.map((search: any, i) => (
            <div key={i} className="search-item">
              <div>
                <span className="query-tag" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>#{search._id}</span>
                <span className="query-count">{search.count} failed searches</span>
              </div>
              <span className="zero-badge">Potential Gap</span>
            </div>
          )) : (
            <div style={{ textAlign: 'center', color: '#22c55e', padding: '30px', fontSize: '14px' }}>
              <i className="fa-solid fa-circle-check"></i> Great! Everyone is finding what they need.
            </div>
          )}
        </div>
      </div>

      {/* Recent Search Log */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Real-time Search Log</h3>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Query Intent</th>
                <th>Results Found</th>
                <th>Node Authority</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentLog.length > 0 ? recentLog.map((log: any, i) => (
                <tr key={i}>
                  <td><strong style={{ color: 'var(--accent)' }}>{log.query}</strong></td>
                  <td>
                    <span className={`badge ${log.resultsCount > 0 ? 'badge-delivered' : 'badge-cancelled'}`}>
                      {log.resultsCount} items found
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: log.userId ? 'var(--accent)' : 'var(--text-secondary)' }}>
                        {log.userId ? 'Authenticated User' : 'Anonymous Guest'}
                    </span>
                  </td>
                  <td><small style={{ color: '#64748b' }}>{new Date(log.timestamp).toLocaleString()}</small></td>
                </tr>
              )) : (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Search log is currently silent.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
