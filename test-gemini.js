require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiConnection() {
  try {
    console.log('🔄 Testing Gemini API connection...');
    console.log('API Key loaded:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent('Hello, can you respond with just "Connection successful"?');
    const response = result.response;
    const text = response.text();
    
    console.log('✅ Gemini API Response:', text);
    console.log('✅ CONNECTION SUCCESSFUL - Gemini API is working!');
    
    return true;
  } catch (error) {
    console.error('❌ CONNECTION FAILED:', error.message);
    console.error('❌ Please check your GEMINI_API_KEY in .env file');
    return false;
  }
}

testGeminiConnection();