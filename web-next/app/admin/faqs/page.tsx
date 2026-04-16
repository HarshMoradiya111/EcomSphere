'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/config';

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const fetchFAQs = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/faqs`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs);
      }
    } catch (err) {
      console.error('FAQ cluster access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/faqs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question, answer }),
      });
      if (res.ok) {
        setQuestion('');
        setAnswer('');
        fetchFAQs();
      }
    } catch (err) {
      console.error('Core push failed');
    }
  };

  const deleteFAQ = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/faqs/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchFAQs();
    } catch (err) {
      console.error('Purge failed');
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-cyan-400 font-black uppercase tracking-widest text-xs">Accessing Knowledge Base...</div>;

  return (
    <div className="p-12 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <header className="mb-16 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-cyan-400">
               <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Knowledge Matrix
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter italic">FAQ <span className="text-cyan-400 not-italic">Archive</span></h1>
            <p className="text-slate-500 font-medium text-lg mt-2">Manage consumer-facing intelligence and support nodes</p>
          </div>
      </header>

      {/* Creation Node */}
      <section className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl mb-16">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 pb-4 border-b border-slate-800/50">Inject New Metadata</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Inquiry Vector (Question)</label>
                  <input 
                    type="text" required value={question} onChange={e => setQuestion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none"
                  />
              </div>
              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Resolution Protocol (Answer)</label>
                  <input 
                    type="text" required value={answer} onChange={e => setAnswer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none"
                  />
              </div>
              <button type="submit" className="md:col-span-2 py-5 bg-cyan-500 text-white font-black rounded-3xl hover:bg-cyan-400 transition-all uppercase tracking-tighter shadow-xl shadow-cyan-500/20">
                  Commit to Archive
              </button>
          </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {faqs.map((f, idx) => (
              <div key={idx} className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-700/30 shadow-2xl group transition-all hover:bg-slate-800/20">
                  <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter group-hover:text-cyan-400 transition-colors leading-tight">Q: {f.question}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8">{f.answer}</p>
                  <div className="flex justify-end pt-6 border-t border-slate-800/50">
                      <button onClick={() => deleteFAQ(f._id)} className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-2xl font-black text-[10px] uppercase tracking-widest">
                          Purge Metadata
                      </button>
                  </div>
              </div>
          ))}
          {faqs.length === 0 && <p className="col-span-full py-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs animate-pulse">Archive Empty</p>}
      </div>
    </div>
  );
}
