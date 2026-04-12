'use client';

import { useEffect, useState } from 'react';

export default function CustomerSegments() {
  const [segments, setSegments] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSegments = async () => {
    try {
      const res = await fetch('${API_URL}/api/v1/admin/customers/segments');
      const data = await res.json();
      if (data.success) {
        setSegments(data.segments);
      }
    } catch (err) {
      console.error('Segmentation protocol failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-purple-400 font-black uppercase tracking-widest text-xs">Processing Behavioral Clusters...</div>;

  return (
    <div className="p-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      <header className="mb-16">
          <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-purple-400">
             <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span> Audience Intelligence
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter italic">Behavioral <span className="text-purple-400 not-italic">Clustering</span></h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Segmented audience data based on transactional velocity and lifetime value</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {Object.entries(segments || {}).map(([name, data]: [string, any]) => (
              <div key={name} className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/5 blur-[100px] group-hover:bg-purple-500/10 transition-all duration-1000"></div>
                  
                  <div className="flex justify-between items-end mb-10">
                      <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">{name}</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{data.length} Nodes Detected</p>
                      </div>
                      <span className="text-4xl font-black text-slate-800 italic">#{data.length}</span>
                  </div>

                  <div className="space-y-6">
                      {data.slice(0, 5).map((node: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50 hover:border-purple-500/30 transition-all">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-black text-purple-400 text-xs">
                                     {node.userDetails?.username?.[0] || 'U'}
                                  </div>
                                  <div>
                                      <p className="text-sm font-black text-white uppercase tracking-tight">{node.userDetails?.username}</p>
                                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{node.orderCount || 0} Orders Dispatched</p>
                                  </div>
                              </div>
                              <p className="text-lg font-black text-white italic tracking-tighter">₹{node.totalSpent?.toLocaleString() || 0}</p>
                          </div>
                      ))}
                      {data.length > 5 && (
                          <p className="text-center text-slate-500 font-black uppercase tracking-widest text-[9px] pt-4 opacity-50">+ {data.length - 5} More Nodes Hidden</p>
                      )}
                      {data.length === 0 && (
                          <div className="py-10 text-center border-2 border-dashed border-slate-800/50 rounded-[2.5rem]">
                              <p className="text-slate-700 font-black uppercase text-[10px] tracking-widest">No Active Segments</p>
                          </div>
                      )}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}
