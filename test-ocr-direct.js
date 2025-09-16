require('dotenv').config();
const { ocrSpace } = require('ocr-space-api-wrapper');

async function testOCRDirectly() {
  try {
    console.log('🧪 Testing OCR Space API directly...');
    console.log('API Key present:', !!process.env.OCR_SPACE_API_KEY);
    console.log('API Key value:', process.env.OCR_SPACE_API_KEY);
    
    // Test with a simple text image (base64 encoded)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    console.log('🔄 Sending test image to OCR...');
    
    const result = await ocrSpace(testImageBase64, {
      apiKey: process.env.OCR_SPACE_API_KEY,
      language: 'eng',
      isOverlayRequired: false,
      OCREngine: '2'
    });
    
    console.log('✅ OCR Response received:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.ParsedResults && result.ParsedResults.length > 0) {
      console.log('✅ OCR is working correctly!');
    } else {
      console.log('❌ OCR response format issue');
    }
    
  } catch (error) {
    console.error('❌ OCR test failed:', error.message);
    console.error('Full error:', error);
  }
}

testOCRDirectly();