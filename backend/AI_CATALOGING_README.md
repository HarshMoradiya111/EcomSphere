# EcomSphere AI Product Auto-Cataloging Engine

This document explains the architecture and functionality behind the **EcomSphere AI Product Auto-Cataloging System**. This feature allows admins to perform a bulk upload of product images, and automatically generates robust product listings using Google\'s Gemini AI pipeline.

---

## 🚀 How it Works (The Workflow)

1. **Image Upload:** The store administrator uploads multiple product image files via the EcomSphere Admin Dashboard `(/admin/products/ai)`.
2. **Sequential Batching:** The backend receives the batch of images. To strictly adhere to Google Gemini\'s free-tier rate limits (15 Requests Per Minute), the server orchestrates a delayed, sequential processing queue waiting precisely 4.5 seconds between each image analysis.
3. **AI Vision Analysis:** 
    - Each image buffer is securely sent to the **Google Gemini 2.0 Flash Vision** model. 
    - The model analyzes the visual features of the product and extracts catalog points like Name, Description, Pricing, Brand, and Stock count.
4. **Auto-Retry Resiliency:** If Google\'s servers are experiencing temporary high loads (`503 status`) or if rate limits trigger (`429 status`), the AI service halts execution for 10 seconds and automatically retries analyzing the image up to 3 times before failing safely.
5. **JSON Structuring:** The AI generates a sanitized and highly structured `STRICT JSON` format payload containing the newly cataloged data.
6. **Review Phase:** The admin receives the mapped AI data and cross-reviews the details on an interactive UI screen before permanently saving them to the MongoDB cluster.

---

## 📂 Code Architecture & File Paths

The AI functionality is primarily divided into a dedicated AI interaction Service and an Admin application Controller:

### \`1. The AI Interaction Core\`
**File Path:** [\`backend/src/services/ai.service.js\`](./src/services/ai.service.js)

This file acts as the raw interface connecting the Node.js backend to Google\'s `generativelanguage.googleapis.com` infrastructure.
*   **Key Responsibilities:**
    *   Initializes the `@google/generative-ai` SDK securely using `process.env.GEMINI_API_KEY`.
    *   Defines the `analyzeProductImage(imageBuffer, mimeType)` method.
    *   Constructs the prompt engineering required so that the model returns predictable, parseable JSON rather than raw text.
    *   Implements the 3-attempt automated retry block whenever `429 Rate Limit` or `503 Service Unavailable` API network errors are caught.

### \`2. The Request Orchestrator & Error Handler\`
**File Path:** [\`backend/src/controllers/admin.controller.js\`](./src/controllers/admin.controller.js)

This controller governs the UI interaction flow and throttles the performance so you don't over-flood the AI endpoints.
*   **Key Responsibilities:**
    *   Handles the `postAIUpload` logic.
    *   Maps through `req.files` natively by introducing a `for` loop combined with a promise `setTimeout()` sleep timer logic (4500ms delay per upload).
    *   Aggregates the metadata returned from `aiService.analyzeProductImage` alongside the original images seamlessly.
    *   Appends explicit error messaging logs (e.g., `Failed to analyze 6644.jpg: Rate limit exceeded`) back to the frontend loop if an image completely fails despite retries.

### \`3. Diagnostics Setup\`
**File Path:** [\`backend/debug_ai.js\`](./debug_ai.js)

A standalone terminal test file injected for verifying API key legitimacy, connectivity, and model availability. Running \`node debug_ai.js\` explicitly tests connection timeouts directly from the CLI without needing to open the web GUI interface.

---

## 🛠 Model Context Configured
*   **Active Runtime:** `@google/generative-ai` (Gemini SDK)
*   **Model Initialized:** `gemini-2.0-flash`
*   **Throttling:** Max 15 Requests Per Minute (RPM) regulated seamlessly via 4.5s delays + 10s backoff buffers.
