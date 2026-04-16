'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';
import { useAICatalogStore } from '@/store/aiCatalogStore';

export default function AIUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPendingProducts = useAICatalogStore((state) => state.setPendingProducts);
  const setCategories = useAICatalogStore((state) => state.setCategories);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    generatePreviews(files);
  };

  const generatePreviews = (files: File[]) => {
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.length) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    Array.from(fileInputRef.current.files).forEach((file) => {
      formData.append('productImages', file);
    });

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/products/ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPendingProducts(data.products);
        setCategories(data.categories);
        router.push('/admin/products/ai/review');
      } else {
        setError(data.error || 'AI Analysis failed to ignite.');
      }
    } catch (err) {
      setError('Neural link synchronization failed. Check server status.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-12 max-w-[1200px] mx-auto min-h-screen">
      <header className="mb-12">
        <button 
          onClick={() => router.back()}
          className="text-cyan-400 font-black uppercase tracking-widest text-[10px] mb-4 hover:tracking-[0.2em] transition-all"
        >
          ← Return to Command Center
        </button>
        <h1 className="text-6xl font-black text-white tracking-tighter">
          AI Auto-<span className="text-cyan-400 italic">Catalog</span>
        </h1>
        <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-widest text-xs">
          Neural-powered product recognition & metadata synthesis
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleUpload}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-900 border-2 border-dashed border-slate-800 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center transition-all hover:border-cyan-500/50">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <span className="text-4xl text-cyan-400">✨</span>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Initialize Batch Upload</h3>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Drop up to 20 vision assets or click to browse</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
            </div>

            <div className="mt-10 grid grid-cols-4 md:grid-cols-6 gap-4">
              {previews.map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl border-2 border-slate-800 overflow-hidden relative group">
                  <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="preview" />
                  <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-black text-xs uppercase tracking-widest text-center">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || previews.length === 0}
              className={`mt-10 w-full py-6 rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-2xl ${
                isProcessing || previews.length === 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-cyan-500 text-slate-950 hover:bg-white hover:scale-[1.02] active:scale-95 shadow-cyan-500/20'
              }`}
            >
              {isProcessing ? 'SYNCHRONIZING NEURAL LINK...' : 'EXECUTE AI ANALYSIS'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem]">
            <h4 className="text-cyan-400 font-black text-[10px] uppercase tracking-widest mb-4">How it works</h4>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Recognition', desc: 'Gemini identifies objects, styles, and materials.' },
                { step: '02', title: 'Synthesis', desc: 'Automated generation of marketing copy & pricing.' },
                { step: '03', title: 'Integration', desc: 'Verify and launch directly to your shop.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="font-black text-slate-800 text-2xl italic leading-none">{item.step}</span>
                  <div>
                    <p className="text-white font-bold uppercase text-xs tracking-tighter">{item.title}</p>
                    <p className="text-slate-500 text-[11px] leading-relaxed mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-purple-500/5 border border-purple-500/10 p-8 rounded-[2.5rem]">
             <p className="text-purple-300 text-[10px] font-black uppercase tracking-widest mb-2">Cloud-Native Storage</p>
             <p className="text-slate-500 text-[11px] leading-relaxed">
               All vision assets are automatically optimized and served via Cloudinary CDN for ultra-low latency globally.
             </p>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-500">
          <div className="relative w-40 h-40 flex items-center justify-center mb-10">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
            <span className="text-4xl animate-pulse">🧠</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-4 italic uppercase">Neural Matrix <span className="text-cyan-400 not-italic">Processing</span></h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Deconstructing vision assets & mapping spectral data...</p>
        </div>
      )}
    </div>
  );
}
