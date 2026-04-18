import StorefrontShell from '@/src/components/ejs-partials/StorefrontShell';
import SafeImage from '@/src/components/SafeImage';
import { API_URL } from '@/src/config';
import { getSiteSettings } from '@/src/server/siteSettings';
import { getProductImageSrc, getProductImageFallbackSrc } from '@/src/utils/imagePaths';

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  countInStock?: number;
  status?: string;
  sizes?: string[];
  colors?: string[];
};

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  const settings = await getSiteSettings();

  if (!product) {
    return (
      <StorefrontShell
        header={{ activePage: 'shop' }}
        settings={settings}
        breadcrumbs={[{ name: 'Shop', url: '/shop' }, { name: 'Product', url: `/product/${params.id}` }]}
        errors={['Product not found']}
      >
        <section className="section-p1">
          <h2>Product not found</h2>
          <a href="/shop">Back to Shop</a>
        </section>
      </StorefrontShell>
    );
  }

  const productStatus = (product.status || 'In Stock').toLowerCase().replace(/ /g, '-');
  const productStock = Number(product.countInStock || 0);

  return (
    <StorefrontShell
      header={{ activePage: 'shop' }}
      settings={settings}
      breadcrumbs={[
        { name: 'Shop', url: '/shop' },
        { name: product.category, url: `/shop?category=${encodeURIComponent(product.category)}` },
        { name: product.name, url: `/product/${product._id}` },
      ]}
    >
      <section id="prodetails" className="section-p1">
        <div className="single-pro-image" style={{ position: 'relative' }}>
          <SafeImage
            src={getProductImageSrc(product.image)}
            fallbackSrc={getProductImageFallbackSrc(product.image)}
            alt={product.name}
            width="100%"
            id="main-product-image"
          />
          <div className="small-img-group">
            <div className="small-img-col">
              <SafeImage
                src={getProductImageSrc(product.image)}
                fallbackSrc={getProductImageFallbackSrc(product.image)}
                alt="Main Image"
                className="small-img active-thumb"
              />
            </div>
          </div>
        </div>

        <div className="single-pro-details">
          <h6>{product.category}</h6>
          <h2>{product.name}</h2>
          <h4>₹{Number(product.price).toLocaleString('en-IN')}</h4>

          <div className="stock-status" style={{ marginBottom: '20px' }}>
            <span className={`order-status status-${productStatus}`}>
              <i className={`fa-solid ${productStock > 0 ? 'fa-check-circle' : 'fa-circle-xmark'}`}></i>
              {' '}
              {product.status || 'In Stock'}
              {productStock > 0 && productStock <= 5 ? ` (${productStock} left)` : ''}
            </span>
          </div>

          <p>{product.description || ''}</p>

          {product.sizes && product.sizes.length > 0 && (
            <div style={{ margin: '20px 0' }}>
              <label style={{ fontWeight: 600, marginRight: '10px' }}>Size:</label>
              <select id="product-size" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', outline: 'none' }}>
                {product.sizes.map((size) => (
                  <option value={size} key={size}>{size}</option>
                ))}
              </select>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div style={{ margin: '20px 0' }}>
              <label style={{ fontWeight: 600, marginRight: '10px' }}>Color:</label>
              <select id="product-color" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', outline: 'none' }}>
                {product.colors.map((color) => (
                  <option value={color} key={color}>{color}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ margin: '20px 0' }}>
            <label style={{ fontWeight: 600, marginRight: '10px' }}>Quantity:</label>
            <input type="number" id="product-quantity" defaultValue={1} min={1} max={10} style={{ width: '60px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>

          <button
            className="add-to-cart normal"
            id="add-to-cart-btn"
            data-product-id={product._id}
            data-name={product.name}
            data-price={product.price}
            data-image={product.image}
            disabled={productStock === 0}
            style={{
              background: productStock === 0 ? '#ccc' : '#088178',
              color: '#fff',
              padding: '14px 35px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: productStock === 0 ? 'not-allowed' : 'pointer',
              transition: '0.3s',
            }}
          >
            <i className="fa-solid fa-cart-shopping"></i> {productStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </section>
    </StorefrontShell>
  );
}
