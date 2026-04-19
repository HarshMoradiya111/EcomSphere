'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { getProductImageSrc, getProductImageFallbackSrc } from '@/utils/imagePaths';
import { API_URL } from '@/config';
import { getToken } from '@/utils/auth';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  additionalImages?: string[];
  category: string;
  countInStock?: number;
  status?: string;
  sizes?: string[];
  colors?: string[];
  averageRating?: number;
  numReviews?: number;
  reviews?: any[];
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [localReviews, setLocalReviews] = useState(product.reviews || []);
  const [localAvgRating, setLocalAvgRating] = useState(product.averageRating || 0);
  const [localNumReviews, setLocalNumReviews] = useState(product.numReviews || 0);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/v1/user/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.wishlist) {
          setIsWishlisted(data.wishlist.some((w: any) => w._id === product._id || w === product._id));
        }
      } catch (e) {}
    };
    checkWishlist();
  }, [product._id]);

  const [viewers, setViewers] = useState(0);
  useEffect(() => {
    setViewers(Math.floor(Math.random() * 40) + 10);
    const interval = setInterval(() => {
      setViewers(prev => Math.max(5, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const allImages = [product.image, ...(product.additionalImages || [])];
  const isLowStock = product.countInStock && product.countInStock > 0 && product.countInStock <= 5;
  const isOutOfStock = product.countInStock === 0;

  const handleAddToCart = async () => {
    const token = getToken();
    if (!token) {
      window.location.href = `/auth/login?redirect=/product/${product._id}`;
      return;
    }

    setIsAdding(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          size: selectedSize,
          color: selectedColor
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Added to bag successfully!' });
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add to bag' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async () => {
    const token = getToken();
    if (!token) {
      window.location.href = `/auth/login?redirect=/product/${product._id}`;
      return;
    }
    setIsWishlistLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/user/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id })
      });
      const data = await res.json();
      if (data.success) {
        setIsWishlisted(data.action === 'added');
        setMessage({ type: 'success', text: `Product ${data.action} wishlist!` });
        window.dispatchEvent(new Event('wishlist-updated'));
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update wishlist' });
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    window.location.href = '/checkout';
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      window.location.href = `/auth/login?redirect=/product/${product._id}`;
      return;
    }

    if (!reviewComment.trim()) {
      setMessage({ type: 'error', text: 'Please enter a review comment.' });
      return;
    }

    setIsSubmittingReview(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/products/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Review added successfully!' });
        setLocalReviews([data.review, ...localReviews]);
        setLocalAvgRating(data.averageRating);
        setLocalNumReviews(data.numReviews);
        setIsReviewFormOpen(false);
        setReviewComment('');
        setReviewRating(5);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit review' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatPrice = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const STYLES = `
    .pdp-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: 'Poppins', sans-serif;
      color: #1e293b;
    }

    /* Grid Layout */
    .pdp-main-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
    }
    @media (min-width: 768px) {
      .pdp-main-grid {
        grid-template-columns: 1fr 1fr;
        gap: 60px;
      }
    }
    @media (min-width: 1024px) {
      .pdp-main-grid {
        gap: 80px;
      }
    }

    /* Left Gallery */
    .pdp-gallery-main {
      position: relative;
      aspect-ratio: 4/5;
      background: #f8fafc;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid #f1f5f9;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pdp-gallery-main img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.7s ease;
    }
    .pdp-gallery-main:hover img {
      transform: scale(1.08);
    }
    .pdp-badge-soldout {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pdp-badge-soldout span {
      background: #fff;
      color: #000;
      padding: 12px 32px;
      border-radius: 30px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 14px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    .pdp-badge-lowstock {
      position: absolute;
      top: 24px;
      left: 24px;
      background: #ef4444;
      color: #fff;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      box-shadow: 0 4px 12px rgba(239,68,68,0.3);
      animation: pulse 2s infinite;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    .pdp-wishlist-btn {
      position: absolute;
      top: 24px;
      right: 24px;
      width: 48px;
      height: 48px;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(4px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 20px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .pdp-wishlist-btn:hover {
      color: #ef4444;
      transform: scale(1.1);
    }

    .pdp-gallery-thumbs {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 8px;
      scrollbar-width: none;
    }
    .pdp-gallery-thumbs::-webkit-scrollbar { display: none; }
    .pdp-thumb-btn {
      flex-shrink: 0;
      width: 80px;
      height: 96px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.3s ease;
      background: #f8fafc;
      padding: 0;
    }
    .pdp-thumb-btn:hover {
      opacity: 1;
    }
    .pdp-thumb-btn.active {
      border-color: #088178;
      opacity: 1;
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(8,129,120,0.2);
    }
    .pdp-thumb-btn img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Right Info */
    .pdp-info-header {
      margin-bottom: 32px;
    }
    .pdp-meta-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .pdp-category-tag {
      background: #e8f8f7;
      color: #088178;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .pdp-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #fb923c;
      font-size: 14px;
    }
    .pdp-rating span.score {
      color: #0f172a;
      font-weight: 700;
      margin-left: 4px;
    }
    .pdp-rating span.count {
      color: #94a3b8;
      font-weight: 500;
    }

    .pdp-title {
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.2;
      margin: 0 0 16px 0;
    }
    @media (min-width: 1024px) {
      .pdp-title { font-size: 44px; }
    }

    .pdp-price-row {
      display: flex;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 24px;
    }
    .pdp-price-current {
      font-size: 36px;
      font-weight: 900;
      color: #088178;
    }
    .pdp-price-original {
      font-size: 18px;
      color: #94a3b8;
      text-decoration: line-through;
    }
    .pdp-price-discount {
      color: #f97316;
      font-weight: 700;
      background: #fff7ed;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 14px;
    }

    .pdp-viewers {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 0;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
    }
    .pdp-avatars {
      display: flex;
      margin-right: -8px;
    }
    .pdp-avatars img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #fff;
      background: #e2e8f0;
      margin-left: -8px;
    }
    .pdp-viewers-text {
      font-size: 14px;
      font-weight: 700;
      color: #64748b;
      margin: 0;
    }
    .pdp-viewers-text span {
      color: #088178;
    }

    /* Options Section */
    .pdp-options {
      margin-bottom: 40px;
    }
    .pdp-option-group {
      margin-bottom: 24px;
    }
    .pdp-option-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .pdp-option-label {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #94a3b8;
      margin: 0;
    }
    .pdp-size-guide {
      font-size: 11px;
      font-weight: 700;
      color: #088178;
      background: none;
      border: none;
      cursor: pointer;
    }
    .pdp-size-guide:hover { text-decoration: underline; }

    .pdp-size-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .pdp-size-btn {
      height: 48px;
      min-width: 56px;
      padding: 0 16px;
      border-radius: 12px;
      border: 2px solid #f1f5f9;
      background: #fff;
      font-weight: 700;
      font-size: 14px;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pdp-size-btn:hover { border-color: #cbd5e1; }
    .pdp-size-btn.active {
      border-color: #088178;
      background: #e8f8f7;
      color: #088178;
      box-shadow: 0 2px 8px rgba(8,129,120,0.1);
    }

    .pdp-color-list {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    .pdp-color-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid transparent;
      padding: 2px;
      background: #fff;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pdp-color-btn.active {
      border-color: #088178;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .pdp-color-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }

    .pdp-qty-control {
      display: inline-flex;
      align-items: center;
      background: #f8fafc;
      border-radius: 16px;
      padding: 4px;
      border: 1px solid #f1f5f9;
    }
    .pdp-qty-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      background: transparent;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .pdp-qty-btn:hover { background: #fff; color: #0f172a; }
    .pdp-qty-value {
      width: 48px;
      text-align: center;
      font-weight: 900;
      color: #0f172a;
    }

    /* Action Area */
    .pdp-alert {
      padding: 16px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: fadeIn 0.3s ease;
    }
    .pdp-alert.success { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
    .pdp-alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }

    .pdp-action-btns {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    @media (min-width: 640px) {
      .pdp-action-btns { flex-direction: row; }
    }
    .pdp-btn {
      flex: 1;
      height: 64px;
      border-radius: 16px;
      font-weight: 900;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .pdp-btn:active { transform: scale(0.98); }
    
    .pdp-btn-add {
      background: #0f172a;
      color: #fff;
      box-shadow: 0 10px 20px rgba(15,23,42,0.15);
    }
    .pdp-btn-add:hover { background: #088178; box-shadow: 0 10px 20px rgba(8,129,120,0.2); }
    .pdp-btn-add:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; box-shadow: none; }
    
    .pdp-btn-buy {
      background: #088178;
      color: #fff;
      box-shadow: 0 10px 20px rgba(8,129,120,0.2);
    }
    .pdp-btn-buy:hover { background: #06655e; }

    /* Features Row */
    .pdp-features-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 32px;
    }
    .pdp-feature-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 16px;
    }
    .pdp-feature-icon {
      width: 40px;
      height: 40px;
      background: #fff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #088178;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .pdp-feature-text h6 {
      margin: 0 0 4px 0;
      font-size: 10px;
      font-weight: 900;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .pdp-feature-text p {
      margin: 0;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }

    /* TABS */
    .pdp-tabs-container {
      margin-top: 80px;
      border-top: 1px solid #f1f5f9;
      padding-top: 60px;
    }
    .pdp-tabs-nav {
      display: flex;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 40px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .pdp-tabs-nav::-webkit-scrollbar { display: none; }
    .pdp-tab-btn {
      position: relative;
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 700;
      color: #64748b;
      background: none;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.3s;
    }
    .pdp-tab-btn.active { color: #088178; }
    .pdp-tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: #088178;
      border-radius: 3px 3px 0 0;
    }

    .pdp-tab-content {
      min-height: 200px;
      animation: fadeIn 0.4s ease forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .pdp-desc-layout {
      max-width: 800px;
    }
    .pdp-desc-layout h3 { font-size: 24px; font-weight: 900; margin: 0 0 24px 0; }
    .pdp-desc-layout p.lead { font-size: 18px; color: #475569; line-height: 1.6; margin: 0 0 32px 0; }
    
    .pdp-desc-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
    }
    @media (min-width: 768px) {
      .pdp-desc-grid { grid-template-columns: 1fr 1fr; }
    }
    .pdp-desc-grid h4 { font-size: 16px; font-weight: 900; margin: 0 0 16px 0; }
    .pdp-desc-list { list-style: none; padding: 0; margin: 0; }
    .pdp-desc-list li { display: flex; align-items: center; gap: 12px; color: #475569; margin-bottom: 12px; }

    /* Reviews */
    .pdp-reviews-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
    }
    @media (min-width: 1024px) {
      .pdp-reviews-layout { grid-template-columns: 320px 1fr; gap: 60px; }
    }
    .pdp-reviews-summary {
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
      border: 1px solid #f1f5f9;
      border-radius: 24px;
      padding: 32px;
      height: fit-content;
      position: sticky;
      top: 100px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.02);
    }
    .pdp-reviews-summary h4 { margin: 0 0 16px 0; font-size: 22px; font-weight: 900; color: #0f172a; }
    .pdp-review-score { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
    .pdp-review-score .score { font-size: 56px; font-weight: 900; color: #0f172a; line-height: 1; }
    .pdp-review-score .stars { color: #fb923c; margin-bottom: 6px; font-size: 18px; display: flex; gap: 4px; }
    .pdp-review-score .sub { font-size: 14px; font-weight: 700; color: #64748b; margin: 0; }
    
    .pdp-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .pdp-bar-label { width: 16px; font-size: 12px; font-weight: 800; color: #475569; }
    .pdp-bar-track { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .pdp-bar-fill { height: 100%; background: #fb923c; border-radius: 4px; }
    .pdp-bar-pct { width: 32px; font-size: 12px; font-weight: 800; color: #94a3b8; }
    
    .pdp-write-review-btn {
      width: 100%;
      margin-top: 32px;
      padding: 16px;
      border: none;
      color: #fff;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-radius: 16px;
      font-weight: 800;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 15px rgba(15,23,42,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .pdp-write-review-btn:hover { 
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(15,23,42,0.25);
    }
    .pdp-write-review-btn i {
      color: #fb923c;
    }

    .pdp-review-form {
      margin-top: 24px;
      padding: 32px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.06);
      animation: formSlideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }
    @keyframes formSlideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .pdp-review-form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px dashed #e2e8f0;
    }
    .pdp-review-form-header h5 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
    .pdp-close-form {
      background: #f1f5f9;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pdp-close-form:hover { background: #e2e8f0; color: #ef4444; transform: rotate(90deg); }

    .pdp-rating-group {
      margin-bottom: 24px;
    }
    .pdp-rating-group label {
      display: block;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 12px;
    }
    .pdp-rating-select { display: flex; gap: 12px; }
    .pdp-rating-select button { 
      background: #f8fafc; 
      border: 1px solid #e2e8f0; 
      width: 48px;
      height: 48px;
      border-radius: 50%;
      font-size: 20px; 
      color: #cbd5e1; 
      cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pdp-rating-select button.active, .pdp-rating-select button:hover { 
      color: #fb923c; 
      border-color: #fb923c;
      background: #fff7ed;
      transform: scale(1.15);
      box-shadow: 0 4px 12px rgba(251, 146, 60, 0.2);
    }
    
    .pdp-review-textarea { 
      width: 100%; 
      box-sizing: border-box; 
      min-height: 140px; 
      padding: 20px; 
      border: 2px solid #e2e8f0; 
      border-radius: 16px; 
      font-family: 'Poppins', sans-serif; 
      font-size: 15px; 
      margin-bottom: 24px; 
      resize: vertical; 
      transition: all 0.3s;
      background: #f8fafc;
      line-height: 1.6;
    }
    .pdp-review-textarea:focus { 
      outline: none; 
      border-color: #088178; 
      background: #ffffff;
      box-shadow: 0 4px 15px rgba(8, 129, 120, 0.1);
    }
    .pdp-review-textarea::placeholder {
      color: #94a3b8;
    }
    
    .pdp-review-form-actions {
      display: flex;
      gap: 16px;
    }
    
    .pdp-submit-review { 
      flex: 1;
      padding: 16px; 
      background: linear-gradient(135deg, #088178 0%, #06a899 100%); 
      color: #fff; 
      border: none; 
      border-radius: 12px; 
      font-weight: 800; 
      font-size: 16px;
      cursor: pointer; 
      transition: all 0.3s ease;
      box-shadow: 0 6px 15px rgba(8, 129, 120, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .pdp-submit-review:hover:not(:disabled) { 
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(8, 129, 120, 0.3);
    }
    .pdp-submit-review:disabled { background: #cbd5e1; cursor: not-allowed; box-shadow: none; }

    .pdp-review-item { 
      padding: 24px; 
      margin-bottom: 24px; 
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    .pdp-review-item:hover {
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
      border-color: #e2e8f0;
    }
    .pdp-review-item-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      margin-bottom: 16px; 
    }
    .pdp-review-user { display: flex; align-items: center; gap: 16px; }
    .pdp-review-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #088178 0%, #06a899 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      text-transform: uppercase;
      box-shadow: 0 4px 10px rgba(8, 129, 120, 0.2);
    }
    .pdp-review-name {
      margin: 0 0 4px 0;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pdp-verified-badge {
      color: #10b981;
      font-size: 12px;
    }
    .pdp-review-stars {
      display: flex;
      gap: 2px;
      color: #fb923c;
      font-size: 12px;
    }
    .pdp-review-date {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }
    .pdp-review-text {
      font-size: 15px;
      color: #475569;
      line-height: 1.6;
      margin: 0;
    }


    /* Shipping Tab */
    .pdp-shipping-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
    }
    @media (min-width: 768px) {
      .pdp-shipping-grid { grid-template-columns: 1fr 1fr; gap: 48px; }
    }
    .pdp-shipping-card { background: #f8fafc; border-radius: 24px; padding: 32px; }
    .pdp-shipping-card h4 { font-size: 20px; font-weight: 900; margin: 0 0 24px 0; display: flex; align-items: center; gap: 12px; }
    .pdp-shipping-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 24px; }
    .pdp-shipping-item { display: flex; gap: 16px; }
    .pdp-shipping-icon { width: 32px; height: 32px; border-radius: 50%; background: #fff; color: #088178; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .pdp-shipping-item h5 { margin: 0 0 4px 0; font-size: 14px; font-weight: 900; color: #0f172a; }
    .pdp-shipping-item p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; }

    /* Related Products */
    .pdp-related-sec { margin-top: 100px; }
    .pdp-related-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
    .pdp-related-subtitle { color: #088178; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 8px 0; }
    .pdp-related-title { font-size: 32px; font-weight: 900; margin: 0; }
    .pdp-related-link { color: #94a3b8; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: color 0.3s; }
    .pdp-related-link:hover { color: #088178; }

    .pdp-related-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (min-width: 1024px) {
      .pdp-related-grid { grid-template-columns: repeat(4, 1fr); gap: 32px; }
    }
    .pdp-related-card {
      display: block;
      text-decoration: none;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      background: #fff;
    }
    .pdp-related-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border-color: #088178;
    }
    .pdp-related-img {
      aspect-ratio: 4/5;
      background: #f8fafc;
      overflow: hidden;
    }
    .pdp-related-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    .pdp-related-card:hover .pdp-related-img img { transform: scale(1.05); }
    .pdp-related-info { padding: 16px; }
    @media (min-width: 768px) { .pdp-related-info { padding: 24px; } }
    .pdp-related-cat { font-size: 9px; font-weight: 900; color: #088178; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0; }
    .pdp-related-name { font-size: 14px; font-weight: 900; color: #0f172a; margin: 0 0 12px 0; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .pdp-related-price-row { display: flex; justify-content: space-between; align-items: center; }
    .pdp-related-price { font-weight: 900; color: #0f172a; }
    .pdp-related-add { width: 32px; height: 32px; border-radius: 50%; background: #e8f8f7; color: #088178; display: flex; align-items: center; justify-content: center; font-size: 12px; }

    /* Mobile Sticky Bar */
    .pdp-mobile-sticky {
      display: none;
    }
    @media (max-width: 767px) {
      .pdp-mobile-sticky {
        display: block;
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 16px;
        background: rgba(255,255,255,0.9);
        backdrop-filter: blur(12px);
        border-top: 1px solid #f1f5f9;
        z-index: 1000;
        box-shadow: 0 -10px 25px rgba(0,0,0,0.05);
        box-sizing: border-box;
      }
      .pdp-mobile-actions {
        display: flex;
        gap: 12px;
      }
      .pdp-mobile-wishlist {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        border: 2px solid #f1f5f9;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        font-size: 20px;
        flex-shrink: 0;
      }
      .pdp-mobile-add {
        flex: 1;
        height: 56px;
        border-radius: 16px;
        border: none;
        background: #0f172a;
        color: #fff;
        font-weight: 900;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(15,23,42,0.2);
      }
      .pdp-mobile-add:disabled {
        background: #f1f5f9;
        color: #94a3b8;
        box-shadow: none;
      }
    }
  `;

  return (
    <main className="pdp-container">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="pdp-main-grid">
        {/* LEFT: GALLERY */}
        <div>
          <div className="pdp-gallery-main">
            <SafeImage 
              src={getProductImageSrc(activeImage)} 
              fallbackSrc={getProductImageFallbackSrc(activeImage)}
              alt={product.name}
            />
            {isOutOfStock && (
              <div className="pdp-badge-soldout">
                <span>Sold Out</span>
              </div>
            )}
            {isLowStock && (
              <div className="pdp-badge-lowstock">
                <i className="fa-solid fa-fire-flame-curved"></i> Only {product.countInStock} Left!
              </div>
            )}
            <button 
              className="pdp-wishlist-btn" 
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
            >
              {isWishlistLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : isWishlisted ? (
                <i className="fa-solid fa-heart" style={{ color: '#ef4444' }}></i>
              ) : (
                <i className="fa-regular fa-heart"></i>
              )}
            </button>
          </div>

          <div className="pdp-gallery-thumbs">
            {allImages.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`pdp-thumb-btn ${activeImage === img ? 'active' : ''}`}
              >
                <SafeImage 
                  src={getProductImageSrc(img)} 
                  fallbackSrc={getProductImageFallbackSrc(img)}
                  alt="Thumb" 
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div>
          <div className="pdp-info-header">
            <div className="pdp-meta-row">
              <span className="pdp-category-tag">{product.category}</span>
              <div className="pdp-rating">
                <i className="fa-solid fa-star"></i>
                <span className="score">{product.averageRating || '4.5'}</span>
                <span className="count">({product.numReviews || '128'} reviews)</span>
              </div>
            </div>

            <h1 className="pdp-title">{product.name}</h1>
            
            <div className="pdp-price-row">
              <span className="pdp-price-current">{formatPrice(product.price)}</span>
              <span className="pdp-price-original">{formatPrice(product.price * 1.4)}</span>
              <span className="pdp-price-discount">Save 40%</span>
            </div>

            <div className="pdp-viewers">
               <div className="pdp-avatars">
                 {[1,2,3].map(i => (
                   <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                 ))}
               </div>
               <p className="pdp-viewers-text">
                 <span>{viewers} people</span> are viewing this item right now
               </p>
            </div>
          </div>

          <div className="pdp-options">
            {/* SIZES */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pdp-option-group">
                <div className="pdp-option-header">
                  <h6 className="pdp-option-label">Select Size</h6>
                  <button className="pdp-size-guide">Size Guide</button>
                </div>
                <div className="pdp-size-list">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`pdp-size-btn ${selectedSize === size ? 'active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLORS */}
            {product.colors && product.colors.length > 0 && (
              <div className="pdp-option-group">
                <h6 className="pdp-option-label" style={{ marginBottom: '16px' }}>Available Colors</h6>
                <div className="pdp-color-list">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`pdp-color-btn ${selectedColor === color ? 'active' : ''}`}
                      title={color}
                    >
                      <div className="pdp-color-inner" style={{ backgroundColor: color.toLowerCase() }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            {!isOutOfStock && (
              <div className="pdp-option-group">
                <h6 className="pdp-option-label" style={{ marginBottom: '16px' }}>Quantity</h6>
                <div className="pdp-qty-control">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="pdp-qty-btn"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <span className="pdp-qty-value">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="pdp-qty-btn"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div>
            {message && (
              <div className={`pdp-alert ${message.type}`}>
                <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
                {message.text}
              </div>
            )}

            <div className="pdp-action-btns">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className="pdp-btn pdp-btn-add"
              >
                {isAdding ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-bag-shopping"></i>
                )}
                {isOutOfStock ? 'Currently Unavailable' : 'Add to Bag'}
              </button>
              
              {!isOutOfStock && (
                <button 
                  onClick={handleBuyNow}
                  className="pdp-btn pdp-btn-buy"
                >
                  <i className="fa-solid fa-bolt"></i>
                  Buy Now
                </button>
              )}
            </div>

            <div className="pdp-features-row">
               <div className="pdp-feature-box">
                 <div className="pdp-feature-icon">
                   <i className="fa-solid fa-truck-fast"></i>
                 </div>
                 <div className="pdp-feature-text">
                   <h6>Delivery</h6>
                   <p>2-4 Business Days</p>
                 </div>
               </div>
               <div className="pdp-feature-box">
                 <div className="pdp-feature-icon">
                   <i className="fa-solid fa-rotate-left"></i>
                 </div>
                 <div className="pdp-feature-text">
                   <h6>Returns</h6>
                   <p>7-Day Free Returns</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="pdp-tabs-container">
        <div className="pdp-tabs-nav">
          <button onClick={() => setActiveTab('description')} className={`pdp-tab-btn ${activeTab === 'description' ? 'active' : ''}`}>Description</button>
          <button onClick={() => setActiveTab('reviews')} className={`pdp-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}>Reviews ({localNumReviews})</button>
          <button onClick={() => setActiveTab('shipping')} className={`pdp-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}>Shipping & Returns</button>
        </div>

        <div className="pdp-tab-content">
          {activeTab === 'description' && (
            <div className="pdp-desc-layout">
              <h3>Experience Premium Quality</h3>
              <p className="lead">
                {product.description || 'This premium item is crafted with meticulous attention to detail, ensuring both style and durability for your everyday needs.'}
              </p>
              <div className="pdp-desc-grid">
                <div>
                  <h4>Features</h4>
                  <ul className="pdp-desc-list">
                    <li><i className="fa-solid fa-circle-check" style={{ color: '#22c55e', fontSize: '12px' }}></i> Ethically sourced materials</li>
                    <li><i className="fa-solid fa-circle-check" style={{ color: '#22c55e', fontSize: '12px' }}></i> Breathable and lightweight</li>
                    <li><i className="fa-solid fa-circle-check" style={{ color: '#22c55e', fontSize: '12px' }}></i> Precision craftsmanship</li>
                    <li><i className="fa-solid fa-circle-check" style={{ color: '#22c55e', fontSize: '12px' }}></i> Designed for daily use</li>
                  </ul>
                </div>
                <div>
                  <h4>Care Instructions</h4>
                  <ul className="pdp-desc-list">
                    <li><i className="fa-solid fa-hand-holding-droplet" style={{ color: '#088178', fontSize: '12px' }}></i> Gentle machine wash</li>
                    <li><i className="fa-solid fa-temperature-low" style={{ color: '#088178', fontSize: '12px' }}></i> Avoid bleach</li>
                    <li><i className="fa-solid fa-sun" style={{ color: '#088178', fontSize: '12px' }}></i> Dry in shade</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="pdp-reviews-layout">
              <div className="pdp-reviews-summary">
                <h4>Customer Reviews</h4>
                <div className="pdp-review-score">
                   <span className="score">{localAvgRating || '4.5'}</span>
                   <div>
                     <div className="stars">
                       {[1,2,3,4,5].map(i => <i key={i} className="fa-solid fa-star"></i>)}
                     </div>
                     <p className="sub">Based on {localNumReviews} reviews</p>
                   </div>
                </div>
                <div>
                   {[5,4,3,2,1].map(star => (
                     <div key={star} className="pdp-bar-row">
                       <span className="pdp-bar-label">{star}</span>
                       <div className="pdp-bar-track">
                         <div className="pdp-bar-fill" style={{ width: `${star === 5 ? 85 : star === 4 ? 10 : 5}%` }}></div>
                       </div>
                       <span className="pdp-bar-pct">{star === 5 ? 85 : star === 4 ? 10 : 5}%</span>
                     </div>
                   ))}
                </div>
              </div>
              
              <div className="pdp-reviews-list-container">
                <div className="pdp-review-form-wrapper" style={{ marginBottom: '40px' }}>
                  {!isReviewFormOpen ? (
                    <button onClick={() => setIsReviewFormOpen(true)} className="pdp-write-review-btn" style={{ maxWidth: '320px' }}>
                      <i className="fa-solid fa-pen-to-square"></i>
                      Write a Review
                    </button>
                  ) : (
                    <form className="pdp-review-form" onSubmit={handleSubmitReview}>
                      <div className="pdp-review-form-header">
                        <h5>Share Your Experience</h5>
                        <button type="button" onClick={() => setIsReviewFormOpen(false)} className="pdp-close-form" title="Close">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>

                      <div className="pdp-rating-group">
                        <label>Overall Rating</label>
                        <div className="pdp-rating-select">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={reviewRating >= star ? 'active' : ''}
                              onClick={() => setReviewRating(star)}
                              title={`${star} Star${star > 1 ? 's' : ''}`}
                            >
                              <i className={reviewRating >= star ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pdp-rating-group">
                        <label>Detailed Review</label>
                        <textarea 
                          className="pdp-review-textarea"
                          placeholder="What did you love about this product? How was the fit and quality? Your feedback helps others make better choices."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          required
                        ></textarea>
                      </div>

                      <div className="pdp-review-form-actions">
                        <button type="submit" disabled={isSubmittingReview} className="pdp-submit-review" style={{ maxWidth: '320px' }}>
                          {isSubmittingReview ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-regular fa-paper-plane"></i> Publish Review</>}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
                {(localReviews && localReviews.length > 0) ? localReviews.map((rev, i) => (
                  <div key={i} className="pdp-review-item">
                    <div className="pdp-review-item-header">
                       <div className="pdp-review-user">
                         <div className="pdp-review-avatar">{rev.username?.[0] || 'U'}</div>
                         <div>
                           <p className="pdp-review-name">
                             {rev.username || 'Verified Buyer'}
                             <i className="fa-solid fa-circle-check pdp-verified-badge" title="Verified Purchase"></i>
                           </p>
                           <div className="pdp-review-stars">
                             {Array.from({ length: rev.rating }).map((_, j) => <i key={j} className="fa-solid fa-star"></i>)}
                             {Array.from({ length: 5 - rev.rating }).map((_, j) => <i key={j} className="fa-regular fa-star" style={{ color: '#e2e8f0' }}></i>)}
                           </div>
                         </div>
                       </div>
                       <span className="pdp-review-date">{new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <p className="pdp-review-text">{rev.comment}</p>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <i className="fa-regular fa-star-half-stroke" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '20px', display: 'block' }}></i>
                    <h5 style={{ color: '#0f172a', fontWeight: 800, fontSize: '18px', margin: '0 0 8px 0' }}>No Reviews Yet</h5>
                    <p style={{ color: '#64748b', fontWeight: 500, margin: 0 }}>Be the first to share your experience with this product!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="pdp-shipping-grid">
               <div className="pdp-shipping-card">
                 <h4><i className="fa-solid fa-box-open" style={{ color: '#088178' }}></i> Shipping Information</h4>
                 <ul className="pdp-shipping-list">
                   <li className="pdp-shipping-item">
                     <div className="pdp-shipping-icon"><i className="fa-solid fa-truck"></i></div>
                     <div>
                       <h5>Standard Delivery</h5>
                       <p>Free delivery on all orders above ₹999. Usually takes 3-5 business days.</p>
                     </div>
                   </li>
                   <li className="pdp-shipping-item">
                     <div className="pdp-shipping-icon"><i className="fa-solid fa-bolt"></i></div>
                     <div>
                       <h5>Express Delivery</h5>
                       <p>Next day delivery available for selected metro cities at ₹99 additional charge.</p>
                     </div>
                   </li>
                 </ul>
               </div>
               <div className="pdp-shipping-card">
                 <h4><i className="fa-solid fa-rotate-left" style={{ color: '#088178' }}></i> Returns & Warranty</h4>
                 <ul className="pdp-shipping-list">
                   <li className="pdp-shipping-item">
                     <div className="pdp-shipping-icon"><i className="fa-solid fa-shield-halved"></i></div>
                     <div>
                       <h5>7-Day Free Returns</h5>
                       <p>No questions asked return policy if the item is in original condition with tags.</p>
                     </div>
                   </li>
                   <li className="pdp-shipping-item">
                     <div className="pdp-shipping-icon"><i className="fa-solid fa-award"></i></div>
                     <div>
                       <h5>Quality Guarantee</h5>
                       <p>Every item undergoes 3 layers of quality checks before being shipped to you.</p>
                     </div>
                   </li>
                 </ul>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="pdp-related-sec">
          <div className="pdp-related-header">
            <div>
              <p className="pdp-related-subtitle">You Might Also Like</p>
              <h2 className="pdp-related-title">Recommended for You</h2>
            </div>
            <Link href="/shop" className="pdp-related-link">
              View All <i className="fa-solid fa-arrow-right-long"></i>
            </Link>
          </div>

          <div className="pdp-related-grid">
            {relatedProducts.map(p => (
              <Link key={p._id} href={`/product/${p._id}`} className="pdp-related-card">
                <div className="pdp-related-img">
                  <SafeImage 
                    src={getProductImageSrc(p.image)} 
                    fallbackSrc={getProductImageFallbackSrc(p.image)}
                    alt={p.name}
                  />
                </div>
                <div className="pdp-related-info">
                  <p className="pdp-related-cat">{p.category}</p>
                  <h4 className="pdp-related-name">{p.name}</h4>
                  <div className="pdp-related-price-row">
                    <span className="pdp-related-price">{formatPrice(p.price)}</span>
                    <div className="pdp-related-add">
                       <i className="fa-solid fa-plus"></i>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE STICKY ACTIONS */}
      <div className="pdp-mobile-sticky">
        <div className="pdp-mobile-actions">
          <button 
            className="pdp-mobile-wishlist"
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
          >
            {isWishlistLoading ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : isWishlisted ? (
              <i className="fa-solid fa-heart" style={{ color: '#ef4444' }}></i>
            ) : (
              <i className="fa-regular fa-heart"></i>
            )}
          </button>
          <button 
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className="pdp-mobile-add"
          >
            {isAdding ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-bag-shopping"></i>}
            {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </main>
  );
}
