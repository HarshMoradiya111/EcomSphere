import StorefrontShell from '@/components/ejs-partials/StorefrontShell';
import { API_URL } from '@/config';
import { getSiteSettings } from '@/server/siteSettings';
import ProductDetailClient from '@/features/shop/ProductDetailClient';
import { getSessionUsername } from '@/server/sessionUser';

type Product = {
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

async function fetchRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products?category=${encodeURIComponent(category)}&limit=4`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data || []).filter((p: Product) => p._id !== excludeId);
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  const settings = await getSiteSettings();
  const sessionUser = await getSessionUsername();

  if (!product) {
    return (
      <StorefrontShell
        header={{ activePage: 'shop' }}
        settings={settings}
        sessionUser={sessionUser}
        breadcrumbs={[{ name: 'Shop', url: '/shop' }, { name: 'Product', url: `/product/${params.id}` }]}
        errors={['Product not found']}
      >
        <section className="px-4 py-32 text-center">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-50 mb-6">
            <i className="fa-solid fa-triangle-exclamation text-4xl text-red-400"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Product not found</h2>
          <a href="/shop" className="text-[#088178] font-bold hover:underline">Return to collection</a>
        </section>
      </StorefrontShell>
    );
  }

  const relatedProducts = await fetchRelatedProducts(product.category, product._id);

  return (
    <StorefrontShell
      header={{ activePage: 'shop' }}
      settings={settings}
      sessionUser={sessionUser}
      breadcrumbs={[
        { name: 'Shop', url: '/shop' },
        { name: product.category, url: `/shop?category=${encodeURIComponent(product.category)}` },
        { name: product.name, url: `/product/${product._id}` },
      ]}
    >
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </StorefrontShell>
  );
}
