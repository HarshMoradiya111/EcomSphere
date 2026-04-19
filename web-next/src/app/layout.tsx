import type { Metadata } from 'next';
import StorefrontBridge from '@/components/ejs-partials/StorefrontBridge';
import './globals.css';


export const metadata: Metadata = {
  title: 'EcomSphere',
  description: 'Your one-stop e-commerce destination',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans">
        {children}
        <StorefrontBridge />
      </body>
    </html>
  );
}
