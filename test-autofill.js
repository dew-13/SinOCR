require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testUpdatedAPI() {
  try {
    console.log('🧪 Testing Updated AI Document Processing API');
    console.log('='.repeat(50));
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Simulate extracted OCR text (like what would come from your Sinhala document)
    const mockSinhalaText = `
    1. සම්පූර්ණ නම: කමල් පෙරේරා
    2. ස්ථිර ලිපිනය: 123, ගාල්ල පාර, කොළඹ 03
    3. පළාත: බසරට
    4. දිස්ත්‍රික්කය: කොළඹ  
    5. ජන්ම දිනය: 1990/05/15
    6. ජාතික හැඳුනුම්පත: 199012345678
    7. ජංගම දූරකථන: 0771234567
    8. ස්ත්‍රී/පුරුෂ: පුරුෂ
    9. විවාහක තත්වය: අවිවාහක
    10. O/L: ඇත
    11. A/L: නැත
    12. වැඩ අත්දැකීම: අවුරුදු 2 ක් කඩෙහි වැඩ
    `;

    const prompt = `
Extract student data from this Sinhala text and convert to English. Return ONLY valid JSON:

TEXT: ${mockSinhalaText}

Convert Sinhala names/addresses to English. Use these Sri Lankan provinces: Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, Sabaragamuwa.

Format dates as YYYY-MM-DD. Phone numbers as 9 digits only.

JSON format:
{
  "fullName": "",
  "permanentAddress": "",
  "province": "",
  "district": "",
  "dateOfBirth": "",
  "nationalId": "",
  "passportId": "",
  "passportExpiredDate": "",
  "sex": "",
  "maritalStatus": "",
  "spouseName": "",
  "numberOfChildren": 0,
  "mobilePhone": "",
  "whatsappNumber": "",
  "emailAddress": "",
  "hasDrivingLicense": false,
  "vehicleType": "",
  "educationOL": false,
  "educationAL": false,
  "otherQualifications": "",
  "workExperience": "",
  "workExperienceAbroad": "",
  "expectedJobCategory": "",
  "guardianName": "",
  "guardianContact": ""
}`;

    console.log('🤖 Sending to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const aiText = response.text();
    
    console.log('✅ Raw Gemini Response:');
    console.log(aiText);
    
    // Parse JSON
    console.log('\n📦 Parsing JSON...');
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extractedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed Data for Auto-Fill:');
      console.log(JSON.stringify(extractedData, null, 2));
      
      console.log('\n🎯 Form Field Mapping Check:');
      console.log('Full Name:', extractedData.fullName);
      console.log('Address:', extractedData.permanentAddress);
      console.log('Province:', extractedData.province);
      console.log('District:', extractedData.district);
      console.log('Date of Birth:', extractedData.dateOfBirth);
      console.log('Mobile:', extractedData.mobilePhone);
      
      console.log('\n🎉 AUTO-FILL READY! Data will populate form fields correctly.');
    } else {
      console.log('❌ No JSON found in response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpdatedAPI();