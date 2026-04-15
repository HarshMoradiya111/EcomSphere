'use client';

import { useState } from 'react';
import type { FooterPartialProps } from './types';

function resolveLogoSrc(logo?: string | null): string {
  if (!logo || !logo.trim()) {
    return '/img/logo1.png';
  }

  const value = logo.trim();
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }

  return `/uploads/${value}`;
}

export default function FooterPartial({ settings, sessionUser = null }: FooterPartialProps) {
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);
  const logoSrc = resolveLogoSrc(settings?.logo);

  return (
    <>
      <footer className="section-p1">
        <div className="col">
          <h4>Contact</h4>
          <p><strong>Address:</strong> {settings?.address || 'SSCCS'}</p>
          <p><strong>Phone:</strong> {settings?.phone || '+91 8160730726, +91 6359401196'}</p>
          <p><strong>Hours:</strong> {settings?.hours || '10:00 - 18:00, Mon - Sat'}</p>
          <div className="follow">
            <h4>Follow Us</h4>
            <div className="icon">
              <i id="insta"><a href="#"><img src="/img/facebook.svg" className="ins" height={20} alt="Facebook" /></a></i>
              <i id="insta"><a href="#"><img src="/img/insta.svg" className="ins" height={20} alt="Instagram" /></a></i>
            </div>
          </div>
        </div>

        <div className="col">
          <h4>About</h4>
          <a href="/faq">FAQ</a>
          <a href="/terms">Terms & Conditions</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/refund-shipping">Refund & Shipping</a>
          <a href="/contact">Contact Us</a>
        </div>

        <div className="col">
          <h4>My Account</h4>
          {sessionUser ? (
            <>
              <a href="/profile">My Profile</a>
              <a href="/cart">View Cart</a>
              <a href="/profile">Track My Order</a>
              <a href="/auth/logout">Logout</a>
            </>
          ) : (
            <>
              <a href="/auth/login">Sign In</a>
              <a href="/cart">View Cart</a>
              <a href="/auth/register">Register</a>
              <a href="/faq">Help & FAQ</a>
            </>
          )}
        </div>

        <div className="col install">
          <h4>Install App</h4>
          <p>From App Store or Google Play</p>
          <div className="row">
            <img src="/img/pay/app.jpg" alt="App Store" />
            <img src="/img/pay/play.jpg" alt="Google Play" />
          </div>
          <p>Secure Payment Gateway</p>
          <img src="/img/pay/pay.png" alt="Payment Methods" />
        </div>

        <div className="copyright">
          <p>2025, EcomSphere &copy; All Rights Reserved</p>
        </div>
      </footer>

      <div id="help-widget">
        <div id="help-bubble" onClick={() => setHelpPanelOpen((v) => !v)}>
          <i className="fa-solid fa-message"></i>
          <span className="help-label">Help</span>
        </div>

        <div id="help-panel" className={helpPanelOpen ? '' : 'hidden'}>
          <div className="help-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={logoSrc} height={30} onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/img/logo1.png';
              }} alt="EcomSphere" />
              <div>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Help Center</h4>
                <small style={{ color: '#22c55e' }}><i className="fa-solid fa-circle" style={{ fontSize: '8px' }}></i> We&apos;re online!</small>
              </div>
            </div>
            <button onClick={() => setHelpPanelOpen((v) => !v)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="help-body">
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#555' }}>👋 Hi! How can we help you today?</p>

            <div className="help-actions">
              <a href="https://wa.me/918160730726?text=Hi%20EcomSphere,%20I%20have%20a%20query" target="_blank" className="help-btn whatsapp" rel="noreferrer">
                <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
              </a>
              <a href="mailto:support@ecomsphere.com" className="help-btn email">
                <i className="fa-solid fa-envelope"></i> Email Support
              </a>
              <a href="/faq" className="help-btn faq">
                <i className="fa-solid fa-circle-question"></i> Browse FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
