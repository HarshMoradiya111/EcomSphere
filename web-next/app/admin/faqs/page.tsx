'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/src/config';

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

  if (loading) return <div className="p-10 font-black text-[#64748b] tracking-widest uppercase text-[12px]">Decrypting Knowledge Matrix...</div>;

  return (
    <div className="admin-content" style={{ padding: '25px 30px' }}>
      <div className="flex justify-between items-end mb-8 pb-6 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Knowledge Governance</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-[0.2em]">Curate the Customer support Nexus</p>
        </div>
        <button 
            onClick={() => { setEditingFaq(null); setShowModal(true); }}
            className="btn-core btn-primary"
        >
          <i className="fa-solid fa-plus mr-2"></i> Deploy Question
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Knowledge Node</th>
              <th>Sector</th>
              <th>Priority</th>
              <th>Visibility</th>
              <th className="text-right">Linkages</th>
            </tr>
          </thead>
          <tbody>
            {faqs.length > 0 ? faqs.map((faq: any) => (
              <tr key={faq._id}>
                <td className="py-4 font-bold text-white text-[14px]">{faq.question}</td>
                <td><span className="badge-pill">{faq.category}</span></td>
                <td className="font-black text-[var(--text-muted)] text-[12px]">{faq.order}</td>
                <td>
                  <span className={`badge-pill ${faq.isVisible ? '!text-[var(--success)] !border-[var(--success)]/20' : '!text-[var(--danger)] !border-[var(--danger)]/20'}`}>
                    {faq.isVisible ? 'ACTIVE' : 'DORMANT'}
                  </span>
                </td>
                <td className="text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(faq)} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-2">
                            <i className="fa-solid fa-pen-nib text-[14px]"></i>
                        </button>
                        <button onClick={() => handleDelete(faq._id)} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors p-2">
                            <i className="fa-solid fa-square-minus text-[14px]"></i>
                        </button>
                    </div>
                </td>
              </tr>
            )) : (
              <tr>
                 <td colSpan={5} className="py-20 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest text-[11px]">
                    Knowledge cluster is offline.
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
                        {editingFaq ? 'Modify Awareness Slot' : 'New Knowledge injection'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="form-group">
                        <label>Primary Query</label>
                        <input 
                            type="text" 
                            required 
                            className="admin-input" 
                            placeholder="WHAT IS THE PROTOCOL?"
                            value={formData.question}
                            onChange={(e) => setFormData({...formData, question: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Resolution Data</label>
                        <textarea 
                            required 
                            rows={4}
                            className="admin-input min-h-[120px] resize-none" 
                            placeholder="ACCESS GRANTED..."
                            value={formData.answer}
                            onChange={(e) => setFormData({...formData, answer: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="form-group">
                            <label>Sector</label>
                            <select 
                                className="admin-input"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option>General</option>
                                <option>Shipping</option>
                                <option>Returns</option>
                                <option>Payment</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Priority Order</label>
                            <input 
                                type="number" 
                                className="admin-input text-center" 
                                value={formData.order}
                                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <input 
                            type="checkbox" 
                            id="broadcast-check"
                            className="w-4 h-4 rounded border-[var(--border)] bg-black accent-[var(--accent)]"
                            checked={formData.isVisible}
                            onChange={(e) => setFormData({...formData, isVisible: e.target.checked})}
                        />
                        <label htmlFor="broadcast-check" className="text-[11px] font-bold text-white uppercase tracking-wider cursor-pointer">Broadcast Enabled</label>
                    </div>
                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-core btn-secondary !h-12">Abort</button>
                        <button type="submit" className="flex-1 btn-core btn-primary !h-12 !text-[13px]">
                            {editingFaq ? 'Sync Node' : 'Initialize'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
