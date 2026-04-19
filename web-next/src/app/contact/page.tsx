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
        .contact-container { max-width: 1200px; margin: 0 auto; padding: 100px 20px; font-family: 'Poppins', sans-serif; }
        .contact-wrapper { 
          display: flex; 
          background: #ffffff; 
          border-radius: 24px; 
          overflow: hidden; 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); 
          border: 1px solid #f1f5f9;
        }
        .contact-info { 
          flex: 1; 
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
          color: #fff; 
          padding: 60px; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between; 
          position: relative;
          overflow: hidden;
        }
        .contact-info::after {
          content: '';
          position: absolute;
          bottom: -50px;
          right: -50px;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(8,129,120,0.4) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
        }
        .contact-form-side { flex: 1.5; padding: 60px 80px; }
        
        .contact-info h2 { font-size: 2.8rem; font-weight: 800; margin-bottom: 20px; line-height: 1.2; color: #ffffff; }
        .contact-info p { color: #94a3b8; margin-bottom: 50px; font-size: 1.1rem; font-weight: 500; }
        .info-item { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 35px; transition: transform 0.3s; }
        .info-item:hover { transform: translateX(10px); }
        .info-item i { 
          font-size: 20px; 
          width: 48px; 
          height: 48px; 
          background: rgba(255,255,255,0.1); 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #fb923c;
          flex-shrink: 0;
        }
        .info-item div { display: flex; flex-direction: column; }
        .info-item span.label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px; }
        .info-item span.value { font-size: 15px; font-weight: 600; color: #fff; }
        
        .contact-socials { display: flex; gap: 16px; position: relative; z-index: 2; }
        .contact-socials i { 
          width: 40px; height: 40px; 
          border-radius: 50%; 
          background: rgba(255,255,255,0.1); 
          display: flex; align-items: center; justify-content: center; 
          font-size: 16px; color: #fff; cursor: pointer; transition: all 0.3s; 
        }
        .contact-socials i:hover { background: #088178; transform: translateY(-3px); }

        .contact-form h3 { font-size: 2rem; font-weight: 800; margin-bottom: 10px; color: #0f172a; }
        .contact-form > p { color: #64748b; margin-bottom: 40px; font-weight: 500; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        .form-group { position: relative; }
        .form-group.full { grid-column: span 2; }
        .form-group label { display: block; margin-bottom: 10px; font-weight: 700; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
        .form-group input, .form-group textarea { 
          width: 100%; 
          padding: 16px 20px; 
          border: 2px solid #e2e8f0; 
          border-radius: 12px; 
          font-size: 15px; 
          transition: all 0.3s; 
          font-family: inherit; 
          background: #f8fafc;
          box-sizing: border-box;
        }
        .form-group input:focus, .form-group textarea:focus { 
          border-color: #088178; 
          outline: none; 
          background: #fff; 
          box-shadow: 0 4px 15px rgba(8, 129, 120, 0.1);
        }
        .form-group textarea { resize: vertical; min-height: 150px; }
        
        .submit-btn { 
          background: linear-gradient(135deg, #088178 0%, #06a899 100%); 
          color: #fff; 
          padding: 20px 40px; 
          border: none; 
          border-radius: 12px; 
          font-size: 16px; 
          font-weight: 800; 
          cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
          width: 100%; 
          box-shadow: 0 10px 20px rgba(8, 129, 120, 0.2); 
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(8, 129, 120, 0.3); }

        @media (max-width: 991px) {
          .contact-wrapper { flex-direction: column; }
          .form-grid { grid-template-columns: 1fr; }
          .form-group.full { grid-column: span 1; }
          .contact-form-side { padding: 40px 20px; }
        }
      `}} />

      <section id="page-header" className="contact-header" style={{ 
        backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url('/img/about/banner.png')",
        height: '40vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Get in Touch</h2>
        <p style={{ fontSize: '1.2rem', opacity: '0.9', marginTop: '10px', fontWeight: 500 }}>We'd love to hear from you. Our team is always here to chat.</p>
      </section>

      <div className="contact-container">
        <div className="contact-wrapper">
          <div className="contact-info">
            <div>
              <h2>Contact<br/>Information</h2>
              <p>Fill up the form and our team will get back to you within 24 hours.</p>
              
              <div className="info-item">
                <i className="fa-solid fa-phone"></i>
                <div>
                  <span className="label">Call Us</span>
                  <span className="value">{settings.phone || '+91 8160730726'}</span>
                </div>
              </div>
              <div className="info-item">
                <i className="fa-solid fa-envelope"></i>
                <div>
                  <span className="label">Email Us</span>
                  <span className="value">{settings.email || 'support@ecomsphere.com'}</span>
                </div>
              </div>
              <div className="info-item">
                <i className="fa-solid fa-location-dot"></i>
                <div>
                  <span className="label">Visit Us</span>
                  <span className="value">{settings.address || 'SSCCS, India'}</span>
                </div>
              </div>
              <div className="info-item">
                <i className="fa-solid fa-clock"></i>
                <div>
                  <span className="label">Working Hours</span>
                  <span className="value">{settings.hours || 'Mon - Sat: 10:00 - 18:00'}</span>
                </div>
              </div>
            </div>
            
            <div className="contact-socials">
              <i className="fa-brands fa-facebook-f"></i>
              <i className="fa-brands fa-twitter"></i>
              <i className="fa-brands fa-instagram"></i>
              <i className="fa-brands fa-linkedin-in"></i>
            </div>
          </div>

          <div className="contact-form-side">
            <form className="contact-form">
              <h3>Send a Message</h3>
              <p>Have a question or feedback? We're ready to help.</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" placeholder="John" required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Doe" required />
                </div>
                <div className="form-group full">
                  <label>Email Address</label>
                  <input type="email" placeholder="john@example.com" required />
                </div>
                <div className="form-group full">
                  <label>Subject</label>
                  <input type="text" placeholder="How can we help?" />
                </div>
                <div className="form-group full">
                  <label>Message</label>
                  <textarea placeholder="Write your message here..."></textarea>
                </div>
              </div>
              
              <button type="submit" className="submit-btn">
                Send Message <i className="fa-regular fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </div>

      <FooterPartial settings={settings} sessionUser={sessionUser} />
    </>
  );
}
