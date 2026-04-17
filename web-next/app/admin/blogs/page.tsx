'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/src/config';
import { getImageUrl } from '@/src/utils/imagePaths';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Style',
    image: null as File | null
  });

  const fetchBlogs = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/blogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBlogs(data.blogs);
    } catch (e) {
      console.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Purge this article from the network?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBlogs();
    } catch (e) {
      alert('Deactivation failure.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const method = editingBlog ? 'PUT' : 'POST';
    const url = editingBlog 
      ? `${API_URL}/api/v1/admin/blogs/${editingBlog._id}` 
      : `${API_URL}/api/v1/admin/blogs`;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    if (formData.image) data.append('image', formData.image);

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      const resData = await res.json();
      if (resData.success) {
        setShowModal(false);
        setEditingBlog(null);
        setFormData({ title: '', description: '', category: 'Style', image: null });
        fetchBlogs();
      }
    } catch (e) {
      alert('Sync failure: Storage buffer overflow.');
    }
  };

  const openEditModal = (blog: any) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      description: blog.description,
      category: blog.category || 'Style',
      image: null
    });
    setShowModal(true);
  };

  if (loading) return <div className="p-10 font-black text-[#64748b] tracking-widest uppercase text-[12px]">Decrypting Article Cluster...</div>;

  return (
    <div className="admin-content" style={{ padding: '25px 30px' }}>
      <div className="flex justify-between items-end mb-8 pb-6 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Article Governance</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-[0.2em]">Curate the Editorial Nexus</p>
        </div>
        <button 
            onClick={() => { setEditingBlog(null); setShowModal(true); }}
            className="btn-core btn-primary"
        >
          <i className="fa-solid fa-plus mr-2"></i> Deploy Article
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Visual</th>
              <th>Identity & Timestamp</th>
              <th>Sector</th>
              <th className="text-right">Linkages</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length > 0 ? blogs.map((blog: any) => (
              <tr key={blog._id}>
                <td className="py-4">
                  <img src={getImageUrl(blog.image)} className="w-[60px] h-[60px] object-cover rounded-md border border-[var(--border)]" alt="" />
                </td>
                <td className="py-4">
                  <p className="font-bold text-white text-[15px] mb-1">{blog.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">{new Date(blog.date).toLocaleDateString()}</p>
                </td>
                <td><span className="badge-pill">{blog.category || 'General'}</span></td>
                <td className="text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(blog)} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-2">
                            <i className="fa-solid fa-pen-nib text-[14px]"></i>
                        </button>
                        <button onClick={() => handleDelete(blog._id)} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors p-2">
                            <i className="fa-solid fa-square-minus text-[14px]"></i>
                        </button>
                    </div>
                </td>
              </tr>
            )) : (
              <tr>
                 <td colSpan={4} className="py-20 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest text-[11px]">
                    Article cluster is offline.
                 </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL SYSTEM */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-[var(--surface)] border border-[var(--border)] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-header)] flex justify-between items-center">
                    <h3 className="text-[13px] font-black text-white uppercase tracking-widest">
                        {editingBlog ? 'Modify Article Slot' : 'New Article injection'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-2">
                    <div className="form-group">
                        <label>Asset Title</label>
                        <input 
                            type="text" 
                            required 
                            className="admin-input" 
                            placeholder="ARTICLE HEADLINE"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Thumbnail Vector</label>
                        <input 
                            type="file" 
                            className="admin-input" 
                            onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sector</label>
                        <select 
                            className="admin-input"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <option>Style</option>
                            <option>Tech</option>
                            <option>Finance</option>
                            <option>General</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Metadata Description</label>
                        <textarea 
                            required 
                            rows={4}
                            className="admin-input min-h-[100px] resize-none" 
                            placeholder="BODY DATA..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-core btn-secondary !h-12">Abort</button>
                        <button type="submit" className="flex-1 btn-core btn-primary !h-12 !text-[13px]">
                            {editingBlog ? 'Sync Article' : 'Initialize'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
