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
      <style dangerouslySetInnerHTML={{ __html: `
        .help-widget-container { position: fixed; bottom: 30px; right: 30px; z-index: 10000; display: flex; flex-direction: column; font-family: 'Poppins', sans-serif; }
        
        .help-toggle-btn {
          height: 64px;
          padding: 0 28px;
          border-radius: 32px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          border: none;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.3);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
        }
        .help-toggle-btn::before {
          content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px;
          background: linear-gradient(135deg, #fb923c, #088178);
          border-radius: 32px; z-index: -1; filter: blur(10px); opacity: 0; transition: opacity 0.4s;
        }
        .help-toggle-btn:hover { transform: translateY(-5px); }
        .help-toggle-btn:hover::before { opacity: 0.6; }
        .help-toggle-btn.open {
          border-radius: 50%;
          padding: 0;
          width: 64px;
          justify-content: center;
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .help-toggle-icon { font-size: 22px; transition: transform 0.4s; }
        .help-toggle-btn.open .help-toggle-icon { transform: rotate(90deg); }
        .help-toggle-text { transition: opacity 0.2s, width 0.2s; white-space: nowrap; }
        .help-toggle-btn.open .help-toggle-text { display: none; }

        .help-panel-premium {
          position: absolute;
          bottom: 85px;
          right: 0;
          width: 360px;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          border: 1px solid #f1f5f9;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-origin: bottom right;
        }
        .help-panel-premium.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        
        .hp-header {
          background: linear-gradient(135deg, #088178 0%, #06a899 100%);
          padding: 30px 25px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .hp-header::after {
          content: ''; position: absolute; bottom: -40px; right: -40px; width: 140px; height: 140px;
          background: rgba(255,255,255,0.1); border-radius: 50%;
        }
        .hp-header-content { display: flex; align-items: center; gap: 15px; position: relative; z-index: 2; }
        .hp-avatar {
          width: 54px; height: 54px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .hp-avatar i { color: #088178; font-size: 26px; }
        .hp-title h4 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
        .hp-status { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }
        .hp-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 10px #4ade80; animation: hpPulse 2s infinite; }
        @keyframes hpPulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); } }

        .hp-body { padding: 25px; }
        .hp-body p { margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6; font-weight: 500; }
        .hp-actions { display: flex; flex-direction: column; gap: 12px; }
        .hp-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px;
          border-radius: 14px; font-size: 14px; font-weight: 800; text-decoration: none; transition: all 0.3s;
        }
        .hp-btn-wa { background: #25d366; color: #fff; box-shadow: 0 8px 20px rgba(37, 211, 102, 0.2); }
        .hp-btn-wa:hover { background: #20b858; transform: translateY(-2px); box-shadow: 0 12px 25px rgba(37, 211, 102, 0.3); }
        .hp-btn-email { background: #0f172a; color: #fff; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2); }
        .hp-btn-email:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 12px 25px rgba(15, 23, 42, 0.3); }
        .hp-btn-faq { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .hp-btn-faq:hover { background: #e2e8f0; color: #0f172a; }
        
        @media (max-width: 768px) {
          .help-widget-container { bottom: 80px; right: 20px; }
          .help-panel-premium { width: calc(100vw - 40px); right: 0; }
          .help-toggle-btn { height: 56px; padding: 0 20px; }
          .help-toggle-btn.open { width: 56px; }
          .help-toggle-text { display: none; }
        }
      `}} />
      <div className="help-widget-container">
        <div className={`help-panel-premium ${helpPanelOpen ? 'visible' : ''}`}>
           <div className="hp-header">
              <div className="hp-header-content">
                 <div className="hp-avatar"><i className="fa-solid fa-headset"></i></div>
                 <div className="hp-title">
                    <h4>Help Center</h4>
                    <div className="hp-status"><span className="hp-dot"></span> Online Now</div>
                 </div>
              </div>
           </div>
           <div className="hp-body">
              <p>👋 Hi there! Need help with an order, sizing, or finding the perfect product? We're here for you.</p>
              <div className="hp-actions">
                 <a href="https://wa.me/918160730726" target="_blank" className="hp-btn hp-btn-wa">
                    <i className="fa-brands fa-whatsapp text-xl"></i> Chat on WhatsApp
                 </a>
                 <a href="mailto:support@ecomsphere.com" className="hp-btn hp-btn-email">
                    <i className="fa-solid fa-envelope text-lg"></i> Email Support
                 </a>
                 <Link href="/faq" onClick={() => setHelpPanelOpen(false)} className="hp-btn hp-btn-faq">
                    <i className="fa-solid fa-book"></i> Browse FAQ
                 </Link>
              </div>
           </div>
        </div>
        <button 
          onClick={() => setHelpPanelOpen(!helpPanelOpen)}
          className={`help-toggle-btn ${helpPanelOpen ? 'open' : ''}`}
          style={{ alignSelf: 'flex-end' }}
        >
          {helpPanelOpen ? (
             <i className="fa-solid fa-xmark help-toggle-icon"></i>
          ) : (
            <>
              <i className="fa-solid fa-message help-toggle-icon"></i>
              <span className="help-toggle-text">How can we help?</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
