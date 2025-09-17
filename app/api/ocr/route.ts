import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 OCR API: Using Gemini Vision for text extraction...");
    
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("❌ OCR API: No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("📄 OCR API: File received:", file.name, file.type, file.size, "bytes");

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || 'image/jpeg';
    
    console.log("🤖 OCR API: Sending image to Gemini Vision...");
    
    // Use Gemini Vision model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
Extract ALL text from this image. This is a Sinhala handwritten student registration form.
Please extract every piece of text you can see, including:
- Names (in Sinhala)
- Addresses (in Sinhala) 
- Numbers (phone numbers, ID numbers, dates)
- Any other text visible in the image

Return the extracted text exactly as you see it, preserving the original language (Sinhala/English).
Do not translate anything - just extract the raw text.
`;

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const extractedText = response.text();
    
    console.log("✅ OCR API: Gemini Vision extraction successful!");
    console.log("📄 OCR API: Extracted text length:", extractedText.length);
    console.log("📄 OCR API: Extracted text preview:", extractedText.substring(0, 300) + "...");

    return NextResponse.json({ extractedText });
    
  } catch (error) {
    console.error("❌ OCR API: Gemini Vision error:", error);
    return NextResponse.json(
      { 
        error: "Failed to extract text using Gemini Vision",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
