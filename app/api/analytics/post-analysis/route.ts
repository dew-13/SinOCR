import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/db"
import { hasPermission } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!hasPermission(decoded.role, "VIEW_BASIC_ANALYTICS")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Fetch comprehensive post-analysis data based on actual database tables
    const [
      performanceMetrics,
      successStories,
      employmentTimeline,
      employmentAnalysis,
      companyPerformance,
      geographicDistribution,
      demographicAnalysis,
      qualificationSuccess,
      experienceImpact,
      monthlyTrends,
      yearlyComparison,
      retentionAnalysis,
      progressMetrics
    ] = await Promise.all([
      // Performance Metrics based on actual data
      sql`
        SELECT 
          COUNT(*) as total_students,
          COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END) as employed_students,
          COUNT(CASE WHEN s.status IN ('Active', 'active', 'Pending') THEN 1 END) as active_students,
          COUNT(CASE WHEN s.status = 'inactive' THEN 1 END) as inactive_students,
          ROUND(
            (COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as overall_success_rate
        FROM students s
      `,

      // Success Stories based on actual employment data
      sql`
        SELECT 
          s.full_name,
          s.education_qualification,
          s.district,
          e.position,
          e.employment_date,
          c.company_name,
          c.country,
          c.industry,
          EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM s.date_of_birth) as age,
          s.work_experience,
          s.other_qualifications,
          e.contract_duration_months
        FROM students s
        JOIN employees e ON s.id = e.student_id
        JOIN companies c ON e.company_id = c.id
        WHERE e.employment_date >= CURRENT_DATE - INTERVAL '12 months'
        ORDER BY e.employment_date DESC
        LIMIT 20
      `,

      // Employment Timeline Analysis based on actual data
      sql`
        SELECT 
          DATE_TRUNC('month', e.employment_date) as month,
          COUNT(*) as employments,
          COUNT(DISTINCT e.company_id) as companies_hired,
          COUNT(DISTINCT e.student_id) as students_employed
        FROM employees e
        WHERE e.employment_date >= CURRENT_DATE - INTERVAL '36 months'
        GROUP BY DATE_TRUNC('month', e.employment_date)
        ORDER BY month DESC
      `,

      // Employment Analysis by position and industry
      sql`
        SELECT 
          e.position,
          c.industry,
          c.country,
          COUNT(*) as employee_count,
          COUNT(DISTINCT e.student_id) as unique_students,
          COUNT(DISTINCT e.company_id) as companies_involved,
          AVG(e.contract_duration_months) as avg_contract_duration
        FROM employees e
        JOIN companies c ON e.company_id = c.id
        GROUP BY e.position, c.industry, c.country
        HAVING COUNT(*) >= 2
        ORDER BY employee_count DESC
      `,

      // Company Performance based on actual employment data
      sql`
        SELECT 
          c.company_name,
          c.country,
          c.industry,
          COUNT(e.id) as employee_count,
          COUNT(DISTINCT e.student_id) as unique_students,
          MIN(e.employment_date) as first_hire,
          MAX(e.employment_date) as latest_hire,
          ROUND(
            (COUNT(e.id)::DECIMAL / (SELECT COUNT(*) FROM students WHERE status IN ('Employed', 'employed'))) * 100, 2
          ) as market_share
        FROM companies c
        LEFT JOIN employees e ON c.id = e.company_id
        GROUP BY c.id, c.company_name, c.country, c.industry
        HAVING COUNT(e.id) > 0
        ORDER BY employee_count DESC
      `,

      // Geographic Distribution based on actual data
      sql`
        SELECT 
          s.district,
          s.province,
          COUNT(*) as total_students,
          COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END) as employed_students,
          ROUND(
            (COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as employment_rate,
          COUNT(CASE WHEN s.status IN ('Active', 'active', 'Pending') THEN 1 END) as active_students
        FROM students s
        GROUP BY s.district, s.province
        ORDER BY employment_rate DESC
      `,

      // Demographic Analysis based on actual student data
      sql`
        SELECT 
          s.sex,
          s.marital_status,
          COUNT(*) as total_students,
          COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END) as employed_students,
          ROUND(
            (COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as employment_rate,
          AVG(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM s.date_of_birth)) as avg_age
        FROM students s
        GROUP BY s.sex, s.marital_status
        ORDER BY employment_rate DESC
      `,

      // Qualification Success Analysis based on actual data
      sql`
        SELECT 
          'General' as education_qualification,
          COUNT(*) as total_students,
          COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END) as employed_students,
          ROUND(
            (COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as employment_rate,
          AVG(e.contract_duration_months) as avg_contract_duration
        FROM students s
        LEFT JOIN employees e ON s.id = e.student_id
        HAVING COUNT(*) >= 2
      `,

      // Experience Impact Analysis based on actual work experience data
      sql`
        SELECT 
          CASE 
            WHEN s.work_experience LIKE '%year%' OR s.work_experience LIKE '%years%' THEN 'Experienced'
            WHEN s.work_experience LIKE '%month%' OR s.work_experience LIKE '%months%' THEN 'Some Experience'
            WHEN s.work_experience IS NULL OR s.work_experience = '' THEN 'No Experience'
            ELSE 'Other'
          END as experience_level,
          COUNT(*) as total_students,
          COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END) as employed_students,
          ROUND(
            (COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as employment_rate
        FROM students s
        GROUP BY experience_level
        ORDER BY employment_rate DESC
      `,

      // Monthly Trends based on actual registration and employment data
      sql`
        SELECT 
          DATE_TRUNC('month', s.created_at) as month,
          COUNT(*) as registrations,
          COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END) as employments,
          ROUND(
            (COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as success_rate
        FROM students s
        WHERE s.created_at >= CURRENT_DATE - INTERVAL '24 months'
        GROUP BY DATE_TRUNC('month', s.created_at)
        ORDER BY month DESC
      `,

      // Yearly Comparison based on actual data
      sql`
        SELECT 
          EXTRACT(YEAR FROM s.created_at) as year,
          COUNT(*) as total_registrations,
          COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END) as total_employments,
          ROUND(
            (COUNT(CASE WHEN s.status IN ('Employed', 'employed') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as yearly_success_rate
        FROM students s
        WHERE s.created_at >= CURRENT_DATE - INTERVAL '60 months'
        GROUP BY EXTRACT(YEAR FROM s.created_at)
        ORDER BY year DESC
      `,

      // Retention Analysis based on actual employment data
      sql`
        SELECT 
          c.company_name,
          c.industry,
          COUNT(DISTINCT e.student_id) as total_hires,
          COUNT(DISTINCT CASE WHEN e.employment_date <= CURRENT_DATE - INTERVAL '12 months' THEN e.student_id END) as long_term_employees,
          ROUND(
            (COUNT(DISTINCT CASE WHEN e.employment_date <= CURRENT_DATE - INTERVAL '12 months' THEN e.student_id END)::DECIMAL / 
             COUNT(DISTINCT e.student_id)) * 100, 2
          ) as retention_rate
        FROM companies c
        JOIN employees e ON c.id = e.company_id
        GROUP BY c.id, c.company_name, c.industry
        HAVING COUNT(DISTINCT e.student_id) >= 2
        ORDER BY retention_rate DESC
      `,

      // Progress Metrics based on actual employment data
      sql`
        SELECT 
          e.position,
          c.industry,
          COUNT(*) as employee_count,
          AVG(e.contract_duration_months) as avg_contract_duration,
          COUNT(DISTINCT e.student_id) as unique_students,
          CASE 
            WHEN AVG(e.contract_duration_months) >= 24 THEN 'Long-term'
            WHEN AVG(e.contract_duration_months) >= 12 THEN 'Medium-term'
            ELSE 'Short-term'
          END as contract_type
        FROM employees e
        JOIN companies c ON e.company_id = c.id
        GROUP BY e.position, c.industry
        HAVING COUNT(*) >= 2
        ORDER BY employee_count DESC
      `
    ])

    // Calculate comprehensive metrics based on actual data
    const metrics = performanceMetrics[0]
    const totalStudents = Number(metrics?.total_students || 0)
    const employedStudents = Number(metrics?.employed_students || 0)
    const overallSuccessRate = Number(metrics?.overall_success_rate || 0)

    // Generate insights based on actual data
    const insights = {
      totalStudents,
      employedStudents,
      activeStudents: Number(metrics?.active_students || 0),
      inactiveStudents: Number(metrics?.inactive_students || 0),
      overallSuccessRate,
      topPerformingCompany: companyPerformance[0]?.company_name || 'N/A',
      mostSuccessfulDistrict: geographicDistribution[0]?.district || 'N/A',
      bestQualification: qualificationSuccess[0]?.education_qualification || 'N/A',
      retentionRate: retentionAnalysis.length > 0 ? 
        (retentionAnalysis.reduce((sum: number, r: any) => sum + Number(r.retention_rate), 0) / retentionAnalysis.length).toFixed(2) : 0,
      topIndustries: employmentAnalysis.reduce((acc: any, emp: any) => {
        acc[emp.industry] = (acc[emp.industry] || 0) + Number(emp.employee_count)
        return acc
      }, {}),
      employmentProgress: {
        totalEmployments: employmentTimeline.reduce((sum: number, month: any) => sum + Number(month.employments), 0),
        uniqueCompanies: companyPerformance.length,
        averageContractDuration: progressMetrics.length > 0 ? 
          (progressMetrics.reduce((sum: number, p: any) => sum + Number(p.avg_contract_duration || 0), 0) / progressMetrics.length).toFixed(1) : 0
      }
    }

    return NextResponse.json({
      performanceMetrics: metrics,
      successStories,
      employmentTimeline,
      employmentAnalysis,
      companyPerformance,
      geographicDistribution,
      demographicAnalysis,
      qualificationSuccess,
      experienceImpact,
      monthlyTrends,
      yearlyComparison,
      retentionAnalysis,
      progressMetrics,
      insights
    })
  } catch (error) {
    console.error("Post-analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 