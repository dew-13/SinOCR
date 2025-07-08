import { NextResponse } from "next/server"
import { ImageAnnotatorClient } from "@google-cloud/vision"

// Configuration for the backend services
const TRANSLATE_API_URL = "https://libretranslate.de/translate"

// Initialize the Google Cloud Vision client.
// This will use the credentials set in the GOOGLE_APPLICATION_CREDENTIALS
// environment variable. For more info, see:
// https://cloud.google.com/docs/authentication/getting-started
const visionClient = new ImageAnnotatorClient()

/**
 * A simple utility function to map translated text to student form fields.
 * This function uses keywords to find and extract data for each field.
 * NOTE: This is a basic implementation and might need to be improved based on
 * the specific format of the scanned documents for better accuracy.
 */
function mapTextToFields(text: string): Record<string, string> {
  const mappedData: Record<string, string> = {}
  const lines = text.split("\n").filter((line) => line.trim() !== "")

  // Keywords to identify form fields in the translated text.
  // The keys correspond to the form field names in the frontend.
  const fieldKeywords: { [key: string]: string[] } = {
    fullName: ["full name", "name"],
    permanentAddress: ["address", "permanent address"],
    district: ["district"],
    province: ["province"],
    dateOfBirth: ["date of birth", "dob"],
    nationalId: ["national id", "nic"],
    sex: ["sex", "gender"],
    maritalStatus: ["marital status"],
    mobilePhone: ["mobile", "phone"],
    emailAddress: ["email"],
    educationQualification: ["education", "qualification"],
  }

  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    for (const field in fieldKeywords) {
      const keywords = fieldKeywords[field]
      if (keywords.some((keyword) => lowerLine.startsWith(keyword))) {
        // Extract value, assuming it comes after a colon or the keyword.
        const value = line.split(":").slice(1).join(":").trim() || line.substring(keywords[0].length).trim()
        if (value) {
          mappedData[field] = value
          break // Move to the next line once a field is matched
        }
      }
    }
  }

  return mappedData
}

export async function POST(request: Request) {
  try {
    const requestFormData = await request.formData()
    const image = requestFormData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 })
    }

    // Convert image to buffer for Google Cloud Vision API
    const imageBuffer = Buffer.from(await image.arrayBuffer())

    // Call the Google Cloud Vision API for text detection (OCR)
    const [result] = await visionClient.textDetection({
      image: { content: imageBuffer },
      imageContext: { languageHints: ["si"] }, // Hint that the language is Sinhalese
    })

    const extractedText = result.fullTextAnnotation?.text

    if (!extractedText) {
      return NextResponse.json({ error: "Could not extract text from the image." }, { status: 500 })
    }

    // Translate the extracted text from Sinhalese to English
    const translateResponse = await fetch(TRANSLATE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: extractedText,
        source: "si",
        target: "en",
        format: "text",
      }),
    })

    if (!translateResponse.ok) {
      return NextResponse.json({ error: "Translation service failed." }, { status: 500 })
    }

    const translateData = await translateResponse.json()
    const translatedText = translateData.translatedText

    // Map the translated text to the student form fields
    const studentData = mapTextToFields(translatedText)

    return NextResponse.json({ studentData })
  } catch (error) {
    console.error("Error in OCR processing route:", error)
    return NextResponse.json(
      { error: "Failed to process image. Make sure your Google Cloud credentials are set up correctly." },
      { status: 500 }
    )
  }
} 