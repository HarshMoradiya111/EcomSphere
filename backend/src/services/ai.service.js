const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

console.log('-------------------------------------------');
console.log('🤖 [AI SERVICE] INITIALIZING VERSION 4.0 (FORCED V1)');
console.log('-------------------------------------------');

if (!process.env.GEMINI_API_KEY) {
  console.error('CRITICAL: GEMINI_API_KEY is not defined in .env file');
} else {
  console.log(`[AI DIAGNOSTIC] API Key loaded: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIza_dummy_key_to_prevent_crash');

/**
 * Valid categories based on the Product model enum
 */
const VALID_CATEGORIES = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'];

const axios = require('axios');
const fs = require('fs');

/**
 * Analyzes a product image using Gemini 2.0 Flash
 * @param {string|Buffer} imageInput - The image URL, local path, or Buffer
 * @param {string} mimeType - The mime type of the image
 * @returns {Promise<Object>} - The analyzed product data
 */
async function analyzeProductImage(imageInput, mimeType) {
  const MAX_RETRIES = 4;
  const RETRY_DELAY_MS = 30000;
  let lastError = null;
  let imageBuffer;

  try {
    // 1. Resolve image to a Buffer
    if (Buffer.isBuffer(imageInput)) {
      imageBuffer = imageInput;
    } else if (typeof imageInput === 'string') {
      if (imageInput.startsWith('http')) {
        console.log(`[AI DIAGNOSTIC] Fetching image from URL: ${imageInput}`);
        const response = await axios.get(imageInput, { 
          responseType: 'arraybuffer',
          timeout: 10000 // 10 second timeout for fetch
        });
        console.log(`[AI DIAGNOSTIC] Fetch status: ${response.status}`);
        imageBuffer = Buffer.from(response.data);
      } else {
        console.log(`[AI DIAGNOSTIC] Reading image from local path: ${imageInput}`);
        imageBuffer = fs.readFileSync(imageInput);
      }
    } else {
      throw new Error('Invalid image input type. Expected Buffer, URL string, or path string.');
    }

    // 2. Normalize mimeType (Gemini is strict)
    let normalizedMimeType = mimeType;
    if (normalizedMimeType === 'image/jpg') normalizedMimeType = 'image/jpeg';

    // For images, the flash model is fast and efficient
    const modelName = "gemini-2.0-flash";
    console.log(`[AI DIAGNOSTIC] Starting analysis of image (${normalizedMimeType}, size: ${imageBuffer.length} bytes)`);
    console.log(`[AI DIAGNOSTIC] Using Model: ${modelName}`);
    console.log(`[AI DIAGNOSTIC] Creating model instance for: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

    // DIAGNOSTIC: List models if we get a 404 (optional, but helpful for debugging)
    // We'll keep this as a note for now and just try a safer model name if it fails

    const prompt = `
      Analyze this product image and provide details for an e-commerce listing in STRICT JSON.
      Return ONLY valid JSON with no markdown, no backticks, no explanations:
      {
        "name": "Product Name",
        "description": "2-3 sentence description.",
        "price": 999,
        "category": "One of: Men Clothing, Women Clothing, Footwear, Glasses, Cosmetics",
        "brand": "Brand",
        "countInStock": 10
      }
    `;

    // ✅ FIXED: Proper retry loop that handles ALL errors correctly
    let result = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[AI DIAGNOSTIC] Attempt ${attempt}/${MAX_RETRIES} - Sending request to Google...`);
        const startTime = Date.now();

        result = await model.generateContent([
          { text: prompt },
          {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: normalizedMimeType
            }
          }
        ]);

        console.log(`[AI DIAGNOSTIC] ✓ Received response in ${Date.now() - startTime}ms`);
        break; // Success! Exit retry loop

      } catch (apiError) {
        lastError = apiError;
        const errorMsg = apiError.message || String(apiError);

        console.error(`[AI DIAGNOSTIC] Attempt ${attempt} failed:`, errorMsg);

        // Check if this is a retryable error (rate limit or server overload)
        const isRateLimit = errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate limit');
        const isServerError = errorMsg.includes('503') || errorMsg.includes('500');
        const isRetryable = isRateLimit || isServerError;

        if (isRetryable && attempt < MAX_RETRIES) {
          console.log(`[AI DIAGNOSTIC] Retryable error detected. Waiting ${RETRY_DELAY_MS / 1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          continue; // Try again
        } else {
          // Non-retryable error OR final attempt failed
          throw apiError;
        }
      }
    }

    // ✅ FIXED: Validate that we actually got a result
    if (!result) {
      throw new Error('Failed to get response from Gemini API after all retry attempts');
    }

    const response = await result.response;
    const text = response.text();

    console.log(`[AI DIAGNOSTIC] Raw response preview: ${text.substring(0, 100)}...`);

    // ✅ IMPROVED: Better JSON extraction
    let jsonString = text.trim();

    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Find the first { and last }
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('AI response does not contain valid JSON structure');
    }

    jsonString = jsonString.substring(firstBrace, lastBrace + 1);

    // ✅ FIXED: Better error messages for JSON parsing
    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('[AI DIAGNOSTIC] Failed to parse JSON. Raw text:', text);
      console.error('[AI DIAGNOSTIC] Extracted JSON string:', jsonString);
      throw new Error(`AI returned unparseable JSON. Preview: ${text.substring(0, 100)}...`);
    }

    // ✅ ADDED: Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !parsedData[field]);

    if (missingFields.length > 0) {
      throw new Error(`AI response missing required fields: ${missingFields.join(', ')}`);
    }

    console.log(`[AI DIAGNOSTIC] ✓ Successfully parsed product: ${parsedData.name}`);
    return parsedData;

  } catch (error) {
    // ✅ IMPROVED: Better error categorization and messages
    const errorMsg = error.message || String(error);

    if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate limit')) {
      console.error('[AI ERROR] Rate Limit Exceeded (429)');
      throw new Error('Rate limit exceeded. Please wait 1-2 minutes before trying again. Consider increasing delays between uploads.');
    }

    if (errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.toLowerCase().includes('api key')) {
      console.error('[AI ERROR] Authentication Failed - Check your API key');
      throw new Error('Invalid or missing API key. Please check your GEMINI_API_KEY in .env file.');
    }

    if (errorMsg.includes('503') || errorMsg.includes('500')) {
      console.error('[AI ERROR] Google Server Error');
      throw new Error('Google AI service temporarily unavailable. Please try again in a few minutes.');
    }

    // Log full error details for debugging
    console.error('--- Gemini Error Details ---');
    console.error('Message:', errorMsg);
    console.error('Stack:', error.stack);
    console.error('----------------------------');

    throw new Error(`Failed to analyze image: ${errorMsg.substring(0, 150)}`);
  }
}

module.exports = {
  analyzeProductImage,
  VALID_CATEGORIES
};