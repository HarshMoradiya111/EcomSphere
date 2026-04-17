'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/src/config';
import { useAICatalogStore } from '@/src/store/aiCatalogStore';

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
    <div className="admin-content p-[30px] max-w-6xl mx-auto min-h-screen">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-[32px] font-[900] text-[#f1f5f9] tracking-tighter italic">
            AI Auto-<span className="text-[#ffd700] not-italic">Catalog</span>
          </h2>
          <p className="text-[#64748b] text-[13px] font-bold uppercase tracking-[2.5px] mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse"></span> Neural Spectral Synthesis
          </p>
        </div>
        <Link href="/admin/products" className="bg-[#1e293b] border border-[#334155] text-[#f1f5f9] px-5 py-2.5 rounded-[12px] text-[13px] font-[700] hover:bg-[#334155] transition-all">
          ← Command Center
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleUpload}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ffd700]/20 to-transparent rounded-[32px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-[#1e293b] border-2 border-dashed border-[#334155] rounded-[32px] p-20 flex flex-col items-center justify-center text-center transition-all hover:border-[#ffd700]/50 shadow-2xl">
                <div className="w-24 h-24 bg-[#ffd700]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
                  <i className="fa-solid fa-wand-magic-sparkles text-4xl text-[#ffd700]"></i>
                </div>
                <h3 className="text-2xl font-[900] text-[#f1f5f9] uppercase tracking-tight mb-2">Initialize Vision Cluster</h3>
                <p className="text-[#64748b] font-bold text-[12px] uppercase tracking-[2px]">Drop up to 20 vision assets or click to browse</p>
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
                <div key={i} className="aspect-square rounded-[18px] border-2 border-[#334155] overflow-hidden relative group">
                  <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="preview" />
                  <div className="absolute inset-0 bg-[#ffd700]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-[16px] text-rose-400 font-bold text-[11px] uppercase tracking-widest text-center">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || previews.length === 0}
              className={`mt-10 w-full py-6 rounded-[20px] font-[900] uppercase tracking-[3px] text-[14px] transition-all shadow-2xl ${
                isProcessing || previews.length === 0
                  ? 'bg-[#1e293b] text-[#334155] cursor-not-allowed border border-[#334155]'
                  : 'bg-[#ffd700] text-[#0f172a] hover:bg-white hover:scale-[1.01] active:scale-95 shadow-[0_15px_40px_-10px_rgba(255,215,0,0.3)]'
              }`}
            >
              {isProcessing ? 'CALCULATING NEURAL MATRIX...' : 'EXECUTE AI SYNTHESIS'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1e293b]/50 border border-[#334155] p-10 rounded-[40px] shadow-xl backdrop-blur-md">
            <h4 className="text-[#ffd700] font-[900] text-[11px] uppercase tracking-[2px] mb-8">Protocol Overview</h4>
            <div className="space-y-8">
              {[
                { step: '01', title: 'Spectral Recognition', desc: 'Gemini AI deconstructs textures, materials, and silhouettes.' },
                { step: '02', title: 'Metadata Synthesis', desc: 'Automated synthesis of high-conversion marketing copy.' },
                { step: '03', title: 'Cluster Deployment', desc: 'Verify and initialize directly to the global shop node.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="font-[900] text-[#334155] text-2xl italic leading-none">{item.step}</span>
                  <div>
                    <p className="text-[#f1f5f9] font-[800] uppercase text-[12px] tracking-tight">{item.title}</p>
                    <p className="text-[#64748b] text-[11px] leading-relaxed mt-1 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#ffd700]/10 to-transparent border border-[#ffd700]/10 p-10 rounded-[40px]">
             <p className="text-[#ffd700] text-[11px] font-[900] uppercase tracking-[2.5px] mb-2 flex items-center gap-2">
               <i className="fa-solid fa-cloud"></i> Cloud-Native
             </p>
             <p className="text-[#64748b] text-[11px] leading-relaxed font-bold">
               Assets are optimized through Cloudinary CDN with 99.9% uptime and global distribution.
             </p>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[1000] bg-[#0f172a]/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-10">
          <div className="relative w-48 h-48 flex items-center justify-center mb-12">
            <div className="absolute inset-0 border-[6px] border-[#ffd700]/10 rounded-full"></div>
            <div className="absolute inset-0 border-[6px] border-t-[#ffd700] rounded-full animate-spin"></div>
            <i className="fa-solid fa-brain text-5xl text-[#ffd700] animate-pulse"></i>
          </div>
          <h2 className="text-5xl font-[900] text-[#f1f5f9] tracking-tighter mb-4 italic uppercase">Neural <span className="text-[#ffd700] not-italic">Synchronizing</span></h2>
          <p className="text-[#64748b] font-bold uppercase tracking-[0.4em] text-[11px] animate-pulse">Mapping spectral data to catalog schemas...</p>
        </div>
      )}
    </div>
  );
}
