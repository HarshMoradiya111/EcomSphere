'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BulkUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const res = await fetch('${API_URL}/api/v1/admin/products/bulk', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert(`Successfully imported ${data.count} SKU nodes into the global catalog 🚀`);
        router.push('/admin/products');
      } else {
        alert(`Core Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Terminal breach during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
      <header className="mb-16">
          <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-cyan-400">
             <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Mass Ingestion Protocol
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter italic">Bulk <span className="text-cyan-400 not-italic">Deploy</span></h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Inject high-volume SKU payloads into the distributed database via CSV</p>
      </header>

      <form onSubmit={handleUpload} className="bg-slate-800/10 backdrop-blur-3xl p-16 rounded-[4rem] border border-slate-700/30 shadow-2xl text-center space-y-12">
          <div 
             className="border-2 border-dashed border-slate-800 rounded-[3rem] p-20 hover:border-cyan-500/50 transition-all cursor-pointer bg-slate-900/40 group shadow-inner"
             onClick={() => document.getElementById('csv-file')?.click()}
          >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-500 opacity-40 group-hover:opacity-100">📂</div>
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs mb-4">
                  {file ? file.name : 'Select CSV Payload Vector'}
              </p>
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">DRAG & DROP OR CLICK TO BROWSE</p>
              <input 
                 type="file" 
                 id="csv-file" 
                 accept=".csv" 
                 onChange={handleFileChange} 
                 className="hidden" 
              />
          </div>

          <div className="space-y-4">
              <button 
                  type="submit" 
                  disabled={!file || uploading}
                  className="w-full py-6 bg-cyan-500 text-white font-black rounded-3xl hover:bg-cyan-400 transition-all uppercase tracking-widest text-sm shadow-xl shadow-cyan-500/10 disabled:opacity-30"
              >
                  {uploading ? 'INGESTING PAYLOAD...' : 'INITIALIZE MASS IMPORT'}
              </button>
              <button 
                  type="button" 
                  onClick={() => router.push('/admin/products')}
                  className="w-full py-6 bg-slate-900 text-slate-400 font-black rounded-3xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px]"
              >
                  Abort Transmission
              </button>
          </div>
      </form>

      <div className="mt-16 p-10 bg-slate-900/40 rounded-[3rem] border border-slate-800/50">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Data Structure Integrity Guidelines</h3>
          <ul className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <li className="flex gap-3"><span className="text-cyan-500">▶</span> Name (Req)</li>
              <li className="flex gap-3"><span className="text-cyan-500">▶</span> Price (Req)</li>
              <li className="flex gap-3"><span className="text-cyan-500">▶</span> Category</li>
              <li className="flex gap-3"><span className="text-cyan-500">▶</span> Description</li>
              <li className="flex gap-3"><span className="text-cyan-500">▶</span> Image</li>
              <li className="flex gap-3"><span className="text-cyan-500">▶</span> CountInStock</li>
          </ul>
      </div>
    </div>
  );
}
