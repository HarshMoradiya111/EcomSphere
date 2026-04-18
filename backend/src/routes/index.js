const express = require('express');

// 1. API ROUTES (Next.js Storefront)
const apiRouter = express.Router();
apiRouter.use('/auth', require('./v1/auth.api'));
apiRouter.use('/products', require('./v1/product.api'));
apiRouter.use('/admin', require('./v1/admin.api'));
apiRouter.use('/blogs', require('./v1/blog.api'));
apiRouter.use('/orders', require('./v1/order.api'));
apiRouter.use('/user', require('./v1/user.api'));

module.exports = { apiRouter };
