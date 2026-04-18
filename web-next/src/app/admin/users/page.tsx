'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/src/config';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.warn('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      alert('Deletion failed');
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm" role="status"></div>Loading users...</div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Identity Register</h2>
          <p className="text-muted small fw-bold tracking-widest flex items-center gap-2 text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>
            {users.length} Active Nodes Identified
          </p>
        </div>
        <button onClick={fetchUsers} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 shadow-sm">
          <i className="fa-solid fa-sync"></i> Refresh Grid
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: '12px' }}>
                <tr>
                  <th className="ps-4">Neural Identity</th>
                  <th>Privilege Level</th>
                  <th className="text-end pe-4">Management</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded bg-light border d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: '40px', height: '40px', fontSize: '18px' }}>
                          {u.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-dark fw-bold mb-0" style={{ fontSize: '14px' }}>{u.username}</p>
                          <p className="text-muted small font-monospace mb-0" style={{ fontSize: '11px' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 text-uppercase px-2 py-1">
                        {u.role || 'customer'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button onClick={() => deleteUser(u._id)} className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center ms-auto gap-2" style={{ fontSize: '11px', padding: '4px 12px' }}>
                        <i className="fa-solid fa-user-slash"></i> Terminate
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-5 text-muted">
                      No identities found in the register.
                    </td>
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
