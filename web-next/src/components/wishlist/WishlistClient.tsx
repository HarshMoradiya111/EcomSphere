'use client';

import { useState } from 'react';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getToken } from '@/utils/auth';
import SafeImage from '@/components/SafeImage';
import { getProductImageSrc, getProductImageFallbackSrc } from '@/utils/imagePaths';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

interface Props {
  initialWishlist: Product[];
  sessionUser: string | null;
  settings: any;
}

export default function WishlistClient({ initialWishlist, sessionUser, settings }: Props) {
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRemovingId(productId);
    
    try {
      const response = await fetch('/api/v1/user/wishlist/toggle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      if (data.success) {
        setWishlist(wishlist.filter(p => p._id !== productId));
        window.dispatchEvent(new Event('wishlist-updated'));
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const WISHLIST_CSS = `
    .wl-page {
      font-family: "Poppins", -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      min-height: 100vh;
      padding-bottom: 80px;
    }
    
    /* Premium Header */
    .wl-header-wrap {
      background: #fff;
      padding: 40px 0;
      border-bottom: 1px solid #edf2f7;
      margin-bottom: 40px;
    }
    .wl-header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .wl-title {
      font-size: 32px;
      font-weight: 800;
      color: #1a1a2e;
      letter-spacing: -0.5px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .wl-title i {
      color: #ff4757;
      font-size: 28px;
    }
    .wl-count {
      font-size: 15px;
      color: #64748b;
      font-weight: 500;
      margin-top: 8px;
    }

    /* Grid Layout */
    .wl-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .wl-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 28px;
    }

    /* Card Styling */
    .wl-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #f0f4f8;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
      cursor: pointer;
    }
    .wl-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
    }
    .wl-card.removing {
      opacity: 0.5;
      pointer-events: none;
      transform: scale(0.95);
    }

    /* Image Wrapper */
    .wl-img-wrap {
      position: relative;
      aspect-ratio: 4/5;
      overflow: hidden;
      background: #f8fafc;
    }
    .wl-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .wl-card:hover .wl-img-wrap img {
      transform: scale(1.05);
    }

    /* Remove Button overlay */
    .wl-remove-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(4px);
      border: none;
      border-radius: 50%;
      color: #ff4757;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      z-index: 10;
    }
    .wl-remove-btn:hover {
      background: #fff0f2;
      transform: scale(1.1);
    }

    /* Content Area */
    .wl-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .wl-brand {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .wl-name {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 8px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .wl-price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }
    .wl-price {
      font-size: 18px;
      font-weight: 800;
      color: #088178;
      letter-spacing: -0.5px;
    }
    
    /* Add to Bag Button */
    .wl-add-btn {
      background: #088178;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .wl-add-btn:hover {
      background: #06655e;
      transform: translateY(-2px);
    }

    /* Empty State */
    .wl-empty {
      background: #fff;
      border-radius: 24px;
      padding: 80px 24px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      border: 1px dashed #cbd5e1;
      max-width: 600px;
      margin: 40px auto;
    }
    .wl-empty-icon {
      width: 100px;
      height: 100px;
      background: #fff0f2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      color: #ff4757;
      font-size: 40px;
    }
    .wl-empty h3 {
      font-size: 24px;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 12px;
    }
    .wl-empty p {
      font-size: 15px;
      color: #64748b;
      margin: 0 0 32px;
      line-height: 1.6;
    }
    .wl-shop-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #088178;
      color: #fff;
      padding: 14px 32px;
      border-radius: 50px;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(8,129,120,0.2);
    }
    .wl-shop-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(8,129,120,0.3);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: WISHLIST_CSS }} />
      <HeaderPartial activePage="wishlist" sessionUser={sessionUser} settings={settings} />
      
      <div className="wl-page">
        <div className="wl-header-wrap">
          <div className="wl-header-content">
            <h1 className="wl-title">
              <i className="fa-solid fa-heart" />
              My Wishlist
            </h1>
            <p className="wl-count">
              {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'} saved
            </p>
          </div>
        </div>

        <div className="wl-container">
          {wishlist.length > 0 ? (
            <div className="wl-grid">
              {wishlist.map((product) => (
                <div 
                  key={product._id} 
                  className={`wl-card ${removingId === product._id ? 'removing' : ''}`}
                  onClick={() => window.location.href = `/product/${product._id}`}
                >
                  <div className="wl-img-wrap">
                    <button 
                      className="wl-remove-btn" 
                      onClick={(e) => toggleWishlist(e, product._id)}
                      title="Remove from Wishlist"
                    >
                      {removingId === product._id ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        <i className="fa-solid fa-xmark" />
                      )}
                    </button>
                    <SafeImage
                      src={getProductImageSrc(product.image)}
                      fallbackSrc={getProductImageFallbackSrc(product.image)}
                      alt={product.name}
                    />
                  </div>
                  
                  <div className="wl-content">
                    <div className="wl-brand">{product.category}</div>
                    <h3 className="wl-name">{product.name}</h3>
                    
                    <div className="wl-price-row">
                      <div className="wl-price">₹{product.price.toLocaleString('en-IN')}</div>
                      <a
                        href="#"
                        className="wl-add-btn cart1 add-to-cart"
                        data-product-id={product._id}
                        data-name={product.name}
                        data-price={product.price}
                        data-image={product.image}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="fa-solid fa-bag-shopping" /> Add
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="wl-empty">
              <div className="wl-empty-icon">
                <i className="fa-regular fa-heart" />
              </div>
              <h3>Your wishlist is feeling lonely.</h3>
              <p>Explore our premium collections and add your favorite items here to purchase them later.</p>
              <Link href="/shop" className="wl-shop-btn">
                Continue Shopping <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
