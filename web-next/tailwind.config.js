/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // EcomSphere design tokens extracted from backend/public/css/style.css
      colors: {
        brand: {
          DEFAULT: '#088178',
          hover: '#066b64',
          light: '#e8f6ea',
          border: '#cce7d0',
          bg: '#f5fffe',
          muted: '#cce7de',
        },
        // Admin panel tokens from admin.css
        admin: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          text: '#f1f5f9',
          muted: '#94a3b8',
          accent: '#ffd700',
          'accent-hover': '#f0c800',
          primary: '#3b82f6',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
        // Status badge colours
        status: {
          pending: { bg: '#fff3cd', text: '#856404' },
          processing: { bg: '#cfe2ff', text: '#084298' },
          shipped: { bg: '#d1ecf1', text: '#0c5460' },
          delivered: { bg: '#d1e7dd', text: '#0f5132' },
          cancelled: { bg: '#f8d7da', text: '#842029' },
        },
        // Flash / toast colours
        toast: {
          success: '#088178',
          error: '#dc3545',
        },
        // Text colours used in style.css
        body: '#465b52',
        heading: '#222222',
        muted: '#606063',
      },
      fontFamily: {
        // Main storefront font
        spartan: ['Spartan', 'sans-serif'],
        // Admin panel font
        inter: ['Inter', 'sans-serif'],
        sans: ['Spartan', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': ['50px', { lineHeight: '64px' }],
        'h2': ['46px', { lineHeight: '54px' }],
        'h4': ['20px', { lineHeight: '1.4' }],
        'h6': ['12px', { lineHeight: '1', fontWeight: '700' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'sm-body': ['14px', { lineHeight: '1.5' }],
        'xs-body': ['13px', { lineHeight: '1.5' }],
      },
      spacing: {
        'section-x': '80px',
        'section-y': '40px',
      },
      borderRadius: {
        'card': '25px',
        'btn': '4px',
        'pill': '50px',
      },
      boxShadow: {
        'card': '20px 20px 30px rgba(0,0,0,0.02)',
        'card-hover': '20px 20px 30px rgba(0,0,0,0.06)',
        'header': '0 4px 10px rgba(0,0,0,0.05)',
        'search': '0 4px 12px rgba(8,129,120,0.1)',
        'toast': '0 8px 25px rgba(0,0,0,0.15)',
        'dropdown': '0 10px 30px rgba(0,0,0,0.1)',
      },
      zIndex: {
        'header': '999',
        'drawer': '99999',
        'overlay': '99998',
        'toast': '9999',
        'dropdown': '1000',
      },
    },
  },
  plugins: [],
};
