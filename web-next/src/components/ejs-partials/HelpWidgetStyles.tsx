export default function HelpWidgetStyles() {
  return (
    <style>{`
      #help-widget { position: fixed; bottom: 30px; right: 30px; z-index: 10000; font-family: 'Poppins', sans-serif; }
      #help-bubble {
        background: linear-gradient(135deg, #088178 0%, #066b64 100%);
        color: #fff; height: 60px; padding: 0 25px; border-radius: 30px;
        display: flex; align-items: center; justify-content: center; gap: 10px;
        box-shadow: 0 10px 25px rgba(8, 129, 120, 0.3); cursor: pointer;
        transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      #help-bubble:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(8, 129, 120, 0.4); }
      #help-panel {
        position: absolute; bottom: 80px; right: 0; width: 300px;
        background: #fff; border-radius: 15px; overflow: hidden;
        box-shadow: 0 15px 50px rgba(0,0,0,0.15);
        transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transform-origin: bottom right;
      }
      #help-panel.hidden { opacity: 0; transform: scale(0.5) translateY(50px); pointer-events: none; }
      .help-header { background: #088178; padding: 20px; color: #fff; display: flex; justify-content: space-between; align-items: center; }
      .help-body { padding: 20px; }
      .help-actions { display: flex; flex-direction: column; gap: 10px; }
      .help-btn {
        display: flex; align-items: center; gap: 10px; padding: 12px 15px;
        border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; transition: 0.3s;
      }
      .help-btn.whatsapp { background: #25d366 !important; color: #fff !important; }
      .help-btn.email, .help-btn.faq { background: #f8f9fa; color: #333; border: 1px solid #ddd; }
      .help-btn:hover { transform: translateX(5px); }
      @media (max-width: 480px) { .help-label { display: none; } #help-bubble { width: 60px; padding: 0; } }
    `}</style>
  );
}
