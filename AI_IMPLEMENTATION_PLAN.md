# AI Vision Auto-Cataloging Implementation Plan

This plan outlines the steps to add an AI-powered product cataloging feature to **EcomSphere** using the **Google Gemini Pro Vision** (or 1.5 Flash) API.

---

## 📅 PHASE 1: Setup & API Configuration
- [x] **1.1: Install Dependencies**
  - Install `@google/generative-ai` in the `backend/` directory.
- [x] **1.2: Environment Setup**
  - Add `GEMINI_API_KEY` to `.env`.
  - Update `.env.example` with the new key placeholder.
- [x] **1.3: API Utility Service**
  - Create `backend/src/services/ai.service.js`.
  - Implement a function `analyzeProductImage(imageBuffer)` that returns a structured JSON object.

---

## ⚙️ PHASE 2: Backend Infrastructure
- [x] **2.1: Multer Configuration**
  - Ensure `multer` is configured to handle multiple files in the new route.
- [x] **2.2: AI Controller Logic**
  - Create `getAIUpload` (render page) and `postAIUpload` (process images) in `admin.controller.js`.
  - Implement logic to loop through uploaded images and call the AI service.
- [x] **2.3: Admin Routes**
  - Register `GET /admin/products/ai` and `POST /admin/products/ai` in `admin.routes.js`.

---

## 🖥️ PHASE 3: Admin Interface (UI)
- [x] **3.1: AI Upload Template**
  - Create `backend/views/admin/ai_upload.ejs`.
  - Design a premium "Drag & Drop" interface with a preview section for multiple images.
- [x] **3.2: AI Processing UI**
  - Add a "Processing" overlay to show progress while the AI "looks" at the images.
- [x] **3.3: AI Review Table**
  - After analysis, show a table where the user can:
    - Edit the generated Name, Price, and Description.
    - Confirm or change the Category.
  - Final "Save All" button to commit to MongoDB.

---

## 🧪 PHASE 4: Testing & Hardening
- [x] **4.1: Prompt Tuning**
  - Refine the AI prompt to ensure it accurately picks from existing categories: `Men Clothing`, `Women Clothing`, `Footwear`, `Glasses`, `Cosmetics`.
- [x] **4.2: Error Handling**
  - Add logic to handle cases where the AI cannot recognize the product or the API is unavailable.
- [x] **4.3: Cache Invalidation**
  - Ensure the system clears the `home_products` cache after saving AI-generated products.

---

## 🚀 PHASE 5: Delivery
- [x] **5.1: Final Cleanup**
  - Remove any debug logs.
  - Test the full "Upload -> Analyze -> Review -> Save" flow.
- [x] **5.2: Documentation Update**
  - Document the feature in the main `README.md`.

---

> [!CAUTION]
> **PRE-REQUISITE:** You must provide a **Gemini API Key** from [aistudio.google.com](https://aistudio.google.com/) before starting Phase 1.
