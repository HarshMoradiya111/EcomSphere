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
    <div className="admin-content">
      <div className="admin-card bg-[#1e293b] border border-[#334155] rounded-[12px] m-[25px_30px] overflow-hidden">
        <div className="card-header flex items-center justify-between p-[18px_22px] border-b border-[#334155]">
          <h3 className="text-[16px] font-[700] text-[#f1f5f9]">Manage Users ({users.length})</h3>
          <button onClick={fetchUsers} className="text-[#ffd700] text-[13px] font-[600]">
            <i className="fa-solid fa-sync"></i> Refresh
          </button>
        </div>
        <div className="table-responsive w-full overflow-x-auto">
          <table className="admin-table w-full border-collapse">
            <thead>
              <tr className="bg-[#0f172a]">
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">User Details</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Role</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/2 border-b border-[#334155]">
                  <td className="p-[14px_16px]">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[40px] h-[40px] rounded-full bg-[#0f172a] border border-[#334155] flex items-center justify-center font-[700] text-[#ffd700]">
                        {u.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <strong className="block text-[#f1f5f9] text-[14px]">{u.username}</strong>
                        <small className="text-[#94a3b8]">{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td className="p-[14px_16px]">
                    <span className={`p-[4px_10px] rounded-[20px] text-[11px] font-[800] uppercase tracking-wider ${u.role === 'admin' ? 'bg-[rgba(168,85,247,0.15)] text-[#a855f7]' : 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]'}`}>
                      {u.role || 'customer'}
                    </span>
                  </td>
                  <td className="p-[14px_16px]">
                    <div className="action-btns">
                      <button onClick={() => deleteUser(u._id)} className="p-[6px_10px] bg-[#ef4444] text-white rounded-[6px] text-[12px] font-[600] hover:bg-[#dc2626]">
                        <i className="fa-solid fa-trash"></i> Delete
                      </button>
                    </div>
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
