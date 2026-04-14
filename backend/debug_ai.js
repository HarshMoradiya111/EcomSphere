const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Should load .env from current dir
const { analyzeProductImage } = require('./src/services/ai.service');

async function test() {
    console.log('--- AI Connection Test ---');
    console.log('Checking API Key:', process.env.GEMINI_API_KEY ? 'Present (starts with ' + process.env.GEMINI_API_KEY.substring(0, 4) + ')' : 'MISSING');
    
    // Find an image in uploads to test
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        console.error('Uploads directory not found:', uploadsDir);
        return;
    }

    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    if (files.length === 0) {
        console.error('No images found in uploads to test with. Please upload an image first.');
        return;
    }

    const testImage = path.join(uploadsDir, files[0]);
    console.log('Testing with image:', testImage);

    try {
        const buffer = fs.readFileSync(testImage);
        console.log('Calling Gemini...');
        const result = await analyzeProductImage(buffer, 'image/jpeg');
        console.log('SUCCESS! AI Response:');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('FAILED! AI Error Details:');
        console.error(error.message);
    }
}

test();
