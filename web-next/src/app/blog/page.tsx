import type { Metadata } from 'next';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
import { getBlogs } from '@/lib/api/blog';

export const metadata: Metadata = {
  title: 'Blog | EcomSphere',
  description: 'Read our latest blog posts and news about elegant fashion and e-commerce.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();
  let blogs: any[] = [];

  try {
    blogs = await getBlogs();
  } catch (err) {
    console.error('[BlogPage] fetch error:', err);
  }

  return (
    <>
      <HeaderPartial activePage="blog" sessionUser={sessionUser} settings={settings} />
      
      <section id="page-header" className="blog-header" style={{ 
        backgroundImage: "url('/img/about/banner.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '40vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: '800' }}>#readmore</h2>
        <p style={{ fontSize: '1.2rem', opacity: '0.9' }}>Read all case studies about our products!</p>
      </section>

      <section id="blog" className="section-p1" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {blogs && blogs.length > 0 ? (
          blogs.map((b) => (
            <div key={b._id} className="blog-box" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%', 
              position: 'relative', 
              paddingBottom: '90px',
              gap: '40px'
            }}>
              <div className="blog-img" style={{ flex: '1', width: '50%' }}>
                <img src={b.image} alt={b.title} style={{ 
                  width: '100%', 
                  height: '350px', 
                  objectFit: 'cover',
                  borderRadius: '10px'
                }} />
              </div>
              <div className="blog-details" style={{ flex: '1', width: '50%' }}>
                <h4 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px', color: '#1a1a1a' }}>{b.title}</h4>
                <p style={{ color: '#465b52', lineHeight: '1.8', marginBottom: '20px' }}>{b.content}</p>
                <a href="#" style={{ 
                  textDecoration: 'none', 
                  fontSize: '11px', 
                  color: '#1a1a1a', 
                  fontWeight: '700', 
                  position: 'relative',
                  transition: '0.3s'
                }}>CONTINUE READING</a>
              </div>
              <h1 style={{ 
                color: '#c9cbce', 
                fontWeight: '700', 
                fontSize: '70px', 
                position: 'absolute', 
                top: '-40px', 
                left: '0', 
                zIndex: '-1',
                opacity: '0.5',
                pointerEvents: 'none'
              }}>
                {new Date(b.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}
              </h1>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h2 style={{ fontSize: '2rem', color: '#1a1a1a', marginBottom: '10px' }}>Check back soon!</h2>
            <p style={{ color: '#666' }}>There are no blog posts published yet.</p>
          </div>
        )}
      </section>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
