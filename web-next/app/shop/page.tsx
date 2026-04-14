import StorefrontShell from '@/src/components/ejs-partials/StorefrontShell';
import SafeImage from '@/src/components/SafeImage';
import { API_URL } from '@/src/config';
import { getSessionUsername } from '@/src/server/sessionUser';

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  averageRating?: number;
  numReviews?: number;
};

async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await fetchProducts();
  const sessionUser = await getSessionUsername();

  return (
    <StorefrontShell
      header={{ activePage: 'shop', sessionUser }}
      sessionUser={sessionUser}
      breadcrumbs={[{ name: 'Shop', url: '/shop' }]}
      success={[]}
      errors={[]}
    >
      <style>{`
        .pro .action-btn {
          position: absolute;
          right: 15px;
          background: rgba(255, 255, 255, 0.92);
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.3s;
        }
        .pro .toggle-wishlist {
          top: 15px;
          color: #ccc;
        }
        .pro .toggle-wishlist.active {
          color: #ff4d4d;
        }
        .pro .compare-btn {
          top: 60px;
          color: #088178;
        }
        .pro .action-btn:hover {
          transform: scale(1.1);
          background: #fff;
        }
      `}</style>
      <section id="page-header">
        <h2>Shop All Products</h2>
        <p>Browse our complete collection</p>
      </section>

      <section id="product1" className="section-p1">
        <h2>All Products</h2>
        <p>{products.length} product{products.length !== 1 ? 's' : ''} found</p>

        <div className="pro-container">
          {products.length > 0 ? (
            products.map((product) => {
              const avg = Math.round(product.averageRating || 0);
              return (
                <div className="pro" key={product._id}>
                  <a href={`/product/${product._id}`}>
                    <SafeImage
                      src={`/uploads/${product.image}`}
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

                  <a
                    href="#"
                    className="action-btn toggle-wishlist"
                    data-product-id={product._id}
                    title="Wishlist"
                  >
                    <i className="fa-regular fa-heart"></i>
                  </a>

                  <a
                    className="action-btn compare-btn"
                    href={`/compare?ids=${encodeURIComponent(product._id)}`}
                    title="Compare"
                  >
                    <i className="fa-solid fa-scale-unbalanced-flip"></i>
                  </a>
                  <a
                    href="#"
                    className="add-to-cart cart1"
                    data-product-id={product._id}
                    data-name={product.name}
                    data-price={product.price}
                    data-image={product.image}
                    title="Add to Cart"
                  >
                    <i className="fa-solid fa-cart-shopping"></i>
                  </a>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', width: '100%', padding: '60px 20px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '60px', color: '#ccc' }}></i>
              <p style={{ color: '#888', marginTop: '15px', fontSize: '18px' }}>No products found in this category.</p>
              <a
                href="/shop"
                style={{ display: 'inline-block', marginTop: '15px', padding: '12px 28px', background: '#088178', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}
              >
                View All Products
              </a>
            </div>
          )}
        </div>
      </section>
    </StorefrontShell>
  );
}
