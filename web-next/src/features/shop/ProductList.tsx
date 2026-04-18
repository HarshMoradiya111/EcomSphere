'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

function ProductListContent() {
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter States - initialized from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState('newest');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  const limit = 20;

  // Sync state with URL changes (e.g. from header search)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'All';
    setSearch(urlSearch);
    setCategory(urlCategory);
  }, [searchParams]);

  const fetchProducts = useCallback(async (pageNum: number, isNewFilter: boolean = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        category: category,
        search: search,
        sort: sort
      });

      const res = await fetch(`${API_URL}/api/v1/products?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        if (pageNum === 1 || isNewFilter) {
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
  }, [category, search, sort]);

  // Fetch categories once on mount
  useEffect(() => {
    fetch(`${API_URL}/api/v1/products/categories/list`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAllCategories(data.categories);
      })
      .catch(err => console.error("Category fetch error:", err));
  }, []);

  // Effect for filter changes
  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [category, sort, fetchProducts]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, fetchProducts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  return (
    <div className="section-p1">
      {/* Local Filter Bar (Can be kept or styled as "In-page results controls") */}
      <div className="filter-bar" style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '20px', 
        marginBottom: '40px',
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '15px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}></i>
          <input 
            type="text" 
            placeholder="Search within results..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 15px 12px 45px', 
              borderRadius: '10px', 
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff' }}
          >
            <option value="All">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff' }}
          >
            <option value="newest">Newest First</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="nameAsc">Name: A to Z</option>
            <option value="nameDesc">Name: Z to A</option>
          </select>
        </div>
      </div>

      <div className="pro-container">
        {products.length > 0 ? products.map((product) => {
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
        }) : !loading && (
          <div style={{ width: '100%', textAlign: 'center', padding: '50px', color: '#888' }}>
             <i className="fa-solid fa-box-open" style={{ fontSize: '40px', marginBottom: '15px' }}></i>
             <p>No products found matching your criteria.</p>
          </div>
        )}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#fff',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {loading ? 'Searching...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductList() {
  return (
    <Suspense fallback={<div className="section-p1">Loading products...</div>}>
      <ProductListContent />
    </Suspense>
  );
}
