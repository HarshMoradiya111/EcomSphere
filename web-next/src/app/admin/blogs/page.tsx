'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/config';
import { getImageUrl } from '@/utils/imagePaths';

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

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm" role="status"></div>Decrypting Article Cluster...</div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Article Governance</h2>
          <p className="text-muted small fw-bold tracking-widest flex items-center gap-2 text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>Curate the Editorial Nexus</p>
        </div>
        <button 
            onClick={() => { setEditingBlog(null); setShowModal(true); }}
            className="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-sm"
        >
          <i className="fa-solid fa-plus"></i> Deploy Article
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: '12px' }}>
                <tr>
                  <th className="ps-4" style={{ width: '100px' }}>Visual</th>
                  <th>Identity & Timestamp</th>
                  <th>Sector</th>
                  <th className="text-end pe-4">Linkages</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length > 0 ? blogs.map((blog: any) => (
                  <tr key={blog._id}>
                    <td className="ps-4 py-3">
                      <img src={getImageUrl(blog.image)} className="img-thumbnail rounded" style={{ width: '60px', height: '60px', objectFit: 'cover' }} alt="" />
                    </td>
                    <td>
                      <p className="fw-bold text-dark mb-0" style={{ fontSize: '15px' }}>{blog.title}</p>
                      <p className="text-muted small fw-bold text-uppercase mb-0" style={{ fontSize: '10px', letterSpacing: '1px' }}>{new Date(blog.date).toLocaleDateString()}</p>
                    </td>
                    <td><span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">{blog.category || 'General'}</span></td>
                    <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                            <button onClick={() => openEditModal(blog)} className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                <i className="fa-solid fa-pen-nib"></i>
                            </button>
                            <button onClick={() => handleDelete(blog._id)} className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                <i className="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={4} className="py-5 text-center text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '2px' }}>
                        Article cluster is offline.
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-hidden="true" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-light border-bottom px-4 py-3">
                  <h5 className="modal-title fs-6 fw-bold text-dark text-uppercase tracking-widest m-0">
                    {editingBlog ? 'Modify Article Slot' : 'New Article Injection'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Asset Title</label>
                        <input 
                            type="text" 
                            required 
                            className="form-control" 
                            placeholder="ARTICLE HEADLINE"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Thumbnail Vector</label>
                        <input 
                            type="file" 
                            className="form-control" 
                            onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Sector</label>
                        <select 
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <option>Style</option>
                            <option>Tech</option>
                            <option>Finance</option>
                            <option>General</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Metadata Description</label>
                        <textarea 
                            required 
                            rows={4}
                            className="form-control resize-none" 
                            placeholder="BODY DATA..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="d-flex gap-2">
                        <button type="button" onClick={() => setShowModal(false)} className="btn btn-light border flex-grow-1 fw-bold text-uppercase" style={{ fontSize: '13px', letterSpacing: '1px' }}>Abort</button>
                        <button type="submit" className="btn btn-primary flex-grow-1 fw-bold text-uppercase" style={{ fontSize: '13px', letterSpacing: '1px' }}>
                            {editingBlog ? 'Sync Article' : 'Initialize'}
                        </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
