const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    // For images, the 1.5 Flash model is fast and efficient
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert e-commerce catalog manager. Analyze this product image and provide details for a product listing.
      Return the response in a STRICT JSON format with the following structure:
      {
        "name": "Engaging Product Name",
        "description": "A professional 2-3 sentence marketing description highlighting key features.",
        "price": Suggested price in INR (number),
        "category": "Best fit category from our available list",
        "brand": "Suggested brand name or 'EcomSphere'",
        "countInStock": 20
      }

      CRITICAL RULES:
      1. The "category" field MUST be exactly one of these values: ${VALID_CATEGORIES.join(', ')}.
      2. If you are unsure, choose the closest match from the list above.
      3. The response must be ONLY the JSON object, no other text or explanation.
      4. Ensure the JSON is valid and can be parsed.
    `;

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
    
    // Clean the response text in case the model included markdown code blocks
    const jsonString = text.replace(/```json|```/g, '').trim();
    
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', text);
      throw new Error('AI returned an invalid format. Please try again.');
    }
  } catch (error) {
    console.error('Gemini Vision Error:', error);
    throw new Error('Failed to analyze image. Ensure your API key is valid.');
  }
}

module.exports = {
  analyzeProductImage,
  VALID_CATEGORIES
};
