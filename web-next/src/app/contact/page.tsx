import type { Metadata } from 'next';
import HeaderPartial from '@/components/ejs-partials/HeaderPartial';
import FooterPartial from '@/components/ejs-partials/FooterPartial';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';

export const metadata: Metadata = {
  title: 'Contact Us | EcomSphere',
  description: 'Get in touch with the EcomSphere support team.',
};

export default async function ContactPage() {
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();

  return (
    <>
      <HeaderPartial activePage="contact" sessionUser={sessionUser} settings={settings} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .contact-container { max-width: 1200px; margin: 0 auto; padding: 80px 20px; font-family: 'Poppins', sans-serif; }
        .contact-wrapper { display: flex; gap: 50px; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
        .contact-info { flex: 1; background: #088178; color: #fff; padding: 60px; display: flex; flexDirection: column; justifyContent: space-between; }
        .contact-form-side { flex: 1.5; padding: 60px; }
        
        .contact-info h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 20px; }
        .contact-info p { opacity: 0.8; margin-bottom: 40px; font-size: 1.1rem; }
        .info-item { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
        .info-item i { font-size: 24px; width: 30px; text-align: center; }
        
        .contact-form h3 { font-size: 1.8rem; font-weight: 700; margin-bottom: 30px; color: #1a1a1a; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #555; }
        .form-group input, .form-group textarea { width: 100%; padding: 15px; border: 2px solid #f0f0f0; border-radius: 10px; font-size: 15px; transition: 0.3s; font-family: inherit; }
        .form-group input:focus, .form-group textarea:focus { border-color: #088178; outline: none; background: #fff; }
        
        .submit-btn { background: #088178; color: #fff; padding: 18px 40px; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; width: 100%; box-shadow: 0 10px 20px rgba(8, 129, 120, 0.2); }
        .submit-btn:hover { background: #06655e; transform: translateY(-2px); box-shadow: 0 15px 25px rgba(8, 129, 120, 0.3); }

        @media (max-width: 991px) {
          .contact-wrapper { flex-direction: column; }
          .contact-info, .contact-form-side { padding: 40px 30px; }
        }
      `}} />

      <section id="page-header" className="contact-header" style={{ 
        backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/img/about/banner.png')",
        height: '35vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: '800', textTransform: 'uppercase' }}>#Let'sTalk</h2>
        <p style={{ fontSize: '1.2rem', opacity: '0.9' }}>We'd love to hear from you and help with your queries.</p>
      </section>

      <div className="contact-container">
        <div className="contact-wrapper">
          <div className="contact-info">
            <div>
              <h2>Contact Information</h2>
              <p>Say something to start a live chat!</p>
              
              <div className="info-item">
                <i className="fa-solid fa-phone"></i>
                <span>{settings.phone || '+91 8160730726'}</span>
              </div>
              <div className="info-item">
                <i className="fa-solid fa-envelope"></i>
                <span>{settings.email || 'support@ecomsphere.com'}</span>
              </div>
              <div className="info-item">
                <i className="fa-solid fa-location-dot"></i>
                <span>{settings.address || 'SSCCS, India'}</span>
              </div>
              <div className="info-item">
                <i className="fa-solid fa-clock"></i>
                <span>{settings.hours || 'Mon - Sat: 10:00 - 18:00'}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', fontSize: '20px' }}>
              <i className="fa-brands fa-facebook-f"></i>
              <i className="fa-brands fa-twitter"></i>
              <i className="fa-brands fa-instagram"></i>
              <i className="fa-brands fa-linkedin-in"></i>
            </div>
          </div>

          <div className="contact-form-side">
            <form className="contact-form">
              <h3>Get in Touch</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" placeholder="How can we help?" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows={5} placeholder="Write your message here..."></textarea>
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </div>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
