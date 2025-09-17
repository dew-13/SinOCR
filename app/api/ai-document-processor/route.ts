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

    const prompt = `
You are an expert at reading Sinhala student registration forms. Analyze this image very carefully and extract ALL visible information with high accuracy.

CRITICAL INSTRUCTIONS:
1. Look for EVERY piece of text, numbers, checkboxes, and markings
2. TRANSLATE all Sinhala text to English - DO NOT keep Sinhala in the output
3. Pay special attention to gender/sex indicators (පුරුෂ/ස්ත්‍රී → Male/Female)
4. Examine marital status carefully (අවිවාහක/විවාහක → Single/Married)
5. Check all education fields thoroughly (O/L, A/L, ඇත/නැත → true/false)
6. Extract phone numbers without country codes (remove +94, 0 prefix → 9 digits only)

SPECIFIC TRANSLATIONS:
- පුරුෂ → "Male", ස්ත්‍රී → "Female"
- අවිවාහක → "Single", විවාහක → "Married", දික්කසාද → "Divorced"
- ඇත → true, නැත → false
- බසරට → "Western", මධ්‍යම → "Central", දකුණ → "Southern"
- කොළඹ → "Colombo", ගම්පහ → "Gampaha", කළුතර → "Kalutara"
- රත්නපුර → "Ratnapura", කෑගල්ල → "Kegalle"

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