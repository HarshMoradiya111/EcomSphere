'use client';

import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import FloatingCart from "../../components/FloatingCart";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <FloatingCart />
    </>
  );
}
