'use client';

import { useState } from 'react';
import type { FooterPartialProps } from './types';
import Link from 'next/link';
import { API_URL } from '@/config';

function resolveLogoSrc(logo?: string | null): string {
  if (!logo || !logo.trim()) {
    return `${API_URL}/img/logo.png`;
  }
  const value = logo.trim();
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (value.startsWith('/')) {
    return `${API_URL}${value}`;
  }
  return `${API_URL}/uploads/${value}`;
}

export default function FooterPartial({ settings, sessionUser = null }: FooterPartialProps) {
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  
  const logoSrc = resolveLogoSrc(settings?.logo);

  const toggleSection = (name: string) => {
    setOpenSection(openSection === name ? null : name);
  };

  return (
    <>
      <footer className="bg-white border-t border-gray-100 pt-12 pb-8 px-4 md:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          
          {/* BRAND & CONTACT SECTION */}
          <div className="flex-1 min-w-[250px]">
            <Link href="/" className="inline-block mb-6">
               <img src={logoSrc} className="h-8 md:h-10 w-auto" alt="EcomSphere" />
            </Link>
            <div className="space-y-4">
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Contact Us</h4>
              <p className="text-sm text-gray-500 flex gap-3 leading-relaxed">
                <i className="fa-solid fa-location-dot mt-1 text-[#088178]"></i>
                <span><strong>Address:</strong> {settings?.address || 'EcomSphere HQ, SSCCS, Gujarat, India'}</span>
              </p>
              <p className="text-sm text-gray-500 flex gap-3">
                <i className="fa-solid fa-phone mt-1 text-[#088178]"></i>
                <span><strong>Phone:</strong> {settings?.phone || '+91 8160730726, +91 6359401196'}</span>
              </p>
              <p className="text-sm text-gray-500 flex gap-3">
                <i className="fa-solid fa-clock mt-1 text-[#088178]"></i>
                <span><strong>Hours:</strong> {settings?.hours || '10:00 - 18:00, Mon - Sat'}</span>
              </p>
            </div>
            
            {/* SOCIAL ICONS ROW */}
            <div className="mt-8">
               <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Follow Us</h4>
               <div className="flex gap-4">
                  {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                    <a key={social} href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-[#088178] hover:text-white transition-all shadow-sm border border-gray-100">
                      <i className={`fa-brands fa-${social} text-lg`}></i>
                    </a>
                  ))}
               </div>
            </div>
          </div>

          {/* ACCORDION SECTIONS ON MOBILE, COLUMNS ON DESKTOP */}
          <div className="flex-[2] grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10">
            
            {/* SECTION 1: ABOUT */}
            <div className="border-b md:border-none border-gray-100 pb-2 md:pb-0">
               <button 
                 onClick={() => toggleSection('about')}
                 className="w-full flex justify-between items-center py-4 md:py-0 md:mb-6 md:cursor-default"
               >
                 <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Company</h4>
                 <i className={`fa-solid fa-chevron-down md:hidden transition-transform duration-300 ${openSection === 'about' ? 'rotate-180' : ''}`}></i>
               </button>
               <ul className={`space-y-3 overflow-hidden md:overflow-visible transition-all duration-300 ${openSection === 'about' ? 'max-h-60 pb-4' : 'max-h-0 md:max-h-full'}`}>
                 <li><Link href="/about" className="text-sm text-gray-500 hover:text-[#088178] transition-colors font-medium">About EcomSphere</Link></li>
                 <li><Link href="/faq" className="text-sm text-gray-500 hover:text-[#088178] transition-colors font-medium">Delivery Information</Link></li>
                 <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-[#088178] transition-colors font-medium">Privacy Policy</Link></li>
                 <li><Link href="/terms" className="text-sm text-gray-500 hover:text-[#088178] transition-colors font-medium">Terms & Conditions</Link></li>
                 <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[#088178] transition-colors font-medium">Contact Us</Link></li>
               </ul>
            </div>

            {/* SECTION 2: ACCOUNT */}
            <div className="border-b md:border-none border-gray-100 pb-2 md:pb-0">
               <button 
                 onClick={() => toggleSection('account')}
                 className="w-full flex justify-between items-center py-4 md:py-0 md:mb-6 md:cursor-default"
               >
                 <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">My Account</h4>
                 <i className={`fa-solid fa-chevron-down md:hidden transition-transform duration-300 ${openSection === 'account' ? 'rotate-180' : ''}`}></i>
               </button>
               <ul className={`space-y-3 overflow-hidden md:overflow-visible transition-all duration-300 ${openSection === 'account' ? 'max-h-60 pb-4' : 'max-h-0 md:max-h-full'}`}>
                 <li><Link href="/auth/login" className="text-sm text-gray-500 hover:text-[#088178] font-medium transition-colors">Sign In</Link></li>
                 <li><Link href="/cart" className="text-sm text-gray-500 hover:text-[#088178] font-medium transition-colors">View Cart</Link></li>
                 <li><Link href="/wishlist" className="text-sm text-gray-500 hover:text-[#088178] font-medium transition-colors">My Wishlist</Link></li>
                 <li><Link href="/profile" className="text-sm text-gray-500 hover:text-[#088178] font-medium transition-colors">Track My Order</Link></li>
                 <li><Link href="/faq" className="text-sm text-gray-500 hover:text-[#088178] font-medium transition-colors">Help & FAQ</Link></li>
               </ul>
            </div>

            {/* SECTION 3: INSTALL APP */}
            <div className="pb-2 md:pb-0">
               <button className="w-full flex justify-between items-center py-4 md:py-0 md:mb-6 md:cursor-default">
                 <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">App & Payment</h4>
               </button>
               <div className="space-y-4">
                 <p className="text-sm text-gray-500 font-medium">Experience EcomSphere on mobile.</p>
                 <div className="flex gap-2">
                    <img src="/img/pay/app.jpg" className="h-10 border border-gray-100 rounded-md cursor-pointer" alt="App Store" />
                    <img src="/img/pay/play.jpg" className="h-10 border border-gray-100 rounded-md cursor-pointer" alt="Google Play" />
                 </div>
                 <p className="text-sm text-gray-500 font-medium mt-6">Secure Payment Methods</p>
                 <img src="/img/pay/pay.png" className="w-full max-w-[280px] h-auto grayscale opacity-70" alt="Payment Methods" />
               </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT AREA */}
        <div className="max-w-7xl mx-auto border-t border-gray-50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-xs font-bold text-gray-400">© 2025 EcomSphere. Build by Creative Minds.</p>
           <div className="flex gap-6">
              <Link href="/privacy" className="text-[10px] font-black uppercase text-gray-300 hover:text-[#088178] tracking-widest">Privacy</Link>
              <Link href="/terms" className="text-[10px] font-black uppercase text-gray-300 hover:text-[#088178] tracking-widest">Terms</Link>
              <Link href="/refund-shipping" className="text-[10px] font-black uppercase text-gray-300 hover:text-[#088178] tracking-widest">Returns</Link>
           </div>
        </div>
      </footer>

      {/* FLOATING HELP WIDGET */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-[1000] flex flex-col items-end">
        {helpPanelOpen && (
          <div className="mb-4 w-[300px] md:w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="bg-[#088178] p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center border border-white/40">
                      <i className="fa-solid fa-headset text-xl"></i>
                   </div>
                   <div>
                      <h4 className="font-bold text-lg leading-tight">Help Center</h4>
                      <div className="flex items-center gap-1 text-[10px] font-bold opacity-80 uppercase tracking-tighter">
                         <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span> We're Online
                      </div>
                   </div>
                </div>
                <button onClick={() => setHelpPanelOpen(false)} className="hover:bg-black/10 p-2 rounded-full transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
             </div>
             <div className="p-6">
                <p className="text-gray-600 text-sm mb-6 font-medium leading-relaxed">👋 Hi! Need help with an order or product? Chat with our team now.</p>
                <div className="space-y-3">
                   <a href="https://wa.me/918160730726" target="_blank" className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-100 hover:scale-[1.02] transition-transform">
                      <i className="fa-brands fa-whatsapp text-lg"></i> WhatsApp Us
                   </a>
                   <a href="mailto:support@ecomsphere.com" className="flex items-center justify-center gap-3 w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">
                      <i className="fa-solid fa-envelope"></i> Email Support
                   </a>
                   <Link href="/faq" onClick={() => setHelpPanelOpen(false)} className="flex items-center justify-center gap-3 w-full bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                      <i className="fa-solid fa-circle-question"></i> Browse FAQ
                   </Link>
                </div>
             </div>
          </div>
        )}
        <button 
          onClick={() => setHelpPanelOpen(!helpPanelOpen)}
          className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-2xl shadow-teal-200 transition-all duration-300 transform hover:rotate-12
            ${helpPanelOpen ? 'bg-gray-900 scale-90' : 'bg-[#088178] hover:scale-110'}`}
        >
          {helpPanelOpen ? <i className="fa-solid fa-minus text-2xl"></i> : <i className="fa-solid fa-message text-2xl"></i>}
        </button>
      </div>
    </>
  );
}
