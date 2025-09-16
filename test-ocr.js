const { ocrSpace } = require('ocr-space-api-wrapper');

async function testOCRConnection() {
  try {
    console.log('🔄 Testing OCR Space API connection...');
    
    // Test with a simple base64 image (1x1 pixel PNG)
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const result = await ocrSpace(testImage, {
      apiKey: process.env.OCR_SPACE_API_KEY,
      language: 'eng',
    });
    
    console.log('✅ OCR API Response received');
    console.log('✅ OCR CONNECTION SUCCESSFUL!');
    
    return true;
  } catch (error) {
    console.error('❌ OCR CONNECTION FAILED:', error.message);
    console.error('❌ Please check your OCR_SPACE_API_KEY in .env file');
    return false;
  }
}

testOCRConnection();