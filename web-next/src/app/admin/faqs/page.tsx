'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/config';

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
    isVisible: true
  });

  const fetchFaqs = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/faqs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setFaqs(data.faqs);
    } catch (e) {
      console.error('FAQ Fetch Failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Execute terminal purge for this knowledge asset?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchFaqs();
    } catch (e) {
      alert('Purge protocol aborted: Sector mismatch.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const method = editingFaq ? 'PUT' : 'POST';
    const url = editingFaq 
      ? `${API_URL}/api/v1/admin/faqs/${editingFaq._id}` 
      : `${API_URL}/api/v1/admin/faqs`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingFaq(null);
        setFormData({ question: '', answer: '', category: 'General', order: 0, isVisible: true });
        fetchFaqs();
      }
    } catch (e) {
      alert('Commitment failure: Knowledge buffer full.');
    }
  };

  const openEditModal = (faq: any) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isVisible: faq.isVisible ?? true
    });
    setShowModal(true);
  };

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm" role="status"></div>Decrypting Knowledge Matrix...</div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Knowledge Governance</h2>
          <p className="text-muted small fw-bold tracking-widest text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>Curate the Customer support Nexus</p>
        </div>
        <button 
            onClick={() => { setEditingFaq(null); setShowModal(true); }}
            className="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-sm"
        >
          <i className="fa-solid fa-plus"></i> Deploy Question
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: '12px' }}>
                <tr>
                  <th className="ps-4" style={{ width: '40%' }}>Knowledge Node</th>
                  <th>Sector</th>
                  <th>Priority</th>
                  <th>Visibility</th>
                  <th className="text-end pe-4">Linkages</th>
                </tr>
              </thead>
              <tbody>
                {faqs.length > 0 ? faqs.map((faq: any) => (
                  <tr key={faq._id}>
                    <td className="ps-4 py-3 fw-bold text-dark" style={{ fontSize: '14px' }}>{faq.question}</td>
                    <td><span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 text-uppercase">{faq.category}</span></td>
                    <td className="fw-bold text-muted" style={{ fontSize: '12px' }}>{faq.order}</td>
                    <td>
                      <span className={`badge px-2 py-1 border text-uppercase ${faq.isVisible ? 'bg-success bg-opacity-10 text-success border-success border-opacity-25' : 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25'}`}>
                        {faq.isVisible ? 'ACTIVE' : 'DORMANT'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                            <button onClick={() => openEditModal(faq)} className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                <i className="fa-solid fa-pen-nib"></i>
                            </button>
                            <button onClick={() => handleDelete(faq._id)} className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                <i className="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={5} className="py-5 text-center text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '2px' }}>
                        Knowledge cluster is offline.
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
                    {editingFaq ? 'Modify Awareness Slot' : 'New Knowledge Injection'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Primary Query</label>
                        <input 
                            type="text" 
                            required 
                            className="form-control" 
                            placeholder="WHAT IS THE PROTOCOL?"
                            value={formData.question}
                            onChange={(e) => setFormData({...formData, question: e.target.value})}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Resolution Data</label>
                        <textarea 
                            required 
                            rows={4}
                            className="form-control resize-none" 
                            placeholder="ACCESS GRANTED..."
                            value={formData.answer}
                            onChange={(e) => setFormData({...formData, answer: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-6">
                            <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Sector</label>
                            <select 
                                className="form-select"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option>General</option>
                                <option>Shipping</option>
                                <option>Returns</option>
                                <option>Payment</option>
                            </select>
                        </div>
                        <div className="col-6">
                            <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Priority Order</label>
                            <input 
                                type="number" 
                                className="form-control text-center" 
                                value={formData.order}
                                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="form-check form-switch mb-4">
                        <input 
                            type="checkbox" 
                            id="broadcast-check"
                            className="form-check-input"
                            checked={formData.isVisible}
                            onChange={(e) => setFormData({...formData, isVisible: e.target.checked})}
                            style={{ cursor: 'pointer' }}
                        />
                        <label htmlFor="broadcast-check" className="form-check-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px', cursor: 'pointer' }}>Broadcast Enabled</label>
                    </div>
                    <div className="d-flex gap-2">
                        <button type="button" onClick={() => setShowModal(false)} className="btn btn-light border flex-grow-1 fw-bold text-uppercase" style={{ fontSize: '13px', letterSpacing: '1px' }}>Abort</button>
                        <button type="submit" className="btn btn-primary flex-grow-1 fw-bold text-uppercase" style={{ fontSize: '13px', letterSpacing: '1px' }}>
                            {editingFaq ? 'Sync Node' : 'Initialize'}
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
