'use client';

import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import FloatingCart from "../../features/cart/FloatingCart";

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
