import { verifyToken } from "@/lib/auth";
import { sql } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (!hasPermission(decoded.role, "VIEW_PREDICTIVE_ANALYTICS")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // First, let's get basic data to test what columns exist
    console.log("Testing database connection...");
    
    // Simple test query to see what columns exist
    const testQuery = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      ORDER BY ordinal_position
    `;
    
    console.log("Available columns in students table:", testQuery.map(col => col.column_name));

    // Enhanced queries using actual database columns
    const [
      basicStats,
      employmentProgress,
      districtData,
      educationAnalysis,
      experienceAnalysis,
      ageAnalysis,
      seasonalPatterns,
      companyData,
      futureProjections,
      riskAssessment
    ] = await Promise.all([
      // Basic student statistics
      sql`
        SELECT 
          COUNT(*) as total_students,
          (SELECT COUNT(DISTINCT student_id) FROM placements) as employed_students,
          COUNT(CASE WHEN status IN ('Active', 'active', 'Pending') THEN 1 END) as active_students
        FROM students
      `,

      // Employment progress from employees table
      sql`
        SELECT 
          DATE_TRUNC('month', e.employment_date) as month,
          COUNT(*) as employments,
          COUNT(DISTINCT e.company_id) as companies_hired,
          COUNT(DISTINCT e.student_id) as students_employed
        FROM employees e
        WHERE e.employment_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', e.employment_date)
        ORDER BY month DESC
        LIMIT 12
      `,

      // District analysis using available columns
      sql`
        SELECT 
          district,
          province,
          COUNT(*) as total_students,
          COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END) as employed_students,
          ROUND(
            (COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as employment_rate,
          AVG(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM date_of_birth)) as avg_age
        FROM students
        WHERE district IS NOT NULL
        GROUP BY district, province
        HAVING COUNT(*) >= 1
        ORDER BY employment_rate DESC
        LIMIT 15
      `,

      // Education analysis using education_ol and education_al
      sql`
        SELECT 
          CASE 
            WHEN education_ol = true AND education_al = true THEN 'Both O/L & A/L'
            WHEN education_ol = true THEN 'O/L Only'
            WHEN education_al = true THEN 'A/L Only'
            ELSE 'Other Qualification'
          END as education_level,
          COUNT(*) as total_students,
          COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END) as employed_students,
          ROUND(
            (COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as employment_rate
        FROM students
        GROUP BY education_level
        HAVING COUNT(*) >= 1
        ORDER BY employment_rate DESC
      `,

      // Work experience analysis
      sql`
        SELECT 
          CASE 
            WHEN work_experience IS NULL OR work_experience = '' THEN 'No Experience'
            WHEN work_experience ILIKE '%year%' THEN 'Experienced (1+ years)'
            WHEN work_experience ILIKE '%month%' THEN 'Some Experience (< 1 year)'
            ELSE 'Other Experience'
          END as experience_level,
          COUNT(*) as total_students,
          COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END) as employed_students,
          ROUND(
            (COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as employment_rate
        FROM students
        GROUP BY experience_level
        ORDER BY employment_rate DESC
      `,

      // Age group analysis
      sql`
        SELECT 
          CASE 
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM date_of_birth) < 25 THEN '18-24'
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM date_of_birth) < 30 THEN '25-29'
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM date_of_birth) < 35 THEN '30-34'
            ELSE '35+'
          END as age_group,
          COUNT(*) as total_students,
          COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END) as employed_students,
          ROUND(
            (COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as employment_rate
        FROM students
        WHERE date_of_birth IS NOT NULL
        GROUP BY age_group
        ORDER BY age_group
      `,

      // Seasonal registration patterns
      sql`
        SELECT 
          EXTRACT(MONTH FROM created_at) as month,
          EXTRACT(YEAR FROM created_at) as year,
          COUNT(*) as registrations,
          COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END) as employments
        FROM students
        WHERE created_at >= CURRENT_DATE - INTERVAL '24 months'
        GROUP BY EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at)
        ORDER BY year DESC, month DESC
        LIMIT 24
      `,

      // Company performance data
      sql`
        SELECT 
          c.company_name,
          c.industry,
          c.country,
          COUNT(e.id) as total_employments,
          COUNT(DISTINCT e.student_id) as unique_students,
          MIN(e.employment_date) as first_hire_date,
          MAX(e.employment_date) as latest_hire_date
        FROM companies c
        LEFT JOIN employees e ON c.id = e.company_id
        WHERE e.employment_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY c.id, c.company_name, c.industry, c.country
        HAVING COUNT(e.id) > 0
        ORDER BY total_employments DESC
        LIMIT 8
      `,

      // Future growth projections
      sql`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as registrations,
          LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as prev_month
        FROM students
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 6
      `,

      // Risk assessment
      sql`
        SELECT 
          district,
          COUNT(*) as total_students,
          COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END) as employed_students,
          ROUND(
            (COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as employment_rate,
          CASE 
            WHEN (COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) < 30 THEN 'High Risk'
            WHEN (COUNT(CASE WHEN status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) < 60 THEN 'Medium Risk'
            ELSE 'Low Risk'
          END as risk_level
        FROM students
        WHERE district IS NOT NULL
        GROUP BY district
        HAVING COUNT(*) >= 2
        ORDER BY employment_rate ASC
        LIMIT 10
      `
    ]);

    // Calculate enhanced predictions with growth rates
    const totalStudents = Number(basicStats[0]?.total_students ?? 0);
    const employedStudents = Number(basicStats[0]?.employed_students ?? 0);
    const overallEmploymentRate = totalStudents > 0 ? Number((employedStudents / totalStudents * 100).toFixed(2)) : 0;

    // Calculate growth rate from future projections
    const currentMonth = futureProjections[0];
    const prevMonth = futureProjections[1];
    const growthRate = currentMonth && prevMonth && prevMonth.registrations > 0 
      ? Math.round(((currentMonth.registrations - prevMonth.registrations) / prevMonth.registrations) * 100)
      : 15; // Default 15% growth

    const predictions = {
      nextYearStudents: Math.round(totalStudents * (1 + Math.abs(growthRate) / 100)), 
      avgGrowthRate: Math.abs(growthRate),
      topGrowthDistricts: districtData.slice(0, 3).map((d: any) => d.district),
      seasonalPeak: seasonalPatterns.reduce((max: any, month: any) => 
        Number(month.registrations) > Number(max?.registrations || 0) ? month.month : max, 'March')
    };

    // Enhanced recommendations based on actual data
    const marketingRecommendations = [
      {
        category: 'Market Expansion',
        recommendation: `Target ${districtData[0]?.district || 'high-potential'} district for expansion`,
        priority: 'High',
        reasoning: `${districtData[0]?.employment_rate || 0}% employment success rate indicates strong market potential`
      },
      {
        category: 'Education Programs',
        recommendation: `Focus on ${educationAnalysis[0]?.education_level || 'advanced'} qualification programs`,
        priority: 'High',
        reasoning: `${educationAnalysis[0]?.employment_rate || 0}% employment rate for this education level`
      },
      {
        category: 'Experience Development',
        recommendation: `Develop training programs for ${experienceAnalysis.find((e: any) => e.experience_level === 'No Experience')?.total_students || 0} students without experience`,
        priority: 'Medium',
        reasoning: 'Bridge the experience gap to improve employability'
      },
      {
        category: 'Seasonal Strategy',
        recommendation: `Increase enrollment campaigns during month ${predictions.seasonalPeak}`,
        priority: 'Medium',
        reasoning: 'Peak registration period for maximum impact'
      },
      {
        category: 'Partnership Development',
        recommendation: `Strengthen partnerships with ${companyData[0]?.company_name || 'top companies'} in ${companyData[0]?.industry || 'key industries'}`,
        priority: 'High',
        reasoning: `${companyData[0]?.total_employments || 0} recent hires show strong demand`
      }
    ];

    // Enhanced market trends from company data
    const marketTrends = companyData.map((company: any) => ({
      industry: company.industry,
      country: company.country,
      total_employments: company.total_employments,
      unique_students: company.unique_students,
      companies_involved: 1,
      first_employment: company.first_hire_date,
      latest_employment: company.latest_hire_date
    }));

    // Process seasonal patterns for better visualization
    const processedSeasonalPatterns = seasonalPatterns.map((pattern: any) => ({
      month: pattern.month,
      year: pattern.year,
      registrations: pattern.registrations,
      employments: pattern.employments
    }));

    // Enhanced future projections with growth calculations
    const enhancedFutureProjections = futureProjections.map((proj: any, index: number) => {
      const prevProj = futureProjections[index + 1];
      const growthRate = prevProj && prevProj.registrations > 0 
        ? Number(((proj.registrations - prevProj.registrations) / prevProj.registrations * 100).toFixed(2))
        : 0;
      
      return {
        month: proj.month,
        registrations: proj.registrations,
        prev_month: proj.prev_month || prevProj?.registrations || 0,
        growth_rate: growthRate
      };
    });

    // Return comprehensive data structure
    return NextResponse.json({
      employmentProbability: districtData || [],
      employmentProgress: employmentProgress || [],
      marketTrends: marketTrends || [],
      skillDemand: educationAnalysis || [],
      seasonalPatterns: processedSeasonalPatterns || [],
      districtPotential: districtData || [],
      ageAnalysis: ageAnalysis || [],
      qualificationImpact: educationAnalysis || [],
      experienceCorrelation: experienceAnalysis || [],
      futureProjections: enhancedFutureProjections || [],
      riskAssessment: riskAssessment || [],
      marketingInsights: [],
      companyPerformance: companyData || [],
      geographicDistribution: districtData || [],
      predictions,
      marketingRecommendations,
      overallEmploymentRate,
      insights: {
        totalStudents,
        totalEmployed: employedStudents,
        topIndustries: companyData.reduce((acc: any, company: any) => {
          acc[company.industry] = (acc[company.industry] || 0) + company.total_employments;
          return acc;
        }, {}),
        riskAreas: riskAssessment.filter((r: any) => r.risk_level === 'High Risk').length || 0,
        topPerformingDistricts: districtData.slice(0, 5).map((d: any) => d.district) || [],
        topPerformingQualifications: educationAnalysis.slice(0, 5).map((e: any) => e.education_level) || []
      }
    });
  } catch (error) {
    console.error("Pre-analysis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA4QjUAwxz6vvq_BySU1EYC3hKTkmzdVNQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function POST(request: Request) {
	try {
		const { prompt } = await request.json();
		const response = await fetch(GEMINI_API_URL + `?key=${GEMINI_API_KEY}` , {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }],
			}),
		});
		const data = await response.json();
		return NextResponse.json({ prediction: data.choices?.[0]?.message?.content || data });
	} catch (error) {
		const errorMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
		return NextResponse.json({ error: errorMsg }, { status: 500 });
	}
}
