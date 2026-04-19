// ─── ADD THIS to backend/src/routes/v1/product.api.js ───────────────────────
// Public FAQ endpoint — no auth required
router.get('/faqs', async (req, res) => {
  try {
    const FAQ = require('../../models/FAQ');
    const faqs = await FAQ.find({ isVisible: true }).sort({ category: 1, order: 1 });
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch FAQs' });
  }
});
