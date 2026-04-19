'use client';

import React, { useState } from 'react';
import { API_URL } from '@/config';

import { getToken } from '@/utils/auth';

interface Props {
  orderId: string;
  className?: string;
  style?: React.CSSProperties;
}

const DownloadInvoiceButton: React.FC<Props> = ({ orderId, className, style }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      const token = getToken();
      
      if (!token) {
        alert('Please login to download your invoice.');
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/orders/invoice/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderId.slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Invoice download error:', error);
      alert('Could not download invoice. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
      style={{
        backgroundColor: '#000',
        color: '#fff',
        border: 'none',
        padding: '12px 25px',
        borderRadius: '50px',
        fontWeight: '600',
        cursor: isDownloading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: '0.3s',
        opacity: isDownloading ? 0.7 : 1,
        width: '100%',
        justifyContent: 'center',
        fontSize: '14px',
        ...style
      }}
    >
      <i className={isDownloading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-file-pdf"}></i>
      {isDownloading ? 'Downloading...' : 'Download Invoice'}
    </button>
  );
};

export default DownloadInvoiceButton;
