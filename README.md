# 🛍️ EcomSphere - JavaScript Edition (v2.0.0)

> **Complete e-commerce platform converted from PHP/MySQL to Node.js + Express + MongoDB**

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
copy .env.example .env     # Edit MONGODB_URI if needed

# 3. Seed the database (requires MongoDB running)
npm run seed

# 4. Start the dev server
npm run dev

# 5. Open in browser
# Customer: http://localhost:3000/
# Admin:    http://localhost:3000/admin/login
```

---

## ⚙️ Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20.0.0+ |
| MongoDB | 6.0+ (local or Atlas) |
| npm | 9.0+ |

### Install MongoDB (Windows)
Download from: https://www.mongodb.com/try/download/community
Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas

---

## 🔑 Default Credentials

| Role | Field | Value |
|------|-------|-------|
| Admin | Username | `admin` |
| Admin | Password | `admin123` |
| Admin | Email | `admin@gmail.com` |
| Test User | Email | `harshmoradiya@gmail.com` |
| Test User | Password | `test1234` |

---

## 📁 Project Structure

```
EcomSphere-antigravity/
├── server.js                 ← Express app entry point
├── package.json
├── .env                      ← Environment variables (not in git)
├── .env.example              ← Environment template
│
├── config/
│   └── db.js                 ← MongoDB connection
│
├── middleware/
│   └── auth.js               ← Session auth guards
│
├── models/
│   ├── User.js               ← User schema + bcrypt
│   ├── Admin.js              ← Admin schema + bcrypt
│   ├── Product.js            ← Product schema (5 categories)
│   ├── Cart.js               ← Cart with embedded items
│   └── Order.js              ← Order with embedded items + checkout info
│
├── controllers/
│   ├── authController.js     ← Login, register, forgot/reset password
│   ├── productController.js  ← Homepage, shop, product detail, profile
│   ├── cartController.js     ← Cart CRUD API
│   ├── orderController.js    ← Checkout, place order, order success
│   └── adminController.js    ← Full admin CRUD operations
│
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   └── adminRoutes.js        ← Includes multer for image upload
│
├── views/                    ← EJS templates
│   ├── index.ejs             ← Homepage (products by category)
│   ├── login.ejs             ← Login + Register (animated tabs)
│   ├── register.ejs
│   ├── profile.ejs           ← User profile + order history
│   ├── shop.ejs              ← Shop with category filter
│   ├── sproduct.ejs          ← Single product detail
│   ├── cart.ejs              ← Shopping cart
│   ├── checkout.ejs          ← Checkout form
│   ├── order_success.ejs     ← Order confirmation
│   ├── about.ejs, contact.ejs, blog.ejs
│   ├── 404.ejs, error.ejs
│   ├── partials/
│   │   ├── header.ejs, footer.ejs, flash.ejs
│   └── admin/
│       ├── login.ejs
│       ├── dashboard.ejs
│       ├── products.ejs, add_product.ejs, edit_product.ejs
│       ├── orders.ejs, order_details.ejs
│       ├── users.ejs
│       └── partials/admin_header.ejs, admin_footer.ejs
│
├── public/
│   ├── css/
│   │   ├── style.css         ← Main stylesheet
│   │   ├── auth.css          ← Login/register animations
│   │   └── admin.css         ← Dark premium admin theme
│   ├── js/
│   │   ├── script.js         ← Main JS (add-to-cart, mobile nav)
│   │   ├── cart.js           ← Cart page JS
│   │   ├── auth.js           ← Login/register tab switching
│   │   └── admin.js          ← Admin panel JS
│   ├── img/                  ← Static images (copied from original)
│   └── uploads/              ← Product images (uploaded via admin)
│
└── utils/
    └── seed.js               ← DB seed: admin + products + test user
```

---

## 🌐 API Endpoints

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/login` | Login page |
| POST | `/auth/login` | Process login |
| GET | `/auth/register` | Register page |
| POST | `/auth/register` | Process register |
| GET | `/auth/logout` | Logout |
| GET/POST | `/auth/forgot-password` | Forgot password |
| GET/POST | `/auth/reset-password/:token` | Reset password |

