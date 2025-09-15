import { ocrSpace } from "ocr-space-api-wrapper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const res = await ocrSpace(`data:image/png;base64,${base64}`, {
      apiKey: process.env.OCR_SPACE_API_KEY,
      language: "sin" as any,
    });

    const extractedText = res.ParsedResults[0].ParsedText;

    return NextResponse.json({ extractedText });
  } catch (error) {
    console.error("Error during OCR processing:", error);
    return NextResponse.json(
      { error: "Failed to process image with OCR" },
      { status: 500 }
    );
  }
}
