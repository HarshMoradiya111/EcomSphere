'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/config';

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

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm text-primary" role="status"></div><span className="fw-bold">Mapping intent signals...</span></div>;

  return (
    <div className="container-fluid p-0">
      <div className="mb-4 pb-3 border-bottom">
        <h2 className="fs-4 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <i className="fa-solid fa-magnifying-glass-chart text-primary"></i> 
            Search & Intent Analytics
        </h2>
        <p className="text-muted small mb-0">Analyze user intent signals to optimize inventory and metadata.</p>
      </div>

      <div className="row g-4 mb-4">
        {/* Top Searches */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">
              <h3 className="fs-6 fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                <i className="fa-solid fa-fire text-warning"></i> 
                Top Search Queries
              </h3>
              <div className="d-flex flex-column">
                {topSearches.length > 0 ? topSearches.map((search: any, i) => (
                  <div key={i} className={`d-flex justify-content-between align-items-center py-3 ${i !== topSearches.length - 1 ? 'border-bottom' : ''}`}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1 fs-6">#{search._id}</span>
                      <span className="text-muted small">{search.count} searches</span>
                    </div>
                    <div className="text-muted small">
                      Avg. {Math.round(search.avgResults)} results
                    </div>
                  </div>
                )) : (
                  <p className="text-muted text-center py-4 mb-0">No search trends detected.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Zero Results */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100" style={{ borderTop: '4px solid var(--bs-danger) !important' }}>
            <div className="card-body p-4">
              <h3 className="fs-6 fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation text-danger"></i> 
                Zero Results (Missed Opportunities)
              </h3>
              <div className="d-flex flex-column">
                {zeroResults.length > 0 ? zeroResults.map((search: any, i) => (
                  <div key={i} className={`d-flex justify-content-between align-items-center py-3 ${i !== zeroResults.length - 1 ? 'border-bottom' : ''}`}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-danger bg-opacity-10 text-danger px-2 py-1 fs-6">#{search._id}</span>
                      <span className="text-muted small">{search.count} failed searches</span>
                    </div>
                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">Potential Gap</span>
                  </div>
                )) : (
                  <div className="text-success text-center py-4 d-flex align-items-center justify-content-center gap-2 fw-bold">
                    <i className="fa-solid fa-circle-check"></i> Great! Everyone is finding what they need.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Search Log */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-3">
          <h3 className="fs-6 fw-bold text-dark mb-0">Real-time Search Log</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small">
                <tr>
                  <th className="ps-4">Query Intent</th>
                  <th>Results Found</th>
                  <th>Node Authority</th>
                  <th className="text-end pe-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentLog.length > 0 ? recentLog.map((log: any, i) => (
                  <tr key={i}>
                    <td className="ps-4"><strong className="text-primary">{log.query}</strong></td>
                    <td>
                      <span className={`badge px-2 py-1 border ${log.resultsCount > 0 ? 'bg-success bg-opacity-10 text-success border-success border-opacity-25' : 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25'}`}>
                        {log.resultsCount} items found
                      </span>
                    </td>
                    <td>
                      <span className={`small ${log.userId ? 'text-primary fw-bold' : 'text-muted'}`}>
                          {log.userId ? 'Authenticated User' : 'Anonymous Guest'}
                      </span>
                    </td>
                    <td className="text-end pe-4"><small className="text-muted">{new Date(log.timestamp).toLocaleString()}</small></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center py-5 text-muted">Search log is currently silent.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
