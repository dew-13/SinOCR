require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
  try {
    console.log('🔄 Checking available Gemini models...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to list models
    const models = await genAI.listModels();
    console.log('✅ Available models:');
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
    });
    
    // Test with the first available model
    if (models.length > 0) {
      const firstModel = models[0];
      console.log(`\n🔄 Testing with first available model: ${firstModel.name}`);
      
      const model = genAI.getGenerativeModel({ model: firstModel.name });
      const result = await model.generateContent('Hello, respond with "Connection successful"');
      const response = result.response;
      const text = response.text();
      
      console.log('✅ SUCCESS:', text);
      console.log(`✅ USE THIS MODEL: ${firstModel.name}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Try with common model names
    console.log('\n🔄 Trying common model names...');
    const commonModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const modelName of commonModels) {
      try {
        console.log(`Testing: ${modelName}`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Hello');
        console.log(`✅ ${modelName} WORKS!`);
        break;
      } catch (err) {
        console.log(`❌ ${modelName} failed`);
      }
    }
  }
}

listAvailableModels();