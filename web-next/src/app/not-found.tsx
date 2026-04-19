import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';

export default async function NotFound() {
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();

  return (
    <>
      <HeaderPartial activePage="" sessionUser={sessionUser} settings={settings} />
      
      <main style={{ 
        textAlign: 'center', 
        padding: '120px 20px', 
        fontFamily: "'Poppins', sans-serif",
        background: '#f8fbfb',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ 
          fontSize: '150px', 
          fontWeight: 900, 
          color: '#088178', 
          lineHeight: 1,
          opacity: 0.1,
          position: 'absolute',
          zIndex: 0
        }}>404</div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <i className="fa-solid fa-compass-slash" style={{ fontSize: '80px', color: '#088178', marginBottom: '30px' }}></i>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1a1a1a', marginBottom: '15px' }}>Lost in Fashion?</h2>
          <p style={{ color: '#666', fontSize: '18px', maxWidth: '500px', margin: '0 auto 40px' }}>
            The page you're looking for has either been moved or never existed. Let's get you back on track.
          </p>
          <a href="/" style={{ 
            background: '#088178', 
            color: '#fff', 
            padding: '15px 40px', 
            borderRadius: '12px', 
            textDecoration: 'none', 
            fontWeight: 700,
            transition: '0.3s',
            boxShadow: '0 10px 20px rgba(8, 129, 120, 0.2)'
          }}>
            Explore Collection
          </a>
        </div>
      </main>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
