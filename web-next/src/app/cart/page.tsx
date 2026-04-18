'use client';

import { useEffect, useMemo, useState } from 'react';
import StorefrontShell from '@/components/ejs-partials/StorefrontShell';
import { API_URL } from '@/config';

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
  error?: string;
};

function formatPrice(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadCart() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cart`, { credentials: 'include' });
      if (response.redirected) {
        window.location.href = '/auth/login';
        return;
      }
      const data = (await response.json()) as CartResponse;
      if (data.success) {
        setCart(data.cart || []);
        setTotal(data.total || 0);
        setDiscountAmount(data.discountAmount || 0);
        setAppliedCoupon(data.appliedCoupon || null);
      } else {
        setError(data.error || 'Failed to fetch cart');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCart();
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  async function updateCartItem(itemId: string, action: 'increase' | 'decrease') {
    try {
      const response = await fetch(`${API_URL}/api/cart/update`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action }),
      });
      const data = await response.json();
      if (data.success) {
        await loadCart();
      } else {
        setError(data.error || 'Failed to update cart');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update cart');
    }
  }

  async function removeCartItem(itemId: string) {
    try {
      const response = await fetch(`${API_URL}/api/cart/remove`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await response.json();
      if (data.success) {
        await loadCart();
      } else {
        setError(data.error || 'Failed to remove item');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to remove item');
    }
  }

  async function applyCoupon() {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/coupon/apply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setError('');
        await loadCart();
      } else {
        setError(data.error || 'Failed to apply coupon');
      }
    } catch (err) {
      console.error(err);
      setError('Error applying coupon');
    }
  }

  async function removeCoupon() {
    try {
      const response = await fetch(`${API_URL}/api/cart/coupon/remove`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        await loadCart();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <StorefrontShell
      header={{ activePage: 'cart' }}
      breadcrumbs={[{ name: 'Shopping Cart', url: '/cart' }]}
      errors={error ? [error] : []}
    >
      <section id="page-header">
        <h2>Shopping Cart</h2>
        <p>Review your items before checkout</p>
      </section>

      <section id="cart" className="section-p1">
        <div className="table-responsive">
          <table width="100%">
            <thead>
              <tr>
                <td>Remove</td>
                <td>Image</td>
                <td>Product</td>
                <td>Price</td>
                <td>Quantity</td>
                <td>Subtotal</td>
              </tr>
            </thead>
            <tbody id="cart-items">
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading cart...</td>
                </tr>
              ) : cart.length > 0 ? (
                cart.map((item) => (
                  <tr key={item.id} data-item-id={item.id}>
                    <td>
                      <button className="remove-item" data-id={item.id} title="Remove" onClick={() => void removeCartItem(item.id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                    <td>
                      <img
                        src={`/uploads/${item.image}`}
                        width={70}
                        height={70}
                        style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/img/placeholder.jpg'; }}
                        alt={item.name}
                      />
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                      {item.size ? <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>Size: <strong>{item.size}</strong></p> : null}
                      {item.color ? <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>Color: <strong>{item.color}</strong></p> : null}
                    </td>
                    <td>{formatPrice(item.price)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button className="decrease-qty" data-id={item.id} title="Decrease" onClick={() => void updateCartItem(item.id, 'decrease')}>−</button>
                        <span className="item-quantity" style={{ minWidth: '30px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                        <button className="increase-qty" data-id={item.id} title="Increase" onClick={() => void updateCartItem(item.id, 'increase')}>+</button>
                      </div>
                    </td>
                    <td className="cart-item-subtotal" data-price={item.price} data-quantity={item.quantity}>
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                    <i className="fa-solid fa-cart-shopping" style={{ fontSize: '50px', color: '#ccc', display: 'block', marginBottom: '15px' }}></i>
                    <p style={{ fontSize: '18px' }}>Your cart is empty</p>
                    <a href="/shop" style={{ display: 'inline-block', marginTop: '15px', padding: '12px 28px', background: '#088178', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
                      Start Shopping
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="cart-add" className="section-p1">
        <div id="coupon" style={{ flex: 1 }}>
          <h3>Apply Coupon</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Enter Your Coupon"
              id="coupon-code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', flexGrow: 1, maxWidth: '300px' }}
            />
            <button className="normal" id="apply-coupon-btn" onClick={() => void applyCoupon()} style={{ background: '#088178', color: '#fff', padding: '10px 25px', cursor: 'pointer', border: 'none', borderRadius: '4px' }}>
              Apply
            </button>
          </div>
          {appliedCoupon ? (
            <div id="applied-coupon-info" style={{ marginTop: '15px' }}>
              <p style={{ color: '#088178', fontWeight: 600 }}><i className="fa-solid fa-tag"></i> Coupon <span id="active-coupon-code">{appliedCoupon}</span> Applied!</p>
              <button id="remove-coupon-btn" onClick={() => void removeCoupon()} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', marginTop: '5px', padding: 0 }}>
                Remove Coupon
              </button>
            </div>
          ) : null}
        </div>

        <div id="subtotal" style={{ flex: 1 }}>
          <h3>Cart Totals</h3>
          <table>
            <tbody>
              <tr>
                <td>Cart Subtotal</td>
                <td id="cart-subtotal">{formatPrice(subtotal)}</td>
              </tr>
              {discountAmount > 0 ? (
                <tr id="discount-row" style={{ color: '#088178' }}>
                  <td>Discount</td>
                  <td id="cart-discount">-{formatPrice(discountAmount)}</td>
                </tr>
              ) : null}
              <tr>
                <td>Shipping</td>
                <td><strong>Free</strong></td>
              </tr>
              <tr>
                <td><strong>Cart Total</strong></td>
                <td id="cart-total"><strong>{formatPrice(total)}</strong></td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '20px' }}>
            <a href="/checkout" style={{ textDecoration: 'none' }}>
              <button className="normal" id="checkout-btn" disabled={cart.length === 0} style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 700, background: '#088178', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Proceed to Checkout
              </button>
            </a>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
