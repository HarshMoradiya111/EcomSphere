# 🌟 EcomSphere: Enterprise Full-Stack Ecosystem

**EcomSphere** is a sophisticated, multi-application e-commerce platform designed for massive scale and high-performance retail operations. It features a unique **Dual-Engine Architecture**, leveraging a robust, tested **Express + EJS Production System** alongside a cutting-edge **Next.js Future Storefront**.

---

## 🏗️ Architectural Vision: Dual-Engine Monorepo

EcomSphere operates as a professional Monorepo, separating concerns between its stable production engine and its future-facing technologies:

*   **🟢 Backend (Current Production Engine)**: A logic-heavy Node.js server that manages the database, security, and renders the primary storefront and Admin Dashboard using **EJS Templates**.
*   **🔵 Web-Next (Future Storefront Migration)**: A modern, decoupled React application built on **Next.js 16**, designed to eventually transition the ecosystem into a fully headless architecture.

---

## 🚀 Core Functionalities (Production Ready)

### 🛍️ 1. Advanced Product Discovery
*   **Live Search & Autocomplete**: Real-time algorithm predicting products based on user keystrokes.
*   **Variant Architecture**: Precision inventory binding for Sizes (S/M/L) and Colors.
*   **Smart Recommendations**: "You May Also Like" cross-sell engine.
*   **Wishlist Cloud Sync**: AJAX-driven asynchronous curation of user-favorite products.
*   **Rating & Feedback Ecosystem**: Verified-buyer reviews with mathematically generated star metrics.

### 💳 2. Dynamic Checkout & Payments
*   **Razorpay Integration**: Robust SDK supporting UPI, Netbanking, and Cards with live test-mode toggles.
*   **Cash On Delivery (COD)**: Secure hybrid fallback for frictionless order generation.
*   **Dynamic Shipping Engine**: Region-based shipping (Local vs. National) with free shipping thresholds.
*   **GST/VAT Logic**: Automatic backend computation of taxable amounts.
*   **Coupon Engine**: Admin-minted flat or percentage-based discount mechanisms.

### 📊 3. Logistics & Customer Trust
*   **Automated PDF Invoices**: Ledger-compliant invoices generated via `pdfkit` post-checkout.
*   **Visual Order Tracking**: Interactive GUI timeline showing status from `Pending` to `Delivered`.
*   **Loyalty Points System**: Earn 1 pt per ₹50 spent, redeemable as cash value on future orders.
*   **Transactional Emails**: Automated HTML receipt blasting via Nodemailer (SMTP).

### 🔐 4. Enterprise Security & Administration
*   **Google OAuth 2.0**: 1-Click social sign-on via Passport.js.
*   **Admin Fleet Dashboard**: Graphical tracking of Revenue, Stock Levels, and Order Velocity.
*   **Zero-Trust Hardening**: Hardened with Helmet, XSS-Clean, and NoSQL Injection prevention.
*   **Address Vault**: Intelligent saved address manager for default local/national shipping.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Runtime** | Node.js (v20+) |
| **Server Framework** | Express.js |
| **Primary UI Engine** | EJS (Embedded JavaScript Templates) |
| **Future UI Engine** | Next.js 16 + Tailwind CSS |
| **Database** | MongoDB Atlas (Multi-Shard Cluster) |
| **Authentication** | Passport.js (JWT & Session) |
| **Payments** | Razorpay SDK |
| **Mailing** | Nodemailer (G-Suite Integrated) |

---

## 📈 Future Scope: Phase 2.0 Roadmap

We are building the future of e-commerce. Upcoming modules in **web-next/** include:

*   **🛒 Multiplayer Shopping**: Real-time shared carts via WebSockets for collaborative friend-shopping.
*   **🔥 Swipe Discovery (Tinder UI)**: Full-screen mobile swiping for personalized product discovery.
*   **🤖 AI Personal Shopper**: LLM-integrated bot that queries the MongoDB cluster based on conversational prompts.
*   **⚡ Surge Pricing Engine**: Uber-style dynamic pricing driven by real-time demand metrics.
*   **🕶️ WebXR Virtual Wardrobe**: Try-on product image overlays using machine learning fitting pipelines.

---

## ⚙️ Installation & Setup

1.  **Clone & Install Dependencies**:
    ```bash
    git clone https://github.com/YourRepo/EcomSphere.git
    cd EcomSphere
    npm run install:all
    ```

2.  **Configure Environment**:
    Create `.env` in the `backend/` folder following `.env.example`.

3.  **Start Development Servers**:
    ```bash
    npm run dev
    ```
    *   **Live Production Shop**: `http://localhost:3000`
    *   **Admin Dashboard**: `http://localhost:3000/admin`
    *   **Next.js (In Development)**: `http://localhost:3001`

---

## 📚 Technical Documentation
*   [Technical Architecture Guide](docs/ARCHITECTURE.md)
*   [Full Feature Breakdown](docs/FEATURES.md)
*   [Scaling Roadmap](docs/ENTERPRISE_SCALING_ROADMAP.md)

---
*Developed by the EcomSphere Engineering Team. Dedicated to high-performance retail.*
