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
 * Analyzes a product image using Gemini 1.5 Flash
 * @param {Buffer} imageBuffer - The image file buffer
 * @param {string} mimeType - The mime type of the image (e.g., 'image/jpeg')
 * @returns {Promise<Object>} - The analyzed product data
 */
async function analyzeProductImage(imageBuffer, mimeType) {
  try {
    console.log(`[AI DIAGNOSTIC] Starting analysis of image (${mimeType}, size: ${imageBuffer.length} bytes)`);
    console.log(`[AI DIAGNOSTIC] Using Model: gemini-2.0-flash`);
    
    // For images, the 1.5 Flash model is fast and efficient
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Analyze this product image and provide details for an e-commerce listing in STRICT JSON.
      {
        "name": "Product Name",
        "description": "2-3 sentence description.",
        "price": 999,
        "category": "One of: Men Clothing, Women Clothing, Footwear, Glasses, Cosmetics",
        "brand": "Brand",
        "countInStock": 10
      }
    `;

    console.log(`[AI DIAGNOSTIC] Sending request to Google...`);
    const startTime = Date.now();
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    console.log(`[AI DIAGNOSTIC] Received response in ${Date.now() - startTime}ms`);
    
    // Better cleaning: find the first { and last }
    let jsonString = text.trim();
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }
    
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON. RAW TEXT:', text);
      throw new Error(`AI returned an invalid format: ${text.substring(0, 50)}...`);
    }
  } catch (error) {
    if (error.message.includes('429')) {
      console.error('Gemini Rate Limit Hit (429). Please wait 1 minute.');
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    console.error('--- Gemini Technical Error Details ---');
    console.error('Message:', error.message);
    if (error.status) console.error('Status:', error.status);
    console.error('-------------------------------------');
    throw new Error(`AI was unable to process this image: ${error.message.substring(0, 50)}...`);
  }
}

module.exports = {
  analyzeProductImage,
  VALID_CATEGORIES
};
