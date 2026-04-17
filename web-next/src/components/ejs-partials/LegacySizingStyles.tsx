export default function LegacySizingStyles() {
  const css = `
      #header .logo { 
        height: 60px !important; 
        width: auto !important; 
        max-width: none !important;
        object-fit: contain;
      }
      
      #header #lg-bag .cart {
        height: 30px !important;
        width: auto !important;
        max-width: none !important;
      }

      #mobile img {
        height: 20px !important;
        width: auto !important;
      }

      footer .ins {
        height: 20px !important;
        width: auto !important;
        max-width: none !important;
        margin: 0 5px;
      }

      footer .col.install img {
        height: 40px !important;
        width: auto !important;
        margin: 10px 0;
      }

      footer .col.install .row img {
        border: 1px solid #088178;
        border-radius: 6px;
        margin-right: 10px;
      }

      #feature .fe-box img {
        width: 100% !important;
        height: auto !important;
        margin-bottom: 10px;
      }

      .pro img {
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 4/5;
        object-fit: cover;
      }
    `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
