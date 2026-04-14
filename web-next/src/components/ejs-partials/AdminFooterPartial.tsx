import Script from 'next/script';

export default function AdminFooterPartial() {
  return <Script src="/js/admin.js" strategy="afterInteractive" />;
}
