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

  if (loading) return <div className="p-8 text-[#94a3b8]">Loading users...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8 pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Identity Register</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-black tracking-widest uppercase">{users.length} Active Nodes Identified</p>
        </div>
        <button onClick={fetchUsers} className="btn-core btn-secondary">
          <i className="fa-solid fa-sync"></i> Refresh Grid
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive w-full overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Neural Identity</th>
                <th>Privilege Level</th>
                <th className="text-right">Management</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center font-black text-[var(--accent)]">
                        {u.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-bold text-[14px] leading-tight mb-0.5">{u.username}</p>
                        <p className="text-[11px] text-[var(--text-muted)] font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge-pill">
                      {u.role || 'customer'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button onClick={() => deleteUser(u._id)} className="btn-core btn-secondary !p-[4px_12px] !h-8 !text-[11px] hover:!border-[var(--danger)] hover:!text-[var(--danger)]">
                      <i className="fa-solid fa-user-slash mr-2"></i> Terminate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
