require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testEnhancedAccuracy() {
  try {
    console.log('🧪 Testing Enhanced Gemini Vision Accuracy...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Simulate complex Sinhala form data
    const mockComplexText = `
    1. සම්පූර්ණ නම: කමල් පෙරේරා සිල්වා
    2. ස්ථිර ලිපිනය: 125/A, කන්ද මාවත, කොළඹ 07
    3. පළාත: බසරට පළාත
    4. දිස්ත්‍රික්කය: කොළඹ
    5. ජන්ම දිනය: 1985/03/20
    6. ජාතික හැඳුනුම්පත: 198512345678V
    7. ස්ත්‍රී/පුරුෂ: ☑ පුරුෂ  ☐ ස්ත්‍රී
    8. විවාහක තත්වය: ☑ විවාහක  ☐ අවිවාහක
    9. භාර්යාවගේ නම: සුනිල් කුමාරි
    10. ජංගම දූරකථන: 0771234567
    11. WhatsApp: 0777654321
    12. O/L: ☑ ඇත  ☐ නැත
    13. A/L: ☐ ඇත  ☑ නැත
    14. වැඩ අත්දැකීම්: අවුරුදු 5ක් කඩයේ වැඩ කර ඇත
    15. විදේශ වැඩ: සෞදි අරාබියේ අවුරුදු 2ක්
    `;

    const enhancedPrompt = `
You are an expert at reading Sinhala student registration forms. Analyze this text very carefully and extract ALL information with high accuracy.

TEXT: ${mockComplexText}

CRITICAL INSTRUCTIONS:
1. Look for EVERY piece of text, numbers, checkboxes (☑/☐), and markings
2. Pay special attention to gender/sex indicators (පුරුෂ/ස්ත්‍රී, Male/Female, checkboxes)
3. Examine marital status carefully (අවිවාහක/විවාහක, Single/Married)
4. Check education fields (O/L, A/L, ඇත/නැත checkboxes)

Convert Sinhala accurately:
- පුරුෂ = Male, ස්ත්‍රී = Female
- විවාහක = Married, අවිවාහක = Single
- ඇත = true, නැත = false
- බසරට = Western

Return ONLY JSON:
{
  "fullName": "",
  "permanentAddress": "",
  "province": "",
  "district": "",
  "dateOfBirth": "",
  "nationalId": "",
  "sex": "",
  "maritalStatus": "",
  "spouseName": "",
  "mobilePhone": "",
  "whatsappNumber": "",
  "educationOL": false,
  "educationAL": false,
  "workExperience": "",
  "workExperienceAbroad": ""
}`;

    console.log('🔄 Testing enhanced prompt...');
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;
    const aiText = response.text();
    
    console.log('✅ Enhanced AI Response:');
    console.log(aiText);
    
    // Parse and verify
    const jsonRegex = /\{[\s\S]*\}/;
    const jsonMatch = jsonRegex.exec(aiText);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      console.log('\n🎯 Accuracy Check:');
      console.log('Full Name:', data.fullName === 'Kamal Perera Silva' ? '✅' : '❌', data.fullName);
      console.log('Sex:', data.sex === 'Male' ? '✅' : '❌', data.sex);
      console.log('Marital Status:', data.maritalStatus === 'Married' ? '✅' : '❌', data.maritalStatus);
      console.log('Spouse Name:', data.spouseName ? '✅' : '❌', data.spouseName);
      console.log('Mobile:', data.mobilePhone === '771234567' ? '✅' : '❌', data.mobilePhone);
      console.log('WhatsApp:', data.whatsappNumber === '777654321' ? '✅' : '❌', data.whatsappNumber);
      console.log('O/L:', data.educationOL === true ? '✅' : '❌', data.educationOL);
      console.log('A/L:', data.educationAL === false ? '✅' : '❌', data.educationAL);
      console.log('Province:', data.province === 'Western' ? '✅' : '❌', data.province);
      
      console.log('\n🚀 Enhanced accuracy system ready!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEnhancedAccuracy();