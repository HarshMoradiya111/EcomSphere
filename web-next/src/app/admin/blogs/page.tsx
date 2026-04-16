'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/config';
import { getImageUrl } from '@/utils/imagePaths';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/blogs`);
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      console.error('Core sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('🚨 Decommission this bulletin? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/blogs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBlogs();
    } catch (err) {
      console.error('Core purge failure');
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-400 font-black uppercase tracking-widest text-xs">Accessing Information Core...</div>;

  return (
    <div className="p-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      <header className="flex justify-between items-center mb-16">
        <div>
          <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-indigo-400">
             <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Content Distribution
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter italic">News <span className="text-indigo-400 not-italic">Engine</span></h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Manage global communication and blog publications</p>
        </div>
        <Link 
            href="/admin/blogs/new" 
            className="px-8 py-5 bg-indigo-500 text-white font-black rounded-3xl hover:bg-indigo-400 shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-tighter"
        >
            ➕ Dispatch Bulletin
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogs.map((b, idx) => (
              <div key={idx} className="bg-slate-800/20 backdrop-blur-3xl border border-slate-700/30 rounded-[3.5rem] overflow-hidden group shadow-2xl relative">
                  <div className="aspect-video bg-slate-900 relative overflow-hidden">
                      <img 
                        src={getImageUrl(b.image)} 
                        alt="Blog" 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                      />
                      <div className="absolute top-6 left-6 px-4 py-2 rounded-2xl bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
                          {new Date(b.date).toLocaleDateString()}
                      </div>
                  </div>
                  <div className="p-10">
                      <h3 className="text-xl font-black text-white mb-4 line-clamp-2 uppercase tracking-tighter leading-snug group-hover:text-indigo-400 transition-colors">{b.title}</h3>
                      <p className="text-slate-500 font-medium line-clamp-3 mb-8 text-sm leading-relaxed">{b.content.replace(/<[^>]*>/g, '').slice(0, 150)}...</p>
                      <div className="flex gap-4">
                          <Link 
                            href={`/admin/blogs/edit/${b._id}`}
                            className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all text-center"
                          >
                            Modify
                          </Link>
                          <button 
                            onClick={() => handleDelete(b._id)}
                            className="flex-1 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                          >
                            Decommission
                          </button>
                      </div>
                  </div>
              </div>
          ))}
          {blogs.length === 0 && <p className="col-span-full py-20 text-center text-slate-600 uppercase font-black tracking-widest">No Bulletins Dispatched</p>}
      </div>
    </div>
  );
}
