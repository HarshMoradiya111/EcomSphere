'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/config';

interface Props {
  initialOrder: any;
}

export default function TrackOrderClient({ initialOrder }: Props) {
  const [order, setOrder] = useState(initialOrder);

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentIndex = order ? statuses.indexOf(order.status) : -1;
  const progressPercentage = currentIndex === 0 ? 12 : (currentIndex === 1 ? 38 : (currentIndex === 2 ? 63 : 100));

  useEffect(() => {
    if (!order || order.status === 'Delivered' || order.status === 'Cancelled') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/orders/${order._id}?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.order) {
          if (data.order.status !== order.status) {
            setOrder(data.order);
          }
        }
      } catch (err) {
        console.error('Track polling error:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [order]);

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fcfcfc', borderRadius: '15px', border: '1px dashed #ddd' }}>
        <i className="fa-solid fa-truck-fast" style={{ fontSize: '60px', color: '#eee', marginBottom: '20px', display: 'block' }}></i>
        <h3 style={{ fontSize: '20px', color: '#444' }}>Order not found</h3>
        <p style={{ color: '#888', marginTop: '10px' }}>Please go to your profile and select an order to see its status.</p>
        <a href="/profile#orders" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px', padding: '15px 35px', background: '#088178', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>View My Orders</a>
      </div>
    );
  }

  return (
    <div className="track-result">
      <h3 style={{ textAlign: 'center', fontSize: '20px', color: '#088178', marginBottom: '10px' }}>
        Order #{order._id.toString().slice(-8).toUpperCase()}
      </h3>
      
      {order.status === 'Cancelled' ? (
        <div className="status-cancelled">
          <i className="fa-solid fa-ban" style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}></i>
          <p style={{ fontSize: '20px', fontWeight: 700 }}>This order has been cancelled.</p>
        </div>
      ) : (
        <div className="timeline">
          <div className="timeline-progress" style={{ width: `${progressPercentage}%` }}></div>
          <div className={`timeline-step ${currentIndex >= 0 ? 'completed' : ''}`}>
            <div className="icon"><i className="fa-solid fa-box"></i></div>
            <div>Pending</div>
          </div>
          <div className={`timeline-step ${currentIndex >= 1 ? 'completed' : ''}`}>
            <div className="icon"><i className="fa-solid fa-spinner"></i></div>
            <div>Processing</div>
          </div>
          <div className={`timeline-step ${currentIndex >= 2 ? 'completed' : ''}`}>
            <div className="icon"><i className="fa-solid fa-truck-fast"></i></div>
            <div>Shipped</div>
          </div>
          <div className={`timeline-step ${currentIndex >= 3 ? 'completed' : ''}`}>
            <div className="icon"><i className="fa-solid fa-house-circle-check"></i></div>
            <div>Delivered</div>
          </div>
        </div>
      )}

      <div className="track-details">
        <h4><i className="fa-solid fa-file-invoice" style={{ marginRight: '10px' }}></i> Shipment Information</h4>
        <p><strong>Order Date:</strong> <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
        <p><strong>Status:</strong> <span style={{ color: '#088178', fontWeight: 700 }}>{order.status}</span></p>
        <p><strong>Shipping To:</strong> <span>{order.checkoutInfo?.name}</span></p>
        <p><strong>Delivery Address:</strong> <span style={{ textAlign: 'right', maxWidth: '60%' }}>{order.checkoutInfo?.address}</span></p>
        <p style={{ borderTop: '1px solid #eef2f2', paddingTop: '15px', marginTop: '15px', fontSize: '18px', fontWeight: 700 }}>
          <strong>Total Paid:</strong> <span style={{ color: '#1a1a1a' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
        </p>
      </div>
    </div>
  );
}
