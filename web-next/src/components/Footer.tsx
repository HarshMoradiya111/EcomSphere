'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 p-24 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        
        {/* Brand Column */}
        <div className="md:col-span-1">
          <Link href="/" className="text-3xl font-black text-teal-950 tracking-tighter uppercase mb-8 block">
            Ecom<span className="text-teal-600 italic">Sphere</span>
          </Link>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8 leading-loose">
            Premium Digital Terminal. <br/>
            Engineered for High-Velocity <br/>
            Ecommerce Deployment.
          </p>
          <div className="flex gap-4">
             {['fb', 'tw', 'ig', 'li'].map(s => (
                 <div key={s} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-teal-600 hover:border-teal-600 transition-all cursor-pointer uppercase font-black text-[10px]">
                    {s}
                 </div>
             ))}
          </div>
        </div>

        {/* Global Links */}
        <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-800">Directives</h3>
            <div className="flex flex-col gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
                <Link href="/" className="hover:text-black transition-colors underline-offset-4 hover:underline decoration-teal-600">Global Hub</Link>
                <Link href="/blog" className="hover:text-black transition-colors underline-offset-4 hover:underline decoration-teal-600">Journal Stream</Link>
                <Link href="/cart" className="hover:text-black transition-colors underline-offset-4 hover:underline decoration-teal-600">Secure Bag</Link>
                <Link href="/admin/login" className="hover:text-black transition-colors underline-offset-4 hover:underline decoration-teal-600">Terminal Access</Link>
            </div>
        </div>

        {/* Categories */}
        <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-800">Verticals</h3>
            <div className="flex flex-col gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
                <Link href="/shop" className="hover:text-black transition-colors">Men Clothing</Link>
                <Link href="/shop" className="hover:text-black transition-colors">Women Clothing</Link>
                <Link href="/shop" className="hover:text-black transition-colors">Footwear Hub</Link>
                <Link href="/shop" className="hover:text-black transition-colors">Cosmetics Archive</Link>
            </div>
        </div>

        {/* Payment & Contact */}
        <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-800">Contact Payload</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-relaxed">
                Gujarat, India <br/>
                SSCCS HQ <br/>
                +91 81607 30726
            </p>
            <div className="pt-6 border-t border-gray-100">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-800 mb-4 text-left">Gateway Integrity</h3>
                <img src="${API_URL}/img/pay/pay.png" className="w-48 opacity-40 hover:opacity-100 transition-opacity" alt="Secure Pay" />
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-24 pt-12 border-t border-gray-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
          <p>© 2026 EcomSphere Global Terminal. All Rights Encrypted.</p>
          <p>Powered by Next.js 15 & Express V2</p>
      </div>
    </footer>
  );
}
