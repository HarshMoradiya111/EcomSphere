'use client';

import { useState, useEffect } from 'react';
import SafeImage from '@/components/SafeImage';
import { getProductImageSrc, getProductImageFallbackSrc } from '@/utils/imagePaths';
import { API_URL } from '@/config';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
  averageRating?: number;
  numReviews?: number;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchProducts = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/products?page=${pageNum}&limit=${limit}`);
      const data = await res.json();

      if (data.success) {
        if (pageNum === 1) {
          setProducts(data.products);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }
        setHasMore(data.currentPage < data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  return (
    <div className="section-p1">
      <div className="pro-container">
        {products.map((product) => {
          const avg = Math.round(product.averageRating || 0);
          return (
            <div className="pro" key={product._id}>
              <a href={`/product/${product._id}`}>
                <SafeImage
                  src={getProductImageSrc(product.image)}
                  fallbackSrc={getProductImageFallbackSrc(product.image)}
                  alt={product.name}
                />
              </a>
              <div className="des">
                <span>{product.category}</span>
                <div className="star" style={{ margin: '5px 0' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i
                      key={`${product._id}-star-${i}`}
                      className={`fa-${i + 1 <= avg ? 'solid' : 'regular'} fa-star`}
                      style={{ color: '#ffbd27', fontSize: '12px' }}
                    ></i>
                  ))}
                  <small style={{ color: '#888', marginLeft: '5px' }}>({product.numReviews || 0})</small>
                </div>
                <h5>{product.name}</h5>
                <p>{(product.description || '').substring(0, 60)}...</p>
                <h4>₹{Number(product.price).toLocaleString('en-IN')}</h4>
              </div>
              <a href="#" className="add-to-cart cart1" title="Add to Cart">
                <i className="fa-solid fa-cart-shopping"></i>
              </a>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button 
            className="normal" 
            onClick={handleLoadMore} 
            disabled={loading}
            style={{ 
              padding: '15px 40px', 
              fontSize: '15px', 
              fontWeight: 700, 
              background: loading ? '#ccc' : '#088178',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading Intelligence...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
