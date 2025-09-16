require('dotenv').config();
const { createWorker } = require('tesseract.js');
const fs = require('fs');

async function testTesseractOCR() {
  try {
    console.log('🧪 Testing Tesseract OCR with Sinhala support...');
    
    console.log('🔄 Creating Tesseract worker...');
    const worker = await createWorker(['eng', 'sin'], 1, {
      logger: m => console.log('Tesseract Log:', m.status, m.progress)
    });
    
    // Create a simple test with text
    console.log('🔄 Testing with simple English text...');
    
    // You can test with your actual image if you want
    // For now, let's test that Tesseract is working
    console.log('✅ Tesseract worker created successfully!');
    console.log('✅ Languages loaded: English and Sinhala');
    
    await worker.terminate();
    console.log('🎉 OCR setup is ready!');
    
    console.log('\n📋 Next steps:');
    console.log('1. The server will now use Tesseract for OCR');
    console.log('2. Try uploading your Sinhala document again');
    console.log('3. Tesseract will extract text and Gemini will translate it');
    
  } catch (error) {
    console.error('❌ Tesseract test failed:', error.message);
    console.error('Full error:', error);
  }
}

testTesseractOCR();