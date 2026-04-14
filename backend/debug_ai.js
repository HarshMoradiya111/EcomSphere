// ✅ IMPROVED Diagnostic Script for Gemini API Testing
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, prefix, message) {
    console.log(`${color}${prefix}${colors.reset} ${message}`);
}

async function runDiagnostics() {
    console.log('\n' + '='.repeat(60));
    log(colors.cyan, '🔍', 'GEMINI API DIAGNOSTIC TEST');
    console.log('='.repeat(60) + '\n');

    // ✅ TEST 1: API Key Check
    log(colors.blue, '📋 TEST 1:', 'Checking API Key Configuration');
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        log(colors.red, '❌ FAILED:', 'GEMINI_API_KEY not found in .env file');
        console.log('\n💡 Solution: Add this line to your .env file:');
        console.log('   GEMINI_API_KEY=your_actual_api_key_here\n');
        return;
    }

    if (apiKey.includes('dummy') || apiKey.includes('test') || apiKey.length < 30) {
        log(colors.red, '❌ FAILED:', 'API Key appears to be invalid or placeholder');
        console.log(`   Current key: ${apiKey.substring(0, 10)}...`);
        console.log('\n💡 Solution: Replace with your actual Gemini API key from:');
        console.log('   https://aistudio.google.com/app/apikey\n');
        return;
    }

    log(colors.green, '✅ PASSED:', `API Key found (${apiKey.substring(0, 8)}...)`);

    // ✅ TEST 2: SDK Initialization
    log(colors.blue, '\n📋 TEST 2:', 'Initializing Gemini SDK');
    let genAI;
    try {
        genAI = new GoogleGenerativeAI(apiKey);
        log(colors.green, '✅ PASSED:', 'SDK initialized successfully');
    } catch (err) {
        log(colors.red, '❌ FAILED:', `SDK initialization error: ${err.message}`);
        return;
    }

    // ✅ TEST 3: Simple Text Generation (No Images)
    log(colors.blue, '\n📋 TEST 3:', 'Testing basic text generation');
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Say 'API works!' in exactly 3 words.");
        const response = await result.response;
        const text = response.text();
        log(colors.green, '✅ PASSED:', `Text generation works. Response: "${text.trim()}"`);
    } catch (err) {
        log(colors.red, '❌ FAILED:', `Text generation error: ${err.message}`);

        if (err.message.includes('429')) {
            console.log('\n💡 Rate Limit Hit - This is NORMAL if you just tested.');
            console.log('   Wait 60 seconds and try again.\n');
        } else if (err.message.includes('401') || err.message.includes('403')) {
            console.log('\n💡 Authentication Failed - Your API key is invalid.');
            console.log('   Get a new key from: https://aistudio.google.com/app/apikey\n');
        }
        return;
    }

    // ✅ TEST 4: Image Analysis (if images available)
    log(colors.blue, '\n📋 TEST 4:', 'Testing image analysis');

    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        log(colors.yellow, '⚠️  SKIPPED:', 'No uploads directory found');
        console.log('   Create ./public/uploads/ and add a test image to test vision.\n');
    } else {
        const files = fs.readdirSync(uploadsDir).filter(f =>
            f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg')
        );

        if (files.length === 0) {
            log(colors.yellow, '⚠️  SKIPPED:', 'No test images found in uploads/');
            console.log('   Add a product image to ./public/uploads/ to test vision.\n');
        } else {
            const testImage = path.join(uploadsDir, files[0]);
            log(colors.cyan, '   ℹ️', `Testing with: ${files[0]}`);

            try {
                const buffer = fs.readFileSync(testImage);
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

                const prompt = `Analyze this image and respond with ONLY this JSON structure (no markdown, no backticks):
{
  "name": "Product Name",
  "description": "Brief description",
  "price": 100,
  "category": "Men Clothing",
  "brand": "Brand Name",
  "countInStock": 10
}`;

                log(colors.cyan, '   ℹ️', 'Sending image to Gemini...');
                const startTime = Date.now();

                const result = await model.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: buffer.toString('base64'),
                            mimeType: 'image/jpeg'
                        }
                    }
                ]);

                const response = await result.response;
                const text = response.text();
                const duration = Date.now() - startTime;

                log(colors.green, '✅ PASSED:', `Image analysis completed in ${duration}ms`);

                // Try to parse JSON
                let jsonString = text.trim();
                jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
                const firstBrace = jsonString.indexOf('{');
                const lastBrace = jsonString.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1) {
                    jsonString = jsonString.substring(firstBrace, lastBrace + 1);
                    try {
                        const parsed = JSON.parse(jsonString);
                        log(colors.green, '   ✓', `Parsed product: "${parsed.name}"`);
                        console.log('\n   Full AI Response:');
                        console.log('   ' + JSON.stringify(parsed, null, 2).split('\n').join('\n   '));
                    } catch (parseErr) {
                        log(colors.yellow, '   ⚠️', 'JSON parsing failed (but API works!)');
                        console.log('   Raw response:', text.substring(0, 100) + '...');
                    }
                }
            } catch (err) {
                log(colors.red, '❌ FAILED:', `Image analysis error: ${err.message}`);

                if (err.message.includes('429')) {
                    console.log('\n💡 Rate Limit Hit:');
                    console.log('   - You\'ve made too many requests in the last minute');
                    console.log('   - Gemini Free Tier: 15 requests per minute');
                    console.log('   - Wait 60 seconds and try again\n');
                }
                return;
            }
        }
    }

    // ✅ FINAL SUMMARY
    console.log('\n' + '='.repeat(60));
    log(colors.green, '🎉 SUCCESS:', 'All tests passed! Your setup is working correctly.');
    console.log('='.repeat(60));

    console.log('\n📊 Rate Limit Guidelines:');
    console.log('   • Free Tier: 15 requests per minute (RPM)');
    console.log('   • Recommended delay: 6 seconds between images');
    console.log('   • Max batch size: 10-15 images at once');

    console.log('\n💡 If you still get rate limit errors in production:');
    console.log('   1. Increase DELAY_BETWEEN_REQUESTS_MS to 7000 (7 seconds)');
    console.log('   2. Reduce MAX_BATCH_SIZE to 10 images');
    console.log('   3. Wait 60 seconds between batch uploads\n');
}

// Run the diagnostics
runDiagnostics().catch(err => {
    console.error('\n💥 Unexpected Error:', err);
    console.error('\nFull stack trace:', err.stack);
});