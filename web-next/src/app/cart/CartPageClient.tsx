'use client';

import { useEffect, useMemo, useState } from 'react';
import StorefrontShell from '@/components/ejs-partials/StorefrontShell';
import { API_URL } from '@/config';
import { getToken } from '@/utils/auth';
import { getImageUrl } from '@/utils/imagePaths';
import Link from 'next/link';
import './cart.css';

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  subtotal: number;
};

type CartResponse = {
  success: boolean;
  cart: CartItem[];
  total: number;
  discountAmount?: number;
  appliedCoupon?: string | null;
  pointsUsed?: number;
  pointsDiscount?: number;
  error?: string;
};

interface CartPageClientProps {
  sessionUser: string | null;
  settings: any;
}

function formatPrice(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function CartPageClient({ sessionUser, settings }: CartPageClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/user/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setLoyaltyPoints(data.user.loyaltyPoints || 0);
    } catch (err) {
      console.error('Failed to fetch user points:', err);
    }
  };

  async function loadCart(isSilent = false) {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: 'include',
      });
      if (res.redirected) { window.location.href = '/auth/login'; return; }
      const data = (await res.json()) as CartResponse;
      if (data.success) {
        setCart(data.cart || []);
        setTotal(data.total || 0);
        setDiscountAmount(data.discountAmount || 0);
        setPointsDiscount(data.pointsDiscount || 0);
        setPointsUsed(data.pointsUsed || 0);
        setAppliedCoupon(data.appliedCoupon || null);
        
        // Dispatch global event for Header synchronization
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } else {
        setError(data.error || 'Failed to fetch cart');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch cart');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void loadCart(); 
    void fetchUserData(); 
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  async function updateCartItem(itemId: string, action: 'increase' | 'decrease') {
    // Optimistic UI Update
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = action === 'increase' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
        return { ...item, quantity: newQty, subtotal: item.price * newQty };
      }
      return item;
    }));

    setActionLoading(itemId);
    try {
      const res = await fetch(`${API_URL}/api/cart/update`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ itemId, action }),
      });
      const data = await res.json();
      if (data.success) {
        // Silent refresh to ensure sync with server-side calculations (coupons, points, etc.)
        await loadCart(true); 
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } else {
        // Rollback on failure
        await loadCart(false);
      }
    } catch (err) { 
      console.error(err);
      await loadCart(false);
    }
    finally { setActionLoading(null); }
  }

  async function removeCartItem(itemId: string) {
    setActionLoading(itemId);
    try {
      const res = await fetch(`${API_URL}/api/cart/remove`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (data.success) {
        await loadCart();
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    if (cart.length === 0) {
      setError('Add items to your bag before applying coupons');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setActionLoading('coupon');
    try {
      const res = await fetch(`${API_URL}/api/cart/coupon/apply`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      });
      const data = await res.json();
      if (data.success) { 
        setCouponCode(''); 
        await loadCart(true); 
      } else { 
        setError(data.error || 'Invalid coupon'); 
        setTimeout(() => setError(''), 3000); 
      }
    } catch (err) { 
      console.error(err); 
      setError('Connection failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  async function removeCoupon() {
    try {
      await fetch(`${API_URL}/api/cart/coupon/remove`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, credentials: 'include',
      });
      await loadCart();
    } catch (err) { console.error(err); }
  }

  async function applyLoyaltyPoints() {
    const pts = parseInt(pointsToUse);
    if (isNaN(pts) || pts <= 0) return;
    if (cart.length === 0) {
      setError('Add items to your bag before redeeming points');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setActionLoading('points');
    try {
      const res = await fetch(`${API_URL}/api/cart/loyalty/apply`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ points: pts }),
      });
      const data = await res.json();
      if (data.success) { 
        setPointsToUse(''); 
        await loadCart(true); 
        await fetchUserData(); 
      } else { 
        setError(data.error || 'Failed to apply points'); 
        setTimeout(() => setError(''), 3000); 
      }
    } catch (err) { 
      console.error(err); 
      setError('Connection failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  async function removeLoyaltyPoints() {
    try {
      await fetch(`${API_URL}/api/cart/loyalty/remove`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, credentials: 'include',
      });
      await loadCart(); await fetchUserData();
    } catch (err) { console.error(err); }
  }

  return (
    <StorefrontShell
      header={{ activePage: 'cart', sessionUser, settings }}
      breadcrumbs={[{ name: 'Shopping Bag', url: '/cart' }]}
      errors={error ? [error] : []}
    >
      <main className="cart-scroll-container min-h-[85vh] bg-white px-4 py-10 md:px-16 md:py-14" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#088178', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>Your Selection</p>
              <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -1 }}>
                Shopping Bag <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 20 }}>({cart.length})</span>
              </h1>
            </div>
            <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none', padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#088178'; (e.currentTarget as HTMLAnchorElement).style.color = '#088178'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.color = '#64748b'; }}
            >
              ← Continue Shopping
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Left — Items */}
            <div style={{ flex: 1, minWidth: 300 }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
                  <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#088178', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Loading...</p>
                </div>
              ) : cart.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cart.map((item, idx) => (
                    <div
                      key={item.id}
                      className="cart-item-anim"
                      style={{
                        animationDelay: `${idx * 0.08}s`,
                        background: '#fff',
                        border: '1px solid #f1f5f9',
                        borderRadius: 16,
                        padding: '20px 24px',
                        display: 'flex',
                        gap: 20,
                        alignItems: 'center',
                        transition: 'box-shadow 0.2s, border-color 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9'; }}
                    >
                      {/* Image */}
                      <Link href={`/product/${item.productId}`} style={{ width: 88, height: 88, borderRadius: 12, overflow: 'hidden', background: '#f8fafc', flexShrink: 0, border: '1px solid #f1f5f9', position: 'relative', display: 'block' }}>
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.08)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                          onError={e => { (e.currentTarget as HTMLImageElement).src = `${API_URL}/img/placeholder.jpg`; }}
                        />
                        <span className="promo-pill" style={{ position: 'absolute', top: 6, left: 6 }}>Active</span>
                      </Link>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <Link href={`/product/${item.productId}`} style={{ textDecoration: 'none' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>{item.name}</h3>
                          </Link>
                          <button
                            onClick={() => void removeCartItem(item.id)}
                            style={{ width: 32, height: 32, border: '1px solid #f1f5f9', borderRadius: 8, background: '#f8fafc', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#fecaca'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#f1f5f9'; }}
                          >
                            <i className="fa-solid fa-xmark" style={{ fontSize: 12 }} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                          {item.size && <span style={{ fontSize: 10, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Size: {item.size}</span>}
                          {item.color && <span style={{ fontSize: 10, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Color: {item.color}</span>}
                          <span style={{ fontSize: 10, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>Unit: {formatPrice(item.price)}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                          {/* Qty */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#f8fafc' }}>
                            <button
                              onClick={() => void updateCartItem(item.id, 'decrease')}
                              disabled={item.quantity <= 1 || actionLoading === item.id}
                              className="qty-control-btn"
                              style={{ width: 34, height: 34, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <i className="fa-solid fa-minus" />
                            </button>
                            <span className={actionLoading === item.id ? '' : 'qty-bounce'} style={{ width: 36, textAlign: 'center', fontWeight: 800, fontSize: 14, color: '#0f172a', opacity: actionLoading === item.id ? 0.4 : 1 }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => void updateCartItem(item.id, 'increase')}
                              disabled={actionLoading === item.id}
                              className="qty-control-btn"
                              style={{ width: 34, height: 34, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <i className="fa-solid fa-plus" />
                            </button>
                          </div>

                          <p style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', margin: 0 }}>{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', border: '1px dashed #e2e8f0', borderRadius: 20 }}>
                  <div className="float-anim" style={{ width: 72, height: 72, background: '#f0fdfb', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <i className="fa-solid fa-shopping-basket" style={{ fontSize: 28, color: '#088178' }} />
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Your bag is empty</h2>
                  <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 28px', maxWidth: 280, lineHeight: 1.6 }}>Haven&apos;t added anything yet. Let&apos;s fix that.</p>
                  <Link href="/shop" style={{ background: '#088178', color: '#fff', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: 0.5, transition: 'background 0.2s' }}>
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>

            {/* Right — Summary */}
            <div className="summary-anim" style={{ width: 360, flexShrink: 0, position: 'sticky', top: 120 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Voucher */}
                <div className="glass-summary" style={{ borderRadius: 16, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h4 className="summary-section-title" style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>Voucher Code</h4>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, letterSpacing: 2, textTransform: 'uppercase' }}>PROMO</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Enter code..."
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 12, fontWeight: 600, letterSpacing: 2, outline: 'none', background: '#f8fafc', color: '#0f172a', transition: 'border-color 0.2s' }}
                      onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#088178'; (e.currentTarget as HTMLInputElement).style.background = '#fff'; }}
                      onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLInputElement).style.background = '#f8fafc'; }}
                    />
                    <button
                      onClick={() => void applyCoupon()}
                      style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 800, fontSize: 11, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', transition: 'background 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#088178'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#0f172a'; }}
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, background: '#22c55e', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa-solid fa-check" style={{ color: '#fff', fontSize: 10 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', letterSpacing: 1 }}>{appliedCoupon} Applied</span>
                      </div>
                      <button onClick={() => void removeCoupon()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86efac', fontSize: 16, transition: 'color 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#86efac'; }}
                      >
                        <i className="fa-solid fa-circle-xmark" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Loyalty Points */}
                {loyaltyPoints > 0 && (
                  <div style={{ background: '#0f172a', borderRadius: 16, padding: 24, color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05, fontSize: 120 }}>
                      <i className="fa-solid fa-crown" />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 8, height: 8, background: '#f59e0b', borderRadius: '50%', boxShadow: '0 0 10px #f59e0b' }} />
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', letterSpacing: 2, textTransform: 'uppercase' }}>Elite Rewards</span>
                      </div>
                      <h4 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.5 }}>
                        Loyalty <span style={{ color: '#f59e0b' }}>Benefits</span>
                      </h4>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.6 }}>
                        You have <strong style={{ color: '#fff' }}>{loyaltyPoints} points</strong> available. 
                        Redeem them now for an instant discount.
                      </p>

                      {/* Progress bar to next "level" (fake aesthetic) */}
                      <div style={{ background: 'rgba(255,255,255,0.05)', height: 6, borderRadius: 3, marginBottom: 20, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (loyaltyPoints / 1000) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', boxShadow: '0 0 12px rgba(245,158,11,0.4)' }} />
                      </div>

                      {pointsUsed > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245,158,11,0.08)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(245,158,11,0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, background: 'rgba(245,158,11,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="fa-solid fa-coins" style={{ color: '#f59e0b', fontSize: 16 }} />
                            </div>
                            <div>
                              <p style={{ fontSize: 9, color: '#f59e0b', fontWeight: 800, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 1.5 }}>Redeemed</p>
                              <p style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#fff' }}>{pointsUsed} <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>pts</span></p>
                            </div>
                          </div>
                          <button
                            onClick={() => void removeLoyaltyPoints()}
                            style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', color: '#94a3b8', fontSize: 13, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                          >
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <input
                            type="number"
                            placeholder="Points"
                            value={pointsToUse}
                            onChange={e => setPointsToUse(e.target.value)}
                            style={{ width: '100px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#fff', outline: 'none', transition: 'all 0.2s' }}
                            onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#f59e0b'; (e.currentTarget as HTMLInputElement).style.background = 'rgba(255,255,255,0.1)'; }}
                            onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLInputElement).style.background = 'rgba(255,255,255,0.06)'; }}
                          />
                          <button
                            onClick={() => void applyLoyaltyPoints()}
                            disabled={actionLoading === 'points'}
                            style={{ flex: 1, background: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 11, cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase', transition: 'all 0.2s', opacity: actionLoading === 'points' ? 0.7 : 1 }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fbbf24'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f59e0b'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                          >
                            {actionLoading === 'points' ? 'Applying...' : 'Redeem Now'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* Order Summary */}
                <div className="glass-summary" style={{ borderRadius: 16, padding: 24 }}>
                  <h4 className="summary-section-title" style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    Order Summary
                    <span style={{ flex: 1, height: 1, background: '#f1f5f9', display: 'none' }} />
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Bag Total</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Coupon Savings</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    {pointsDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Loyalty Savings</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>-{formatPrice(pointsDiscount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Shipping</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: '#f0fdf4', padding: '3px 10px', borderRadius: 6 }}>Complimentary</span>
                    </div>

                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: 16, marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, margin: '0 0 4px', letterSpacing: 2, textTransform: 'uppercase' }}>Total Payable</p>
                          <p style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: -1 }}>{formatPrice(total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link href="/checkout" style={{ display: 'block', marginTop: 24 }}>
                    <button
                      type="button"
                      disabled={cart.length === 0}
                      className="checkout-btn"
                      style={{ width: '100%', background: '#088178', color: '#fff', border: 'none', borderRadius: 14, padding: '18px 24px', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 0.2s, transform 0.15s', letterSpacing: 0.5 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#06665f'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#088178'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                      onClick={() => window.location.href = '/checkout'}
                    >
                      <i className="fa-solid fa-lock" style={{ fontSize: 13, opacity: 0.7 }} />
                      Secure Checkout
                      <i className="fa-solid fa-arrow-right-long" style={{ fontSize: 13 }} />
                    </button>
                  </Link>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 18, opacity: 0.25 }}>
                    <i className="fa-brands fa-cc-visa" style={{ fontSize: 24 }} />
                    <i className="fa-brands fa-cc-mastercard" style={{ fontSize: 24 }} />
                    <i className="fa-brands fa-cc-apple-pay" style={{ fontSize: 24 }} />
                    <i className="fa-brands fa-google-pay" style={{ fontSize: 28 }} />
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile sticky bar */}
      <div style={{ display: 'none' }} className="mobile-checkout-bar">
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', margin: '0 0 2px', letterSpacing: 2, textTransform: 'uppercase' }}>Payable</p>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: -0.5 }}>{formatPrice(total)}</p>
        </div>
        <Link href="/checkout">
          <button
            type="button"
            disabled={cart.length === 0}
            style={{ background: '#088178', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 800, fontSize: 12, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}
            onClick={() => window.location.href = '/checkout'}
          >
            Checkout
          </button>
        </Link>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .summary-anim { width: 100% !important; position: static !important; }
        }
        @media (max-width: 768px) {
          .mobile-checkout-bar { display: flex !important; position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(255,255,255,0.92); backdrop-filter: blur(16px); border-top: 1px solid #f1f5f9; z-index: 1000; padding: 16px 24px; align-items: center; justify-content: space-between; box-sizing: border-box; }
        }
      `}</style>
      <div className="lg:hidden h-24" />
    </StorefrontShell>
  );
}