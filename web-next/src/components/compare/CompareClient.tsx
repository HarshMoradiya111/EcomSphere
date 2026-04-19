'use client';

import { useState, useEffect } from 'react';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  countInStock: number;
  averageRating?: number;
  numReviews?: number;
}

interface Props {
  initialProducts: Product[];
  sessionUser: string | null;
  settings: any;
}

export default function CompareClient({ initialProducts, sessionUser, settings }: Props) {
  const [products, setProducts] = useState(initialProducts);

  const removeFromCompare = (productId: string) => {
    const compareList = JSON.parse(localStorage.getItem('compareItems') || '[]');
    const newList = compareList.filter((id: string) => id !== productId);
    localStorage.setItem('compareItems', JSON.stringify(newList));
    
    // Update local state instead of redirecting
    setProducts(products.filter(p => p._id !== productId));
    
    // Update URL without refresh
    const newUrl = newList.length > 0 ? `/compare?ids=${newList.join(',')}` : '/compare';
    window.history.replaceState({}, '', newUrl);
  };

  return (
    <>
      <HeaderPartial activePage="" sessionUser={sessionUser} settings={settings} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .compare-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; overflow-x: auto; font-family: 'Poppins', sans-serif; }
        .compare-table { width: 100%; border-collapse: collapse; min-width: 800px; border: 1px solid #eee; background: #fff; border-radius: 12px; overflow: hidden; }
        .compare-table th, .compare-table td { padding: 25px 20px; text-align: center; border: 1px solid #eee; }
        .compare-table th { background: #fcfcfc; width: 200px; text-align: left; font-weight: 700; color: #1a1a1a; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; }
        .compare-img { width: 150px; height: 180px; object-fit: cover; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .compare-price { font-size: 20px; font-weight: 700; color: #088178; margin-top: 5px; }
        .remove-compare { color: #ef4444; cursor: pointer; font-size: 13px; margin-top: 15px; display: inline-block; font-weight: 600; text-decoration: none; }
        .remove-compare:hover { color: #dc2626; }
        
        .empty-compare { text-align: center; padding: 120px 20px; }
        .empty-compare i { font-size: 80px; color: #f0f0f0; margin-bottom: 25px; display: block; }
        .empty-compare h2 { font-size: 24px; color: #333; margin-bottom: 15px; }
        .empty-compare p { color: #888; }
        
        .view-details-btn { 
          display: inline-block;
          background: #088178; 
          color: #fff; 
          padding: 10px 20px; 
          border-radius: 6px; 
          text-decoration: none; 
          font-weight: 600; 
          font-size: 13px;
          transition: 0.3s;
        }
        .view-details-btn:hover { background: #06655e; }
      `}} />

      <section id="page-header" className="about-header" style={{ 
        backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/img/about/banner.png')",
        height: '30vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '800' }}>#CompareProducts</h2>
        <p style={{ fontSize: '1.1rem', opacity: '0.9' }}>Compare features and choose the best for you</p>
      </section>

      <div className="compare-container">
        {products && products.length > 0 ? (
          <table className="compare-table">
            <thead>
              <tr>
                <th>Products</th>
                {products.map(product => (
                  <td key={product._id}>
                    <img src={product.image.startsWith('http') ? product.image : `/uploads/${product.image || 'default.jpg'}`} alt={product.name} className="compare-img" />
                    <h4 style={{ margin: '10px 0', fontSize: '18px', fontWeight: '600' }}>{product.name}</h4>
                    <p className="compare-price">₹{product.price.toLocaleString('en-IN')}</p>
                    <a href="javascript:void(0)" onClick={() => removeFromCompare(product._id)} className="remove-compare">
                      <i className="fa-solid fa-trash-can" style={{ marginRight: '5px' }}></i> Remove
                    </a>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Category</th>
                {products.map(product => (
                  <td key={product._id} style={{ color: '#555', fontWeight: '500' }}>{product.category}</td>
                ))}
              </tr>
              <tr>
                <th>Description</th>
                {products.map(product => (
                  <td key={product._id} style={{ fontSize: '14px', color: '#666', maxWidth: '300px', lineHeight: '1.6', textAlign: 'left' }}>
                    {product.description.substring(0, 150)}...
                  </td>
                ))}
              </tr>
              <tr>
                <th>Availability</th>
                {products.map(product => (
                  <td key={product._id} style={{ fontWeight: '600', color: product.countInStock > 0 ? '#22c55e' : '#ef4444' }}>
                    {product.countInStock > 0 ? `In Stock (${product.countInStock})` : 'Out of Stock'}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Rating</th>
                {products.map(product => (
                  <td key={product._id}>
                    <div style={{ color: '#ffbd27' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className={`fa-${i < Math.round(product.averageRating || 0) ? 'solid' : 'regular'} fa-star`}></i>
                      ))}
                      <div style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>({product.numReviews || 0} reviews)</div>
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <th>Action</th>
                {products.map(product => (
                  <td key={product._id}>
                    <a href={`/product/${product._id}`} className="view-details-btn">View Details</a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="empty-compare">
            <i className="fa-solid fa-scale-unbalanced-flip"></i>
            <h2>No products selected for comparison</h2>
            <p>Go to our <a href="/shop" style={{ color: '#088178', fontWeight: '600', textDecoration: 'none' }}>Shop</a> and add some products to compare!</p>
          </div>
        )}
      </div>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
