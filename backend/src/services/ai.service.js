const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize the Google Generative AI with your API key
if (!process.env.GEMINI_API_KEY) {
  console.error('CRITICAL: GEMINI_API_KEY is not defined in .env file');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIza_dummy_key_to_prevent_crash');

/**
 * Valid categories based on the Product model enum
 */
const VALID_CATEGORIES = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'];

/**
 * Analyzes a product image using Gemini 2.0 Flash
 * @param {Buffer} imageBuffer - The image file buffer
 * @param {string} mimeType - The mime type of the image (e.g., 'image/jpeg')
 * @returns {Promise<Object>} - The analyzed product data
 */
async function analyzeProductImage(imageBuffer, mimeType) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 12000; // 12 seconds for rate limit backoff
  let lastError = null;

  try {
    console.log(`[AI DIAGNOSTIC] Starting analysis of image (${mimeType}, size: ${imageBuffer.length} bytes)`);
    console.log(`[AI DIAGNOSTIC] Using Model: gemini-flash-latest`);

    // For images, the flash model is fast and efficient
    // Defaulting to gemini-flash-latest to bypass aggressive 2.0 load API rate limits
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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
          prompt,
          {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType
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