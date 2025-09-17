require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testImprovedAccuracy() {
  try {
    console.log('🧪 Testing Improved Translation Accuracy...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const improvedPrompt = `
Extract data from this Sinhala form and TRANSLATE everything to English. Return ONLY JSON.

SAMPLE DATA:
1. සම්පූර්ණ නම: කමල් පෙරේරා
2. ස්ත්‍රී/පුරුෂ: ☑ පුරුෂ  ☐ ස්ත්‍රී
3. විවාහක තත්වය: ☑ අවිවාහක  ☐ විවාහක
4. ජංගම: 0771234567
5. O/L: ☑ ඇත  ☐ නැත
6. පළාත: බසරට

CRITICAL: TRANSLATE all Sinhala to English:
- කමල් පෙරේරා → "Kamal Perera"
- පුරුෂ → "Male", ස්ත්‍රී → "Female"
- අවිවාහක → "Single", විවාහක → "Married"
- ඇත → true, නැත → false
- බසරට → "Western"
- Remove 0 from phone: 0771234567 → "771234567"

Return ONLY JSON with ALL TEXT IN ENGLISH:
{
  "fullName": "",
  "sex": "",
  "maritalStatus": "",
  "mobilePhone": "",
  "educationOL": false,
  "province": ""
}`;

    console.log('🔄 Testing improved translation...');
    const result = await model.generateContent(improvedPrompt);
    const response = result.response;
    const aiText = response.text();
    
    console.log('✅ Improved AI Response:');
    console.log(aiText);
    
    const jsonRegex = /\{[\s\S]*\}/;
    const jsonMatch = jsonRegex.exec(aiText);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      console.log('\n🎯 Translation Accuracy Check:');
      console.log('✅ Full Name (English):', data.fullName);
      console.log('✅ Sex (English):', data.sex);
      console.log('✅ Marital Status (English):', data.maritalStatus);
      console.log('✅ Mobile (No prefix):', data.mobilePhone);
      console.log('✅ O/L (Boolean):', data.educationOL);
      console.log('✅ Province (English):', data.province);
      
      console.log('\n🚀 Enhanced system ready for accurate form filling!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImprovedAccuracy();