<div align="center">

# 🌐 EcomSphere

### *Production-Ready E-Commerce Platform with Advanced Analytics*

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**[Live Demo](#) • [Documentation](#-project-structure) • [Features](#-standout-features) • [Quick Start](#-quick-start)**

---

</div>

## 🎯 What Makes EcomSphere Different?

Not just another e-commerce clone. EcomSphere combines enterprise-grade features with developer-friendly architecture:

- **🧠 Smart Analytics** – Customer segmentation, behavioral tracking, revenue forecasting
- **⚡ Real-Time Everything** – Live inventory alerts, instant search, AJAX cart operations
- **🔐 Production Security** – OAuth 2.0, bcrypt hashing, Helmet.js protection, session management
- **📊 Business Intelligence** – Interactive charts, low-stock automation, flash sale timers
- **🎨 Premium UI/UX** – Glassmorphism design, toast notifications, smooth animations

Built for developers who want to understand **real-world e-commerce architecture**, not just tutorial basics.

---

## 🚀 Quick Start

```bash
# 1. Clone & Install
git clone https://github.com/HarshMoradiya111/EcomSphere.git
cd EcomSphere
npm install

# 2. Configure Environment
cp .env.example .env
# Edit .env with your MongoDB URI (local or Atlas)

# 3. Seed Database (includes demo products + admin account)
npm run seed

# 4. Launch Application
npm run dev

# 5. Access Application
# 👤 Customer Portal: http://localhost:3000
# 🔧 Admin Dashboard: http://localhost:3000/admin/login
```

**Demo Credentials:**
- Admin: `admin` / `admin123`
- Test User: `harshmoradiya@gmail.com` / `test1234`

---

## ✨ Standout Features

### 💎 Customer Experience
| Feature | Technology | Impact |
|---------|-----------|--------|
| **Google OAuth Login** | Passport.js | One-click authentication |
| **Live Search** | AJAX + Debouncing | Instant product discovery |
| **Product Comparison** | LocalStorage | Side-by-side feature analysis |
| **Loyalty System** | MongoDB Aggregation | Points earn/redeem on orders |
| **Wishlist** | Session-based persistence | Save favorites across devices |
| **Smart Checkout** | Multi-step validation | Reduced cart abandonment |

### 🛡️ Admin Control Panel
| Feature | Technology | Impact |
|---------|-----------|--------|
| **Behavioral Analytics** | Custom segmentation engine | Auto-group customers (Big Spenders, Regulars, At-Risk) |
| **Inventory Automation** | Real-time threshold tracking | Low stock alerts + inline editing |
| **Marketing Suite** | Campaign management system | Banners, flash sales, coupon codes |
| **Order Pipeline** | 5-state workflow | Pending → Processing → Shipped → Delivered → Cancelled |
| **Revenue Charts** | Chart.js integration | Visual sales trends |
| **Help Center CMS** | FAQ CRUD interface | Customer support management |

---

## 🏗️ Architecture Highlights

### Clean MVC Pattern
```
├── models/          → Mongoose schemas (User, Product, Order, Cart)
├── controllers/     → Business logic (auth, cart, checkout, admin)
├── routes/          → Express routing + middleware
├── views/           → EJS templates (customer + admin panels)
├── middleware/      → Auth guards, validation, file uploads
└── public/          → Static assets + uploaded images
```

### Advanced Schema Design
- **Embedded Documents** – Cart items stored in single user doc (no N+1 queries)
- **Token-Based Auth** – Password reset via crypto tokens + email
- **Session Management** – MongoStore for distributed sessions
- **File Handling** – Multer for product image uploads with validation

### Security Layers
1. **Helmet.js** – HTTP header hardening
2. **Bcrypt** – Salted password hashing (10 rounds)
3. **CSRF Protection** – Session-based tokens
4. **Input Sanitization** – XSS prevention on all forms
5. **Rate Limiting** – Prevent brute-force attacks (optional)

---

## 📦 Tech Stack Deep Dive

### Backend
- **Runtime:** Node.js 20.x (ESM modules)
- **Framework:** Express.js 4.x (RESTful API + SSR)
- **Database:** MongoDB 6.x (NoSQL with Mongoose ODM)
- **Auth:** Passport.js (Local + Google OAuth 2.0)
- **Sessions:** express-session + connect-mongo
- **Email:** Nodemailer (password reset, order confirmations)
- **File Upload:** Multer (multipart/form-data handling)

### Frontend
- **Template Engine:** EJS (server-side rendering)
- **Styling:** Vanilla CSS (custom design system)
- **Interactivity:** Vanilla JS (no framework bloat)
- **AJAX:** Fetch API (cart operations, live search)
- **Animations:** CSS transitions + keyframes

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (automated testing)
- **Environment:** dotenv (config management)
- **Logging:** Morgan (HTTP request logs)

---

## 🗂️ Project Structure

<details>
<summary><b>Click to expand full directory tree</b></summary>

```
EcomSphere/
│
├── server.js                 # Express app entry point
├── package.json              # Dependencies + scripts
├── .env.example              # Environment template
├── Dockerfile                # Container configuration
├── docker-compose.yml        # Multi-container setup
│
├── config/
│   └── db.js                 # MongoDB connection logic
│
├── middleware/
│   └── auth.js               # Session guards (isAuth, isAdmin)
│
├── models/
│   ├── User.js               # User schema + loyalty points
│   ├── Admin.js              # Admin schema + bcrypt methods
│   ├── Product.js            # Product schema (5 categories, ratings)
│   ├── Cart.js               # Cart with embedded items
│   ├── Order.js              # Order + checkout info (embedded)
│   ├── FAQ.js                # FAQ for help center
│   ├── Coupon.js             # Discount management
│   ├── Marketing.js          # Banners + flash sales
│   └── Subscriber.js         # Newsletter emails
│
├── controllers/
│   ├── authController.js     # Login, register, password reset
│   ├── productController.js  # Homepage, shop, product detail
│   ├── cartController.js     # CRUD operations for cart
│   ├── orderController.js    # Checkout + order placement
│   └── adminController.js    # Admin panel CRUD
│
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   └── adminRoutes.js        # Multer file upload integration
│
├── views/                    # EJS templates
│   ├── index.ejs             # Homepage
│   ├── shop.ejs              # Product catalog
│   ├── sproduct.ejs          # Product detail
│   ├── cart.ejs              # Shopping cart
│   ├── checkout.ejs          # Checkout form
│   ├── profile.ejs           # User dashboard
│   ├── login.ejs             # Auth pages
│   ├── partials/
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   └── flash.ejs         # Toast notifications
│   └── admin/
│       ├── dashboard.ejs     # Analytics + charts
│       ├── products.ejs      # Product management
│       ├── inventory.ejs     # Stock control
│       ├── orders.ejs        # Order pipeline
│       ├── customer_segments.ejs  # Behavioral analytics
│       ├── marketing.ejs     # Campaign management
│       └── faqs.ejs          # Help center CRUD
│
├── public/
│   ├── css/
│   │   ├── style.css         # Main stylesheet
│   │   ├── auth.css          # Login/register animations
│   │   └── admin.css         # Dark admin theme
│   ├── js/
│   │   ├── script.js         # Global JS (cart, nav)
│   │   ├── cart.js           # Cart page logic
│   │   └── admin.js          # Admin panel interactions
│   ├── img/                  # Static images
│   └── uploads/              # Product images (user-uploaded)
│
└── utils/
    └── seed.js               # Database seeder script
```

</details>

---

## 📚 API Reference

### Authentication Endpoints
```http
POST   /auth/register          # User signup
POST   /auth/login             # User signin
GET    /auth/logout            # Session destroy
POST   /auth/forgot-password   # Request reset token
POST   /auth/reset-password/:token  # Update password
```

### Shopping Endpoints
```http
GET    /                       # Homepage (requires auth)
GET    /shop?category=...      # Product catalog (filterable)
GET    /product/:id            # Product detail page
GET    /profile                # User dashboard + order history
```

### Cart API (AJAX)
```http
GET    /api/cart               # Fetch cart items
POST   /api/cart/add           # Add item
POST   /api/cart/update        # Update quantity
POST   /api/cart/remove        # Remove item
```

### Checkout Flow
```http
GET    /checkout               # Checkout form
POST   /checkout/place-order   # Create order
GET    /order-success/:id      # Confirmation page
```

### Admin Panel
```http
POST   /admin/login            # Admin auth
GET    /admin/dashboard        # Analytics overview
GET    /admin/products         # Product CRUD
POST   /admin/products/add     # Upload new product (multipart)
PUT    /admin/orders/:id/status # Update order state
GET    /admin/inventory        # Low stock alerts
GET    /admin/customers/segments # Behavioral analytics
POST   /admin/marketing        # Campaign management
```

---

## 🎨 Design System

### Color Palette
```css
--primary: #007bff;      /* Brand blue */
--success: #28a745;      /* Positive actions */
--danger: #dc3545;       /* Destructive actions */
--dark: #343a40;         /* Admin theme */
```

### Typography
- **Headings:** System font stack (native performance)
- **Body:** -apple-system, BlinkMacSystemFont, Segoe UI
- **Mono:** JetBrains Mono (admin panel)

### Components
- **Glassmorphism cards** – Backdrop-filter blur effects
- **Toast notifications** – Non-blocking feedback
- **Skeleton loaders** – Perceived performance boost

---

## 🔧 Configuration

### Environment Variables
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ecomsphere
# or Atlas: mongodb+srv://user:pass@cluster.mongodb.net/ecomsphere

# Session Secret (generate random string)
SESSION_SECRET=your_super_secret_key_here

# Email Service (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Server Config
PORT=3000
NODE_ENV=development
```

### Scripts
```json
"dev": "nodemon server.js",           // Hot reload dev server
"start": "node server.js",            // Production server
"seed": "node utils/seed.js",         // Populate database
"seed:admin": "node seed-admin.js",   // Create admin only
"seed:faqs": "node seed_faqs.js"      // Populate help center
```

---

## 🐳 Docker Deployment

### Quick Start with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Docker Compose Services
- **app** – Node.js application (port 3000)
- **mongo** – MongoDB instance (port 27017)
- **mongo-express** – Web UI for MongoDB (port 8081)

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] User registration + email validation
- [ ] Login with credentials + OAuth
- [ ] Add to cart (AJAX, no reload)
- [ ] Update cart quantities
- [ ] Checkout with delivery details
- [ ] Order confirmation email
- [ ] Admin product CRUD
- [ ] Low stock alerts trigger
- [ ] Customer segmentation accuracy
- [ ] Flash sale timer countdown
- [ ] Search autocomplete
- [ ] Mobile responsive design

### Automated Testing (Planned)
- **Unit Tests:** Jest + Supertest (controllers, models)
- **Integration Tests:** API endpoint coverage
- **E2E Tests:** Playwright (user journeys)

---

## 📈 Performance Metrics

### Target Benchmarks
- **Page Load:** <2s on 3G
- **Cart Operations:** <200ms response time
- **Search Latency:** <100ms (debounced)
- **Admin Dashboard:** <1s chart render
- **Image Optimization:** WebP conversion, lazy loading

### Database Optimization
- Indexed fields: `email`, `category`, `createdAt`
- Aggregation pipelines for analytics
- Embedded docs reduce join overhead

---

## 🛣️ Roadmap

### v3.1.0 (Q2 2026)
- [ ] **Payment Gateway** – Stripe/Razorpay integration
- [ ] **Order Tracking** – Real-time shipment status
- [ ] **Product Reviews** – Star ratings + comments
- [ ] **Recommendation Engine** – ML-based suggestions

### v3.2.0 (Q3 2026)
- [ ] **Multi-Vendor Support** – Marketplace mode
- [ ] **Advanced Analytics** – Cohort analysis, LTV
- [ ] **Mobile App** – React Native companion
- [ ] **Internationalization** – Multi-language support

### v4.0.0 (Future)
- [ ] **Microservices Migration** – Service-oriented architecture
- [ ] **GraphQL API** – Alternative to REST
- [ ] **Redis Caching** – Session + query caching
- [ ] **Elasticsearch** – Advanced product search

---

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** Pull Request

### Code Standards
- ES6+ JavaScript (use `const`/`let`, arrow functions)
- 2-space indentation
- Meaningful variable names
- Comment complex logic
- Follow existing file structure

---

## 📄 License

This project is **open-source** under the MIT License. See [LICENSE](LICENSE) file for details.

**TL;DR:** You can use, modify, and distribute this code freely. Attribution appreciated but not required.

---

## 🙏 Acknowledgments

### Built With
- [Express.js](https://expressjs.com/) – Fast, unopinionated web framework
- [MongoDB](https://www.mongodb.com/) – Flexible NoSQL database
- [EJS](https://ejs.co/) – Embedded JavaScript templating
- [Passport.js](https://www.passportjs.org/) – Authentication middleware
- [Chart.js](https://www.chartjs.org/) – Simple yet flexible charting

### Inspired By
- Real-world e-commerce platforms (Amazon, Shopify)
- Modern SaaS admin dashboards
- Enterprise CRM systems

---

## 📞 Contact & Support

**Developer:** Harsh Moradiya  
**GitHub:** [@HarshMoradiya111](https://github.com/HarshMoradiya111)  
**LinkedIn:** [harshkumar-moradiya](https://linkedin.com/in/harshkumar-moradiya-802ba9226)

### Get Help
- 🐛 **Bug Reports:** [Open an issue](https://github.com/HarshMoradiya111/EcomSphere/issues)
- 💡 **Feature Requests:** [Start a discussion](https://github.com/HarshMoradiya111/EcomSphere/discussions)
- 📧 **Direct Contact:** harshmoradiya@gmail.com

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

**Made with ❤️ by developers, for developers**

</div>