import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with free API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 Starting AI document processing...");
    
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("📄 File received:", file.name, file.size, "bytes");

    // Convert file to base64 for Gemini Vision
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || 'image/jpeg';
    
    console.log("🤖 Processing with Gemini Vision + AI...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Enhanced gender detection function
    const detectGender = (text: string): string => {
      const genderMappings = {
        // Sinhala terms for female
        'ස්ත්‍රී': 'female',
        'ස්ත්රී': 'female', 
        'ගැහැණු': 'female',
        'කාන්තා': 'female',
        // Sinhala terms for male
        'පුරුෂ': 'male',
        'පුරුෂා': 'male',
        'පිරිමි': 'male',
        'නරයා': 'male',
        // English terms
        'male': 'male',
        'female': 'female',
        'man': 'male',
        'woman': 'female'
      };

      // Convert text to lowercase for matching
      const lowerText = text.toLowerCase();
      
      // Check for gender field context
      const genderFieldPattern = /(?:ස්ත්‍රී|පුරුෂ|gender|sex|ස්ත්‍රී\s*\/\s*පුරුෂ)/i;
      
      // Look for checked boxes or marked fields near gender indicators
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // If this line contains gender field indicator
        if (genderFieldPattern.test(line)) {
          // Check current line and next few lines for marked options
          for (let j = 0; j < 3 && (i + j) < lines.length; j++) {
            const checkLine = lines[i + j];
            
            // Look for checkmarks, X marks, or circled options
            const markedPattern = /[✓✗×✔️☑️🗹]|checked|marked|circled|\[x\]|\(x\)/i;
            
            if (markedPattern.test(checkLine)) {
              // Check which gender term is marked
              for (const [sinhala, english] of Object.entries(genderMappings)) {
                if (checkLine.includes(sinhala)) {
                  console.log(`🎯 Gender detected: Found marked ${sinhala} → ${english}`);
                  return english;
                }
              }
            }
          }
        }
        
        // Direct detection of gender terms in the line
        for (const [sinhala, english] of Object.entries(genderMappings)) {
          if (line.includes(sinhala)) {
            // Check if this appears to be marked/selected
            const hasMarker = /[✓✗×✔️☑️🗹]|checked|marked|\[x\]|\(x\)/i.test(line);
            if (hasMarker) {
              console.log(`🎯 Gender detected: Found marked ${sinhala} → ${english}`);
              return english;
            }
          }
        }
      }
      
      // Fallback: look for any gender terms in the text
      for (const [sinhala, english] of Object.entries(genderMappings)) {
        if (text.includes(sinhala)) {
          console.log(`🔍 Gender fallback: Found ${sinhala} → ${english}`);
          return english;
        }
      }
      
      return '';
    };

    // Enhanced district detection function with Sinhala mapping
    const detectDistrict = (text: string): string => {
      const districtMappings = {
        // English to standardized English
        'ampara': 'Ampara',
        'anuradhapura': 'Anuradhapura', 
        'badulla': 'Badulla',
        'batticaloa': 'Batticaloa',
        'colombo': 'Colombo',
        'galle': 'Galle',
        'gampaha': 'Gampaha',
        'hambantota': 'Hambantota',
        'jaffna': 'Jaffna',
        'kalutara': 'Kalutara',
        'kandy': 'Kandy',
        'kegalle': 'Kegalle',
        'kilinochchi': 'Kilinochchi',
        'kurunegala': 'Kurunegala',
        'mannar': 'Mannar',
        'matale': 'Matale',
        'matara': 'Matara',
        'monaragala': 'Monaragala',
        'mullaitivu': 'Mullaitivu',
        'nuwara eliya': 'Nuwara Eliya',
        'polonnaruwa': 'Polonnaruwa',
        'puttalam': 'Puttalam',
        'ratnapura': 'Ratnapura',
        'trincomalee': 'Trincomalee',
        'vavuniya': 'Vavuniya',
        
        // Sinhala to English mapping
        'අම්පාර': 'Ampara',
        'අනුරාධපුර': 'Anuradhapura',
        'බදුල්ල': 'Badulla',
        'මඩකලපුව': 'Batticaloa',
        'බත්තිකලාව': 'Batticaloa',
        'කොළඹ': 'Colombo',
        'ගාල්ල': 'Galle',
        'ගම්පහ': 'Gampaha',
        'හම්බන්තොට': 'Hambantota',
        'යාපනය': 'Jaffna',
        'කලුතර': 'Kalutara',
        'මහනුවර': 'Kandy',
        'කෑගල්ල': 'Kegalle',
        'කිලිනොච්චි': 'Kilinochchi',
        'කුරුණෑගල': 'Kurunegala',
        'මන්නාරම': 'Mannar',
        'මතලේ': 'Matale',
        'මාතර': 'Matara',
        'මොනරාගල': 'Monaragala',
        'මුලතිව්': 'Mullaitivu',
        'නුවර එළිය': 'Nuwara Eliya',
        'පොළොන්නරුව': 'Polonnaruwa',
        'පුත්තලම': 'Puttalam',
        'රත්නපුර': 'Ratnapura',
        'ත්‍රිකුණාමලය': 'Trincomalee',
        'වවුනියාව': 'Vavuniya',
        
        // Common variations and abbreviations
        'nuwara-eliya': 'Nuwara Eliya',
        'nuwaraeliya': 'Nuwara Eliya',
        'nuwara': 'Nuwara Eliya',
        'eliya': 'Nuwara Eliya',
        'කන්ද': 'Kandy',
        'කොළම්බ': 'Colombo'
      };

      // Convert text to lowercase for matching
      const lowerText = text.toLowerCase();
      
      // Check for district field context
      const districtFieldPattern = /(?:district|දිස්ත්‍රික්කය|ගම)/i;
      
      // Look for marked districts near district field indicators
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // If this line contains district field indicator
        if (districtFieldPattern.test(line)) {
          // Check current line and next few lines for district names
          for (let j = 0; j < 3 && (i + j) < lines.length; j++) {
            const checkLine = lines[i + j];
            
            // Check for each district mapping
            for (const [term, standardName] of Object.entries(districtMappings)) {
              if (checkLine.toLowerCase().includes(term.toLowerCase()) || checkLine.includes(term)) {
                console.log(`🎯 District detected: Found ${term} → ${standardName}`);
                return standardName;
              }
            }
          }
        }
        
        // Direct detection of district names in any line
        for (const [term, standardName] of Object.entries(districtMappings)) {
          if (line.toLowerCase().includes(term.toLowerCase()) || line.includes(term)) {
            console.log(`🔍 District detected: Found ${term} → ${standardName}`);
            return standardName;
          }
        }
      }
      
      return '';
    };

    const prompt = `
You are an expert at reading Sinhala student registration forms. Analyze this image very carefully and extract ALL visible information with high accuracy.

CRITICAL INSTRUCTIONS:
1. Look for EVERY piece of text, numbers, checkboxes, and markings
2. TRANSLATE all Sinhala text to English - DO NOT keep Sinhala in the output
3. Pay EXTRA attention to gender/sex field "ස්ත්‍රී /පුරුෂ භාවය" - look for checkmarks, circles, or any marking indicating selection
4. Examine marital status carefully (අවිවාහක/විවාහක → Single/Married)
5. Check all education fields thoroughly (O/L, A/L, ඇත/නැත → true/false)
6. Extract phone numbers without country codes (remove +94, 0 prefix → 9 digits only)

GENDER FIELD SPECIAL ATTENTION:
- Look for field "7. ස්ත්‍රී /පුරුෂ භාවය" or similar
- ස්ත්‍රී = Female
- පුරුෂ = Male  
- Check which option is marked with ✓, ✗, circle, underline, or any marking
- If you see both terms but only one is marked, return the marked one

DISTRICT FIELD SPECIAL ATTENTION:
- Look for field "දිස්ත්‍රික්කය" (district) or similar
- All 25 Sri Lankan districts with Sinhala names:
  Ampara (අම්පාර), Anuradhapura (අනුරාධපුර), Badulla (බදුල්ල), 
  Batticaloa (මඩකලපුව/බත්තිකලාව), Colombo (කොළඹ), Galle (ගාල්ල), 
  Gampaha (ගම්පහ), Hambantota (හම්බන්තොට), Jaffna (යාපනය), 
  Kalutara (කලුතර), Kandy (මහනුවර), Kegalle (කෑගල්ල), 
  Kilinochchi (කිලිනොච්චි), Kurunegala (කුරුණෑගල), Mannar (මන්නාරම), 
  Matale (මතලේ), Matara (මාතර), Monaragala (මොනරාගල), 
  Mullaitivu (මුලතිව්), Nuwara Eliya (නුවර එළිය), 
  Polonnaruwa (පොළොන්නරුව), Puttalam (පුත්තලම), 
  Ratnapura (රත්නපුර), Trincomalee (ත්‍රිකුණාමලය), Vavuniya (වවුනියාව)
- Check which district name is marked, written, or selected
- Convert Sinhala district names to English equivalents

SPECIFIC TRANSLATIONS:
- ස්ත්‍රී → "female", පුරුෂ → "male"
- අවිවාහක → "Single", විවාහක → "Married", දික්කසාද → "Divorced"
- ඇත → true, නැත → false
- බසරට → "Western", මධ්‍යම → "Central", දකුණ → "Southern"
- Districts: අම්පාර → "Ampara", අනුරාධපුර → "Anuradhapura", බදුල්ල → "Badulla", 
  මඩකලපුව → "Batticaloa", කොළඹ → "Colombo", ගාල්ල → "Galle", ගම්පහ → "Gampaha",
  හම්බන්තොට → "Hambantota", යාපනය → "Jaffna", කලුතර → "Kalutara", මහනුවර → "Kandy",
  කෑගල්ල → "Kegalle", කිලිනොච්චි → "Kilinochchi", කුරුණෑගල → "Kurunegala", 
  මන්නාරම → "Mannar", මතලේ → "Matale", මාතර → "Matara", මොනරාගල → "Monaragala",
  මුලතිව් → "Mullaitivu", නුවර එළිය → "Nuwara Eliya", පොළොන්නරුව → "Polonnaruwa",
  පුත්තලම → "Puttalam", රත්නපුර → "Ratnapura", ත්‍රිකුණාමලය → "Trincomalee", වවුනියාව → "Vavuniya"

PHONE NUMBER FORMATTING:
- 0771234567 → "771234567" (remove leading 0)
- +94771234567 → "771234567" (remove +94)

DATE FORMATTING:
- Convert any date to YYYY-MM-DD format

FIELD MAPPING:
- Full Name: Translate Sinhala names to English phonetically
- Address: Translate addresses to English
- Province: Use exact English province names
- District: Use exact English district names

Return ONLY this JSON with ALL TEXT IN ENGLISH:
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

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: mimeType,
      },
    };

    console.log("📝 Sending to Gemini Vision...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const aiText = response.text();

    console.log("✅ Gemini response received");
    console.log("📄 Raw AI response:", aiText.substring(0, 500) + "...");

    // Parse the AI response
    let extractedData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonRegex = /\{[\s\S]*\}/;
      const jsonMatch = jsonRegex.exec(aiText);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
        console.log("✅ Successfully parsed extracted data");
        
        // Post-process district field with enhanced detection
        if (!extractedData.district || extractedData.district === '') {
          const detectedDistrict = detectDistrict(aiText);
          if (detectedDistrict) {
            extractedData.district = detectedDistrict;
            console.log("🔧 District post-processing: Updated to", detectedDistrict);
          }
        } else {
          // Validate existing district field
          const validDistricts = [
            'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 
            'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 
            'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala', 
            'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 
            'Trincomalee', 'Vavuniya'
          ];
          if (!validDistricts.includes(extractedData.district)) {
            const detectedDistrict = detectDistrict(aiText);
            if (detectedDistrict) {
              extractedData.district = detectedDistrict;
              console.log("🔧 District validation: Corrected to", detectedDistrict);
            }
          }
        }

        // Post-process gender field with enhanced detection
        if (!extractedData.sex || extractedData.sex === '') {
          const detectedGender = detectGender(aiText);
          if (detectedGender) {
            extractedData.sex = detectedGender;
            console.log("🔧 Gender post-processing: Updated to", detectedGender);
          }
        } else {
          // Validate existing gender field
          const validGenders = ['male', 'female', 'other'];
          if (!validGenders.includes(extractedData.sex.toLowerCase())) {
            const detectedGender = detectGender(aiText);
            if (detectedGender) {
              extractedData.sex = detectedGender;
              console.log("🔧 Gender validation: Corrected to", detectedGender);
            }
          }
        }
        
        // Additional validation for gender field
        if (extractedData.sex && !['male', 'female', 'other'].includes(extractedData.sex.toLowerCase())) {
          console.log("⚠️ Warning: Unexpected gender value:", extractedData.sex);
          // Try to map common variations
          const genderNormalization: Record<string, string> = {
            'male': 'male',
            'female': 'female',
            'Male': 'male',
            'Female': 'female',
            'M': 'male',
            'F': 'female',
            'පුරුෂ': 'male',
            'ස්ත්‍රී': 'female'
          };
          
          if (genderNormalization[extractedData.sex as string]) {
            extractedData.sex = genderNormalization[extractedData.sex as string];
            console.log("🔧 Gender normalized to:", extractedData.sex);
          }
        }
        
        // Log key fields for debugging
        console.log("🔍 Key extracted fields:");
        console.log("  - Full Name:", extractedData.fullName || "❌ Missing");
        console.log("  - Sex/Gender:", extractedData.sex || "❌ Missing");
        console.log("  - Marital Status:", extractedData.maritalStatus || "❌ Missing");
        console.log("  - Mobile Phone:", extractedData.mobilePhone || "❌ Missing");
        console.log("  - Education O/L:", extractedData.educationOL);
        console.log("  - Education A/L:", extractedData.educationAL);
        
      } else {
        throw new Error("No valid JSON found in AI response");
      }
    } catch (parseError) {
      console.error("❌ Error parsing AI response:", parseError);
      return NextResponse.json({ 
        error: "Failed to parse extracted data",
        aiResponse: aiText,
        rawResponse: aiText
      }, { status: 500 });
    }

    console.log("🎉 Document processing completed successfully");
    return NextResponse.json({ 
      success: true,
      extractedData
    });

  } catch (error) {
    console.error("❌ Error in AI document processor:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
}