'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import Link from 'next/link';
import { getToken } from '@/utils/auth';
import { API_URL } from '@/config';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  loyaltyPoints: number;
  addresses: any[];
}

interface Props {
  sessionUser: string | null;
  settings: any;
  user: User | null;
}

export default function CheckoutClient({ sessionUser, settings, user: initialUser }: Props) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState(initialUser);
  const [shippingState, setShippingState] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, shippingFee: 0, total: 0, pointsDiscount: 0 });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');

  // Token is now retrieved via cookie utility for consistency with middleware
  // const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${getToken()}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.cart && data.cart.length > 0) {
          setCart(data.cart);
        } else {
          // If no items in server cart, check localStorage as fallback for legacy sessions
          const savedCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
          if (savedCart.length > 0) {
            setCart(savedCart);
          } else {
            router.push('/cart');
          }
        }
      } catch (err) {
        console.error('Failed to fetch checkout cart:', err);
        router.push('/cart');
      }
    };
    
    fetchCart();
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      calculateTotals();
    }
  }, [cart, shippingState, pointsToRedeem]);

  const calculateTotals = async () => {
    try {
      const res = await fetch('/api/v1/checkout/prepare', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ items: cart, state: shippingState, pointsToRedeem }),
      });
      const data = await res.json();
      if (data.success) {
        setTotals({
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          shippingFee: data.shippingFee,
          total: data.total,
          pointsDiscount: data.pointsDiscount
        });
        setRazorpayKey(data.key_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async (razorpayDetails?: any) => {
    setIsProcessing(true);
    
    const shippingInfo = {
      name: (document.getElementById('delivery-name') as HTMLInputElement).value,
      address: (document.getElementById('delivery-address') as HTMLInputElement).value,
      state: shippingState,
      phone: (document.getElementById('delivery-phone') as HTMLInputElement).value,
    };

    try {
      const res = await fetch('/api/v1/checkout/place', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          items: cart,
          shippingInfo,
          paymentMethod,
          razorpayDetails,
          totals,
          pointsUsed: pointsToRedeem
        }),
      });
      const result = await res.json();
      if (result.success) {
        localStorage.removeItem('cartItems');
        router.push(`/order-success/${result.orderId}`);
      } else {
        alert(result.error || 'Failed to place order');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const initRazorpay = async () => {
    if (!shippingState) return alert('Please select a shipping region');
    
    const name = (document.getElementById('delivery-name') as HTMLInputElement).value;
    const addr = (document.getElementById('delivery-address') as HTMLInputElement).value;
    const phone = (document.getElementById('delivery-phone') as HTMLInputElement).value;
    if (!name || !addr || !phone) return alert('Please fill in all delivery details');

    if (paymentMethod === 'cod') {
      return handlePlaceOrder();
    }

    setIsProcessing(true);
    try {
      // Create Razorpay order via our prepare endpoint
      const res = await fetch('/api/v1/checkout/prepare', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ items: cart, state: shippingState, pointsToRedeem }),
      });
      const data = await res.json();
      
      if (!data.razorpayOrder) throw new Error('Failed to create payment order');

      const options = {
        key: data.key_id,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: "EcomSphere",
        description: "Storefront Checkout",
        order_id: data.razorpayOrder.id,
        handler: (response: any) => handlePlaceOrder(response),
        prefill: {
          name: name,
          email: user?.email,
          contact: phone
        },
        theme: { color: "#088178" },
        modal: { ondismiss: () => setIsProcessing(false) }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Payment initialization failed');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <HeaderPartial activePage="" sessionUser={sessionUser} settings={settings} />
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .checkout-container { max-width: 1000px; margin: 40px auto; padding: 20px; font-family: 'Poppins', sans-serif; display: flex; gap: 40px; }
        .checkout-main { flex: 1.5; }
        .checkout-sidebar { flex: 1; }
        
        .section-card { background: #fff; border: 1px solid #eee; border-radius: 15px; padding: 30px; margin-bottom: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.02); }
        .section-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #1a1a1a; }
        
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #555; }
        .form-input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 10px; font-size: 14px; transition: 0.3s; font-family: inherit; }
        .form-input:focus { border-color: #088178; outline: none; }
        
        .summary-item { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #555; }
        .summary-total { border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px; font-size: 20px; font-weight: 800; color: #088178; }
        
        .payment-option { display: flex; align-items: center; gap: 12px; padding: 15px; border: 1px solid #eee; border-radius: 10px; cursor: pointer; transition: 0.3s; margin-bottom: 10px; }
        .payment-option:hover { border-color: #088178; background: #f0f9f8; }
        .payment-option.active { border-color: #088178; background: #f0f9f8; }
        
        .pay-btn { background: #088178; color: #fff; border: none; padding: 18px; border-radius: 12px; width: 100%; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; margin-top: 20px; }
        .pay-btn:hover { background: #06655e; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(8, 129, 120, 0.2); }
        .pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .loyalty-info { background: #f0f9f8; padding: 15px; border-radius: 10px; border: 1px dashed #088178; margin-top: 15px; font-size: 13px; }

        @media (max-width: 991px) {
          .checkout-container { flex-direction: column; }
        }
      `}} />

      <section id="page-header" className="about-header" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/img/banner/b16.jpg')", height: '30vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 800 }}>#SecureCheckout</h2>
        <p>Your premium fashion is just one step away.</p>
      </section>

      <div className="checkout-container">
        <div className="checkout-main">
          <div className="section-card">
            <div className="section-title"><i className="fa-solid fa-truck"></i> Delivery Details</div>
            {user?.addresses && user.addresses.length > 0 && (
              <div className="form-group">
                <label>Saved Addresses</label>
                <select className="form-input" onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (isNaN(idx)) return;
                  const addr = user.addresses[idx];
                  (document.getElementById('delivery-name') as HTMLInputElement).value = user.username;
                  (document.getElementById('delivery-address') as HTMLInputElement).value = `${addr.street}, ${addr.city}`;
                  setShippingState(addr.state);
                }}>
                  <option value="">-- Select Saved Address --</option>
                  {user.addresses.map((addr, i) => (
                    <option key={i} value={i}>{addr.street}, {addr.city}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" id="delivery-name" className="form-input" defaultValue={user?.username} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" id="delivery-address" className="form-input" placeholder="House No, Street, Locality" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Shipping Region</label>
                <select className="form-input" value={shippingState} onChange={(e) => setShippingState(e.target.value)} required>
                  <option value="">-- Select State --</option>
                  <option value="MH">Maharashtra (Local)</option>
                  <option value="DL">Delhi</option>
                  <option value="KA">Karnataka</option>
                  <option value="GJ">Gujarat</option>
                  <option value="OTHER">Other State (National)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" id="delivery-phone" className="form-input" defaultValue={user?.phone} placeholder="9876543210" required />
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-title"><i className="fa-solid fa-credit-card"></i> Payment Method</div>
            <div className={`payment-option ${paymentMethod === 'razorpay' ? 'active' : ''}`} onClick={() => setPaymentMethod('razorpay')}>
              <input type="radio" checked={paymentMethod === 'razorpay'} readOnly />
              <div>
                <div style={{ fontWeight: 700 }}>Online Payment</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Cards, UPI, Netbanking (Secure via Razorpay)</div>
              </div>
            </div>
            <div className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
              <input type="radio" checked={paymentMethod === 'cod'} readOnly />
              <div>
                <div style={{ fontWeight: 700 }}>Cash on Delivery</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Pay in cash when you receive your order</div>
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-sidebar">
          <div className="section-card" style={{ position: 'sticky', top: '100px' }}>
            <div className="section-title"><i className="fa-solid fa-receipt"></i> Order Summary</div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
              {cart.map((item, i) => (
                <div key={i} className="summary-item">
                  <Link href={`/product/${item.productId}`} style={{ fontSize: '13px', textDecoration: 'none', color: 'inherit', borderBottom: '1px dashed #ddd' }}>
                    {item.name} x {item.quantity}
                  </Link>
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            
            <div className="summary-item">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {totals.pointsDiscount > 0 && (
              <div className="summary-item" style={{ color: '#088178' }}>
                <span>Loyalty Discount</span>
                <span>- ₹{totals.pointsDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="summary-item">
              <span>Tax (18% GST)</span>
              <span>₹{totals.taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-item">
              <span>Shipping Fee</span>
              <span>{totals.shippingFee > 0 ? `₹${totals.shippingFee}` : 'FREE'}</span>
            </div>
            <div className="summary-item summary-total">
              <span>Total</span>
              <span>₹{totals.total.toLocaleString('en-IN')}</span>
            </div>

            {user && user.loyaltyPoints > 0 && (
              <div className="loyalty-info">
                <div style={{ fontWeight: 700, color: '#088178', marginBottom: '5px' }}>Redeem Loyalty Points</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="number" className="form-input" style={{ padding: '8px' }} placeholder="Points" max={user.loyaltyPoints} onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPointsToRedeem(isNaN(val) ? 0 : Math.min(val, user.loyaltyPoints));
                  }} />
                  <div style={{ alignSelf: 'center', fontSize: '11px' }}>of {user.loyaltyPoints}</div>
                </div>
              </div>
            )}

            <button className="pay-btn" onClick={initRazorpay} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Place Order — ₹${totals.total.toLocaleString('en-IN')}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#999', marginTop: '15px' }}>
              <i className="fa-solid fa-shield-halved"></i> SSL Encrypted & Secure Checkout
            </p>
          </div>
        </div>
      </div>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
