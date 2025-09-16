const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiWithDifferentModels() {
  try {
    console.log('🔄 Testing Gemini API with different models...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try different model names
    const modelNames = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro'
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\n🔄 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Hello, respond with "Connection successful"');
        const response = result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with ${modelName}:`, text);
        console.log(`✅ USE THIS MODEL: ${modelName}`);
        return modelName;
        
      } catch (error) {
        console.log(`❌ ${modelName} failed:`, error.message.split('\n')[0]);
      }
    }
    
    throw new Error('All models failed');
    
  } catch (error) {
    console.error('❌ ALL MODELS FAILED');
    return null;
  }
}

testGeminiWithDifferentModels();