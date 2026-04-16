'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/src/config';
import { getImageUrl } from '@/src/utils/imagePaths';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/blogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBlogs(data.blogs);
    } catch (err) {
      console.warn('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this blog?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/blogs/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBlogs();
    } catch (err) {
      alert('Deletion failed');
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  if (loading) return <div className="p-8 text-[#94a3b8]">Loading blogs...</div>;

  return (
    <div className="admin-content">
      <div className="admin-card bg-[#1e293b] border border-[#334155] rounded-[12px] m-[25px_30px] overflow-hidden">
        <div className="card-header flex items-center justify-between p-[18px_22px] border-b border-[#334155]">
          <h3 className="text-[16px] font-[700] text-[#f1f5f9]">Manage Blogs ({blogs.length})</h3>
          <Link href="/admin/blogs/add" className="admin-btn bg-[#ffd700] text-[#0f172a] inline-flex items-center gap-[6px] p-[6px_12px] rounded-[7px] text-[12px] font-[600] transition-all">
            <i className="fa-solid fa-plus"></i> Add New Blog
          </Link>
        </div>

        {blogs.length > 0 ? (
          <div className="table-responsive w-full overflow-x-auto">
            <table className="admin-table w-full border-collapse">
              <thead>
                <tr className="bg-[#0f172a]">
                  <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Image</th>
                  <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Title & Date</th>
                  <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b._id} className="hover:bg-white/2 border-b border-[#334155]">
                    <td className="p-[14px_16px]">
                      <img 
                        src={getImageUrl(b.image)} 
                        alt="" 
                        className="w-[60px] h-[60px] object-cover rounded-[4px] border border-[#334155]" 
                      />
                    </td>
                    <td className="p-[14px_16px] text-[14px] text-[#f1f5f9]">
                      <strong className="block">{b.title}</strong>
                      <small className="text-[#94a3b8]">{new Date(b.date).toLocaleDateString()}</small>
                    </td>
                    <td className="p-[14px_16px]">
                      <div className="flex gap-[8px]">
                        <Link href={`/admin/blogs/edit/${b._id}`} className="p-[6px_12px] bg-[#ffd700] text-[#0f172a] rounded-[7px] text-[12px] font-[600]">
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </Link>
                        <button onClick={() => handleDelete(b._id)} className="p-[6px_12px] bg-[#ef4444] text-white rounded-[7px] text-[12px] font-[600]">
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-[50px] text-[#94a3b8]">
            <i className="fa-solid fa-newspaper text-[50px] mb-[15px] block opacity-20"></i>
            <p>No blogs published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