### Shop
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Homepage (requires auth) |
| GET | `/shop?category=...` | Shop with optional filter |
| GET | `/product/:id` | Single product detail |
| GET | `/profile` | User profile + order history |

### Cart API
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/cart` | Fetch cart items |
| POST | `/api/cart/add` | Add item to cart |
| POST | `/api/cart/update` | Update quantity |
| POST | `/api/cart/remove` | Remove item |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/checkout` | Checkout page |
| POST | `/checkout/place-order` | Place order |
| GET | `/order-success/:id` | Order success page |
| GET | `/api/orders` | Get user orders |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/admin/login` | Admin login |
| GET | `/admin/dashboard` | Dashboard |
| GET | `/admin/products` | Products list |
| GET/POST | `/admin/products/add` | Add product |
| GET/POST | `/admin/products/edit/:id` | Edit product |
| POST | `/admin/products/delete/:id` | Delete product |
| GET | `/admin/orders` | Orders list |
| GET | `/admin/orders/:id` | Order details |
| POST | `/admin/orders/:id/status` | Update status |
| POST | `/admin/orders/:id/delete` | Delete order |
| GET | `/admin/users` | Users list |
| POST | `/admin/users/:id/delete` | Delete user |

---

## 🔄 Data Migration from MySQL

If migrating data from the old PHP/MySQL project:

```bash
# 1. Export MySQL data to JSON
# Run this in MySQL/phpMyAdmin or use a migration tool

# 2. Use this Node.js migration script pattern:
node -e "
const mongoose = require('mongoose');
const Product = require('./models/Product');
// ... connect and insert your MySQL data
"
```

### Schema Mapping

| MySQL Table | MongoDB Model | Notes |
|-------------|---------------|-------|
| `users` | `User` | Add bcrypt re-hash if needed |
| `admins` | `Admin` | Hardcoded → DB-backed |
| `products` | `Product` | Same fields |
| `cart` | `Cart` | Embedded items (1 doc per user) |
| `orders` + `order_items` + `checkout` | `Order` | All merged into 1 embedded doc |

---

## ✅ Feature Parity Checklist

- [x] User Registration with validation
- [x] User Login/Logout (session-based, 30min timeout)
- [x] Forgot Password / Reset Password (token-based)
- [x] Homepage with products by category
- [x] Shop page with category filter
- [x] Single product detail page
- [x] Add to Cart (AJAX, no page reload)
- [x] Cart View (dynamic load)
- [x] Update cart quantities
- [x] Remove cart items
- [x] Checkout with delivery info
- [x] Place order
- [x] Order success confirmation
- [x] Order History on profile
- [x] User Profile page
- [x] All 5 categories: Men Clothing, Women Clothing, Footwear, Glasses, Cosmetics
- [x] Admin Login (DB-backed, bcrypt)
- [x] Admin Dashboard (stats + recent orders + product list)
- [x] Add Product (with image upload via multer)
- [x] Edit Product (with optional image replacement)
- [x] Delete Product (removes file from disk)
- [x] Orders Management (list + details)
- [x] Update Order Status (Pending → Processing → Shipped → Delivered → Cancelled)
- [x] Delete Order
- [x] User Management (list + delete)
- [x] Session-based auth with MongoStore
- [x] Bcrypt password hashing
- [x] Flash messages
- [x] Helmet security headers
- [x] Responsive design
- [x] Toast notifications
- [x] Mobile navigation

---

## 🛡️ Security Features

- **Bcrypt**: Passwords hashed with 10 salt rounds
- **Helmet.js**: HTTP security headers
- **express-session**: Session-based auth stored in MongoDB
- **Session timeout**: 30 minutes (configurable via `SESSION_MAX_AGE`)
- **Input validation**: Server-side validation in controllers
- **File upload**: Type filtering (images only) + 5MB size limit
- **SQL injection**: N/A (MongoDB + Mongoose handles this)
- **Route protection**: Middleware guards on all protected routes
- **Admin separation**: Separate Admin model + session namespace

---

*EcomSphere JavaScript Edition v2.0.0 — March 2026*
