const express = require('express');

// 1. API ROUTES (Next.js Storefront)
const apiRouter = express.Router();
apiRouter.use('/auth', require('./v1/auth.api'));
apiRouter.use('/products', require('./v1/product.api'));
apiRouter.use('/admin', require('./v1/admin.api'));
apiRouter.use('/blogs', require('./v1/blog.api'));
apiRouter.use('/orders', require('./v1/order.api'));
apiRouter.use('/user', require('./v1/user.api'));

// 2. VIEW ROUTES (EJS Bridge Pages)
const viewRouter = express.Router();
viewRouter.use('/auth', require('./v1/auth.routes'));
viewRouter.use('/admin', require('./v1/admin.routes'));
viewRouter.use('/cart', require('./v1/cart.routes'));
viewRouter.use('/orders', require('./v1/order.routes'));
viewRouter.use('/wishlist', require('./v1/wishlist.routes'));
viewRouter.use('/', require('./v1/product.routes'));

module.exports = { apiRouter, viewRouter };
