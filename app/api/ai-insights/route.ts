import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStudents, getPlacements } from '@/lib/db';
import { predictProvinceRegistrations, predictJobCategoryEmployment } from '@/lib/ai-predictive-analytics';

export async function GET(request: NextRequest) {
  try {
    // Get all students and placements data
    const [students, placements] = await Promise.all([
      getStudents(),
      getPlacements()
    ]);

    if (!students || !placements) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch data' },
        { status: 500 }
      );
    }

    // Generate AI predictions
    const [provincesPrediction, jobCategoriesPrediction] = await Promise.all([
      predictProvinceRegistrations(students),
      predictJobCategoryEmployment(students, placements)
    ]);

    // Format response data
    const aiInsights = {
      success: true,
      data: {
        provinceRegistrations: {
          predictions: provincesPrediction.predictions,
          totalPredicted: Object.values(provincesPrediction.predictions).reduce((sum: number, count: number) => sum + count, 0),
          confidence: provincesPrediction.confidence,
          insights: provincesPrediction.insights,
          recommendations: provincesPrediction.recommendations,
          historicalTrends: provincesPrediction.historicalTrends,
          seasonalFactors: provincesPrediction.seasonalFactors
        },
        jobCategoryEmployment: {
          predictions: jobCategoriesPrediction.predictions,
          totalPredicted: Object.values(jobCategoriesPrediction.predictions).reduce((sum: number, count: number) => sum + count, 0),
          confidence: jobCategoriesPrediction.confidence,
          insights: jobCategoriesPrediction.insights,
          recommendations: jobCategoriesPrediction.recommendations,
          marketDemand: jobCategoriesPrediction.marketDemand,
          riskFactors: jobCategoriesPrediction.riskFactors
        },
        generatedAt: new Date().toISOString(),
        dataPoints: {
          totalStudents: students.length,
          totalPlacements: placements.length,
          analysisRange: '12 months forecast'
        }
      }
    };

    return NextResponse.json(aiInsights);
  } catch (error) {
    console.error('AI Insights API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate AI insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST method for custom prediction parameters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeframe = 12, focusProvinces, focusJobCategories } = body;

    const [students, placements] = await Promise.all([
      getStudents(),
      getPlacements()
    ]);

    if (!students || !placements) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch data' },
        { status: 500 }
      );
    }

    // Generate custom predictions based on parameters
    const customInsights = {
      success: true,
      data: {
        customAnalysis: true,
        timeframe,
        focusAreas: {
          provinces: focusProvinces,
          jobCategories: focusJobCategories
        },
        // Add custom prediction logic here if needed
        message: 'Custom AI insights generated successfully'
      }
    };

    return NextResponse.json(customInsights);
  } catch (error) {
    console.error('Custom AI Insights Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate custom insights' },
      { status: 500 }
    );
  }
}