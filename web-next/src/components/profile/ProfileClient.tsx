'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getToken } from '@/utils/auth';
import { getImageUrl } from '@/utils/imagePaths';
import DownloadInvoiceButton from '@/components/order/DownloadInvoiceButton';

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  createdAt: string;
  loyaltyPoints?: number;
  loyaltyHistory?: any[];
  addresses: any[];
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items: any[];
  checkoutInfo: any;
}

interface Props {
  initialData: { user: User; orders: Order[] };
  sessionUser: string | null;
  settings: any;
}

export default function ProfileClient({ initialData, sessionUser, settings }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(initialData.user);
  const [orders, setOrders] = useState(initialData.orders);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Real-time Order Status Polling
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Poll every 5 seconds to keep profile and orders in sync
    interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/user/profile?t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${getToken()}` },
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success && data.orders) {
          // Only update if there's a change to prevent unnecessary re-renders
          if (JSON.stringify(data.orders) !== JSON.stringify(orders)) {
            setOrders(data.orders);
          }
          if (JSON.stringify(data.user) !== JSON.stringify(user)) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orders, user]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      phone: formData.get('phone'),
    };

    try {
      const res = await fetch('/api/v1/user/profile/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setUser({ ...user, ...result.user });
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      street: formData.get('street'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip: formData.get('zip'),
      country: formData.get('country'),
      isDefault: formData.get('isDefault') === 'on',
    };

    try {
      const res = await fetch('/api/v1/user/profile/address/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setUser({ ...user, addresses: result.addresses });
        (e.target as HTMLFormElement).reset();
        setMessage({ type: 'success', text: 'Address added!' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!confirm('Delete this address?')) return;
    try {
      const res = await fetch(`/api/v1/user/profile/address/${index}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const result = await res.json();
      if (result.success) {
        setUser({ ...user, addresses: result.addresses });
        setMessage({ type: 'success', text: 'Address deleted successfully' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete address' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Connection error' });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('profilePhoto', e.target.files[0]);

    try {
      const res = await fetch('/api/v1/user/profile/photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        setUser({ ...user, profilePhoto: result.profilePhoto });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <HeaderPartial activePage="profile" sessionUser={sessionUser} settings={settings} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .profile-container { max-width: 1200px; margin: 0 auto; padding: 60px 20px; font-family: 'Poppins', sans-serif; }
        .profile-tabs { display: flex; list-style: none; padding: 0; margin-bottom: 30px; border-bottom: 2px solid #eee; overflow-x: auto; scrollbar-width: none; }
        .profile-tab { padding: 15px 25px; cursor: pointer; font-weight: 700; color: #666; transition: 0.3s; white-space: nowrap; border-bottom: 3px solid transparent; margin-bottom: -2px; }
        .profile-tab.active { color: #088178; border-bottom-color: #088178; }
        .tab-content { display: none; animation: fadeIn 0.4s ease; }
        .tab-content.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .info-card { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .address-card { background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin-bottom: 15px; position: relative; }
        .address-card.default { border-color: #088178; background: #f0fff4; }
        .default-label { position: absolute; top: 10px; right: 15px; background: #088178; color: #fff; font-size: 10px; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; }
        
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #444; font-size: 14px; }
        .form-input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; transition: 0.3s; font-family: inherit; }
        .form-input:focus { border-color: #088178; outline: none; box-shadow: 0 0 0 3px rgba(8, 129, 120, 0.1); }
        
        .order-status { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-shipped { background: #dbeafe; color: #1e40af; }
        .status-delivered { background: #dcfce7; color: #166534; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }

        .btn-primary { background: #088178; color: #fff; padding: 12px 25px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn-primary:hover { background: #06655e; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .alert { padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
        .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        @keyframes pulse { 
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />

      <section id="page-header" className="about-header" style={{ 
        backgroundImage: "url('/img/banner/b16.jpg')",
        height: '35vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h2>Welcome, {user.username}!</h2>
        <p>Manage your account, addresses and orders</p>
      </section>

      <div className="profile-container">
        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <ul className="profile-tabs">
          <li className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</li>
          <li className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>Personal Info</li>
          <li className={`profile-tab ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>My Addresses</li>
          <li className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            Order History 
            <span style={{ marginLeft: '8px', fontSize: '8px', verticalAlign: 'middle', color: '#088178', background: '#e8f8f7', padding: '2px 6px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '4px', height: '4px', background: '#088178', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
              LIVE
            </span>
          </li>
          <li className={`profile-tab ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')}>
            <i className="fa-solid fa-crown" style={{ color: '#088178', marginRight: '5px' }}></i> My Rewards
          </li>
        </ul>

        {/* Overview */}
        <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="info-card" style={{ flex: '1', textAlign: 'center', minWidth: '280px' }}>
              <img src={user.profilePhoto || '/img/placeholder.jpg'} alt="Profile" style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', border: '5px solid #fff', boxShadow: '0 5px 20px rgba(0,0,0,0.1)', marginBottom: '20px' }} />
              <h3>{user.username}</h3>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>{user.email}</p>
              <label className="btn-primary" style={{ fontSize: '12px', cursor: 'pointer', display: 'inline-block' }}>
                <i className="fa-solid fa-camera"></i> Change Photo
                <input type="file" hidden onChange={handlePhotoUpload} accept="image/*" />
              </label>
            </div>

            <div className="info-card" style={{ flex: '2', minWidth: '300px' }}>
              <h4 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Account Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                <div>
                  <p style={{ margin: 0, color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Member Since</p>
                  <p style={{ margin: 0, fontWeight: 700 }} suppressHydrationWarning>{new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Total Orders</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{orders.length}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Phone</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{user.phone || 'Not provided'}</p>
                </div>
                <div style={{ background: '#f0f9f8', padding: '10px 15px', borderRadius: '8px', border: '1px solid #088178' }}>
                  <p style={{ margin: 0, color: '#088178', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Loyalty Points</p>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '22px', color: '#088178' }}>{user.loyaltyPoints || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className={`tab-content ${activeTab === 'personal' ? 'active' : ''}`}>
          <div className="info-card" style={{ maxWidth: '600px' }}>
            <h4 style={{ marginBottom: '25px' }}>Update Personal Details</h4>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name / Username</label>
                <input type="text" name="username" className="form-input" defaultValue={user.username} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" className="form-input" defaultValue={user.email} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" name="phone" className="form-input" defaultValue={user.phone} placeholder="e.g. +91 9876543210" />
              </div>
              <button type="submit" className="btn-primary" disabled={isUpdating} style={{ width: '100%' }}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Addresses */}
        <div className={`tab-content ${activeTab === 'addresses' ? 'active' : ''}`}>
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2', minWidth: '300px' }}>
              <h4 style={{ marginBottom: '20px' }}>My Saved Addresses</h4>
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr, idx) => (
                  <div key={idx} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                    {addr.isDefault && <span className="default-label">Default</span>}
                    <p style={{ margin: 0, fontWeight: 700 }}>{addr.street}</p>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>{addr.city}, {addr.state} {addr.zip}</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{addr.country}</p>
                    <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                      <button onClick={() => handleDeleteAddress(idx)} style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        <i className="fa-solid fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px', background: '#fff', border: '1px dashed #ddd', borderRadius: '10px', textAlign: 'center' }}>
                  <p color="#888">No saved addresses found.</p>
                </div>
              )}
            </div>

            <div className="info-card" style={{ flex: '1', minWidth: '320px' }}>
              <h4 style={{ marginBottom: '25px' }}>Add New Address</h4>
              <form onSubmit={handleAddAddress}>
                <div className="form-group">
                  <label>Street Address</label>
                  <input type="text" name="street" className="form-input" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" name="city" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input type="text" name="state" className="form-input" required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input type="text" name="zip" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input type="text" name="country" className="form-input" defaultValue="India" />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" name="isDefault" id="isDefault" />
                  <label htmlFor="isDefault" style={{ margin: 0, cursor: 'pointer' }}>Set as default</label>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Add Address</button>
              </form>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`}>
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className="info-card" style={{ padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '20px' }}>
                  <div>
                    <h5 style={{ margin: 0, color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Placed On</h5>
                    <p style={{ margin: 0, fontWeight: 700 }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <h5 style={{ margin: 0, color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Total</h5>
                    <p style={{ margin: 0, fontWeight: 700 }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <h5 style={{ margin: 0, color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Order ID</h5>
                    <p style={{ margin: 0, fontWeight: 700 }}>#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '2', minWidth: '250px' }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <Link href={`/product/${item.productId}`}>
                          <img 
                            src={getImageUrl(item.image)} 
                            width="60" 
                            height="60" 
                            style={{ objectFit: 'cover', borderRadius: '8px' }} 
                            alt={item.name}
                          />
                        </Link>
                        <div>
                          <Link href={`/product/${item.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{item.name}</p>
                          </Link>
                          <p style={{ margin: 0, color: '#777', fontSize: '12px' }}>Qty: {item.quantity} | ₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: '1', minWidth: '200px', padding: '15px', background: '#fbfbfb', borderRadius: '8px' }}>
                    <p style={{ fontSize: '13px', marginBottom: '5px' }}><strong>{order.checkoutInfo.name}</strong></p>
                    <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>{order.checkoutInfo.address}</p>
                    <Link href={`/track-order?orderId=${order._id}`} style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#088178', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', marginTop: '15px', fontWeight: 700 }}>Track Order</Link>
                    <div style={{ marginTop: '10px' }}>
                      <DownloadInvoiceButton 
                        orderId={order._id} 
                        style={{ 
                          padding: '10px', 
                          fontSize: '12px', 
                          borderRadius: '4px',
                          backgroundColor: '#333' 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <i className="fa-solid fa-shopping-bag" style={{ fontSize: '50px', color: '#eee', marginBottom: '20px', display: 'block' }}></i>
              <p>No orders yet.</p>
            </div>
          )}
        </div>

        {/* Rewards */}
        <div className={`tab-content ${activeTab === 'rewards' ? 'active' : ''}`}>
          {(() => {
            const points = user.loyaltyPoints || 0;
            let tier = 'Bronze';
            let nextTierPoints = 500;
            let tierColor = '#9a3412';
            let tierBg = '#fff7ed';

            if (points >= 3000) {
              tier = 'Platinum';
              nextTierPoints = 5000;
              tierColor = '#0369a1';
              tierBg = '#e0f2fe';
            } else if (points >= 1500) {
              tier = 'Gold';
              nextTierPoints = 3000;
              tierColor = '#92400e';
              tierBg = '#fef3c7';
            } else if (points >= 500) {
              tier = 'Silver';
              nextTierPoints = 1500;
              tierColor = '#475569';
              tierBg = '#f1f5f9';
            }

            const progress = Math.min(100, (points / nextTierPoints) * 100);
            const pointsNeeded = nextTierPoints - points;

            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                  {/* Balance Card */}
                  <div className="info-card" style={{ 
                    background: 'linear-gradient(135deg, #088178 0%, #044f4a 100%)', 
                    color: '#fff', 
                    padding: '40px', 
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <i className="fa-solid fa-gem" style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '150px', opacity: 0.1 }}></i>
                    <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', fontWeight: 600, opacity: 0.8 }}>Available Balance</p>
                    <h2 style={{ fontSize: '48px', fontWeight: 900, margin: '10px 0' }}>{points} <span style={{ fontSize: '18px', fontWeight: 500 }}>Points</span></h2>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 15px', borderRadius: '30px', display: 'inline-block', width: 'fit-content', fontSize: '12px', fontWeight: 700 }}>
                      <i className="fa-solid fa-bolt"></i> 100 Points = ₹10 Discount
                    </div>
                  </div>

                  {/* Tier Status Card */}
                  <div className="info-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Membership Tier</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Your loyalty status based on activity</p>
                      </div>
                      <div style={{ 
                        background: tierBg,
                        color: tierColor,
                        padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, border: '1px solid currentColor'
                      }}>
                        <i className="fa-solid fa-award"></i> {tier}
                      </div>
                    </div>

                    {/* Progress to next tier */}
                    {points < 5000 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>
                          <span>Next Tier Progress</span>
                          <span>{points} / {nextTierPoints}</span>
                        </div>
                        <div style={{ height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${progress}%`, 
                            background: '#088178',
                            transition: 'width 1s ease'
                          }}></div>
                        </div>
                        <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                          Earn {pointsNeeded} more points to reach the next tier!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                  {/* Perks Section */}
                  <div>
                    <h4 style={{ marginBottom: '20px', fontWeight: 800 }}>Tier Benefits</h4>
                    <div style={{ background: '#fff', borderRadius: '15px', border: '1px solid #eee', overflow: 'hidden' }}>
                      {[
                        { t: 'Bronze', p: 'Entry level, earn 1 point per ₹100 spent', min: 0 },
                        { t: 'Silver', p: 'Early access to sales, 2 points per ₹100', min: 500 },
                        { t: 'Gold', p: 'Free shipping on all orders, birthday gifts', min: 1500 },
                        { t: 'Platinum', p: 'VIP support, exclusive luxury drops, 5 points per ₹100', min: 3000 }
                      ].map((perk, i) => (
                        <div key={i} style={{ 
                          padding: '15px 20px', 
                          borderBottom: i < 3 ? '1px solid #f5f5f5' : 'none', 
                          opacity: points >= perk.min ? 1 : 0.4 
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#088178', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className={points >= perk.min ? "fa-solid fa-circle-check" : "fa-solid fa-lock"}></i> {perk.t}
                          </div>
                          <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>{perk.p}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* History Section */}
                  <div style={{ flex: 2 }}>
                    <h4 style={{ marginBottom: '20px', fontWeight: 800 }}>Transaction History</h4>
                    <div className="info-card" style={{ padding: 0, overflow: 'hidden' }}>
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {user.loyaltyHistory && user.loyaltyHistory.length > 0 ? (
                          user.loyaltyHistory.map((h, i) => (
                            <div key={i} style={{ 
                              padding: '15px 25px', 
                              borderBottom: i < user.loyaltyHistory!.length - 1 ? '1px solid #f5f5f5' : 'none',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'background 0.3s'
                            }} onMouseEnter={(e) => e.currentTarget.style.background = '#fcfcfc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ 
                                  width: '40px', height: '40px', borderRadius: '10px', 
                                  background: h.type === 'earn' ? '#ecfdf5' : '#fff1f2',
                                  color: h.type === 'earn' ? '#059669' : '#e11d48',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                                }}>
                                  <i className={h.type === 'earn' ? 'fa-solid fa-arrow-up-long' : 'fa-solid fa-arrow-down-long'}></i>
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{h.reason}</p>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>{new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: '16px', color: h.type === 'earn' ? '#059669' : '#e11d48' }}>
                                  {h.type === 'earn' ? '+' : '-'}{h.points}
                                </p>
                                <p style={{ margin: 0, fontSize: '10px', color: '#bbb', textTransform: 'uppercase', fontWeight: 600 }}>{h.type}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '40px', color: '#eee', marginBottom: '15px', display: 'block' }}></i>
                            <p style={{ color: '#999', fontSize: '14px' }}>No points activity recorded yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
