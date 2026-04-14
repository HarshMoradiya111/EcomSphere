const express = require('express');

// 1. EJS ROUTES (Current Production System)
const ejsRouter = express.Router();
ejsRouter.use('/auth', require('./v1/auth.routes'));
ejsRouter.use('/', require('./v1/product.routes'));
ejsRouter.use('/', require('./v1/cart.routes'));
ejsRouter.use('/', require('./v1/order.routes'));
ejsRouter.use('/', require('./v1/wishlist.routes'));
ejsRouter.use('/admin', require('./v1/admin.routes'));

// 2. API ROUTES (Next.js Future Storefront)
const apiRouter = express.Router();
apiRouter.use('/auth', require('./v1/auth.api'));
apiRouter.use('/products', require('./v1/product.api'));
apiRouter.use('/admin', require('./v1/admin.api'));
apiRouter.use('/blogs', require('./v1/blog.api'));
apiRouter.use('/orders', require('./v1/order.api'));
apiRouter.use('/user', require('./v1/user.api'));

module.exports = { ejsRouter, apiRouter };
