import type { Metadata } from 'next';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';

export const metadata: Metadata = {
  title: 'About Us | EcomSphere',
  description: 'Learn about our heritage, values, and mission at EcomSphere.',
};

export default async function AboutPage() {
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();

  return (
    <>
      <HeaderPartial activePage="about" sessionUser={sessionUser} settings={settings} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .about-container { max-width: 1200px; margin: 0 auto; padding: 80px 20px; font-family: 'Poppins', sans-serif; }
        .about-row { display: flex; align-items: center; gap: 60px; margin-bottom: 100px; }
        .about-row:nth-child(even) { flex-direction: row-reverse; }
        .about-img { flex: 1; display: flex; justify-content: center; align-items: center; }
        .about-img img { width: 100%; max-width: 500px; border-radius: 20px; box-shadow: 0 15px 35px rgba(8, 129, 120, 0.1); }
        .about-text { flex: 1; }
        .about-text span { font-size: 14px; font-weight: 800; color: #088178; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 15px; }
        .about-text h2 { font-size: 2.8rem; color: #1a1a1a; margin-bottom: 25px; line-height: 1.2; font-weight: 700; }
        .about-text p { color: #465b52; line-height: 1.8; font-size: 16px; margin-bottom: 20px; }
        
        .classic-stats { background: #041e42; padding: 80px 20px; display: flex; justify-content: space-around; text-align: center; color: #fff; border-radius: 20px; margin: 50px 0; }
        .stat-box h3 { font-size: 3.5rem; font-weight: 900; margin-bottom: 8px; color: #ffbd27; text-shadow: 0 0 15px rgba(255, 189, 39, 0.3); }
        .stat-box p { text-transform: uppercase; font-size: 13px; font-weight: 700; opacity: 0.9; letter-spacing: 1.5px; }

        .heritage-section { padding: 100px 20px; background-color: #f5f7f9; text-align: center; }
        .heritage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 50px; }
        .heritage-card { background: #fff; padding: 50px 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); transition: 0.3s; }
        .heritage-card:hover { transform: translateY(-10px); }
        .heritage-card i { font-size: 45px; color: #088178; margin-bottom: 25px; display: block; }
        .heritage-card h4 { font-size: 22px; margin-bottom: 15px; font-weight: 600; color: #1a1a1a; }
        
        @media (max-width: 991px) {
          .about-row, .about-row:nth-child(even) { flex-direction: column; text-align: center; }
          .classic-stats { flex-wrap: wrap; gap: 40px; }
          .stat-box { width: 45%; }
        }
      `}} />

      <section id="page-header" className="about-header" style={{ 
        backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/img/about/banner.png')",
        height: '40vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>#OurHeritage</h2>
        <p style={{ fontSize: '1.2rem', fontStyle: 'italic', opacity: '0.9' }}>Defined by quality, driven by passion since 2015.</p>
      </section>

      <div className="about-container">
        <div className="about-row">
          <div className="about-img">
            <img src="/img/harsh.jpg" alt="Our Journey" />
          </div>
          <div className="about-text">
            <span>The Journey</span>
            <h2>Redefining Elegant E-Commerce Architecture</h2>
            <p>EcomSphere began with a singular vision: to create a digital boutique that feels as premium as the products it houses. We recognized a gap in the market for a platform that balances technical excellence with aesthetic sophistication.</p>
            <p>Today, we serve a global community of style-conscious individuals who demand transparency, speed, and uncompromising quality in every interaction.</p>
          </div>
        </div>

        <div className="classic-stats">
          <div className="stat-box">
            <h3>10k+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-box">
            <h3>50+</h3>
            <p>Premium Brands</p>
          </div>
          <div className="stat-box">
            <h3>24h</h3>
            <p>Global Support</p>
          </div>
          <div className="stat-box">
            <h3>100%</h3>
            <p>Secure Systems</p>
          </div>
        </div>
      </div>

      <section className="heritage-section">
        <div className="about-container" style={{ padding: '0 20px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>The Pillars of EcomSphere</h2>
          <p style={{ color: '#666', marginBottom: '50px' }}>What makes us the preferred choice for premium fashion.</p>
          <div className="heritage-grid">
            <div className="heritage-card">
              <i className="fa-solid fa-gem"></i>
              <h4>Uncompromising Quality</h4>
              <p>Every product in our catalog undergoes a rigorous selection process. If it doesn't meet our standards for craftsmanship, it doesn't make it to our store.</p>
            </div>
            <div className="heritage-card">
              <i className="fa-solid fa-shield-halved"></i>
              <h4>Built on Trust</h4>
              <p>Security is the foundation of digital commerce. We utilize military-grade encryption to ensure your data and transactions remain private and protected.</p>
            </div>
            <div className="heritage-card">
              <i className="fa-solid fa-earth-americas"></i>
              <h4>Global Vision</h4>
              <p>Style knows no borders. We've optimized our logistics network to provide fast, reliable shipping to every corner of the globe.</p>
            </div>
          </div>
        </div>
      </section>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
