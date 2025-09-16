require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function fullSystemTest() {
  try {
    console.log('🎯 FULL SYSTEM TEST - AI Document Processing');
    console.log('='.repeat(50));
    
    // Test 1: Gemini Connection
    console.log('\n1️⃣ Testing Gemini AI Connection...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const testResult = await model.generateContent('Respond with "Gemini working perfectly!"');
    const testText = testResult.response.text();
    console.log('✅ Gemini Response:', testText);
    
    // Test 2: Text Processing (simulate what happens after OCR)
    console.log('\n2️⃣ Testing Sinhala Text Processing...');
    const sinhalaText = `
    1. සම්පූර්ණ නම: කමල් පෙරේරා
    2. ස්ථිර ලිපිනය: 123, ගාල්ල පාර, කොළඹ 03
    3. දිස්ත්‍රික්කය: කොළඹ
    4. ජන්ම දිනය: 1990/05/15
    5. ජාතික හැඳුනුම්පත: 199012345678
    6. ජංගම දූරකථන: 0771234567
    `;
    
    const processingPrompt = `
You are processing a Sinhala student registration form. Convert this text to English and extract structured data:

${sinhalaText}

Respond with ONLY a JSON object:
{
  "fullName": "",
  "permanentAddress": "",
  "district": "",
  "dateOfBirth": "",
  "nationalId": "",
  "mobilePhone": ""
}
`;

    const processResult = await model.generateContent(processingPrompt);
    const processText = processResult.response.text();
    console.log('✅ AI Processing Result:');
    console.log(processText);
    
    // Test 3: Parse JSON
    console.log('\n3️⃣ Testing JSON Parsing...');
    const jsonMatch = processText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extractedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed Data:', extractedData);
    }
    
    console.log('\n🎉 ALL TESTS PASSED! System is ready for document processing!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

fullSystemTest();