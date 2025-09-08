import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// User management
export async function getUsers() {
  try {
    return await sql`
      SELECT id, email, full_name, role, created_at, is_active,
             (SELECT full_name FROM users u2 WHERE u2.id = users.created_by) as created_by_name
      FROM users 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, email, password_hash, full_name, role, is_active 
      FROM users 
      WHERE email = ${email} AND is_active = true
    `
    return result[0]
  } catch (error) {
    console.error("Error fetching user by email:", error)
    throw error
  }
}

export async function getUserById(id: number) {
  try {
    const result = await sql`
      SELECT id, email, full_name, role, created_at, is_active,
             (SELECT full_name FROM users u2 WHERE u2.id = users.created_by) as created_by_name
      FROM users 
      WHERE id = ${id} AND is_active = true
    `
    return result[0]
  } catch (error) {
    console.error("Error fetching user by id:", error)
    throw error
  }
}

export async function createUser(userData: {
  email: string
  passwordHash: string
  fullName: string
  role: string
  createdBy: number
}) {
  return await sql`
    INSERT INTO users (email, password_hash, full_name, role, created_by)
    VALUES (${userData.email}, ${userData.passwordHash}, ${userData.fullName}, ${userData.role}, ${userData.createdBy})
    RETURNING id, email, full_name, role
  `
}

export async function updateUser(
  id: number,
  userData: {
    email?: string
    fullName?: string
    role?: string
    passwordHash?: string
  },
) {
  const fields = []
  const values = []
  let idx = 1

  if (userData.email) {
    fields.push(`email = $${++idx}`)
    values.push(userData.email)
  }
  if (userData.fullName) {
    fields.push(`full_name = $${++idx}`)
    values.push(userData.fullName)
  }
  if (userData.role) {
    fields.push(`role = $${++idx}`)
    values.push(userData.role)
  }
  if (userData.passwordHash) {
    fields.push(`password_hash = $${++idx}`)
    values.push(userData.passwordHash)
  }

  if (fields.length === 0) return null

  fields.push(`updated_at = CURRENT_TIMESTAMP`)

  // id is always the first parameter
  return await sql(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING id, email, full_name, role`,
    [id, ...values]
  )
}

export async function deleteUser(id: number) {
  return await sql`
    DELETE FROM users
    WHERE id = ${id}
    RETURNING id
  `
}

// Student management
export async function getStudents(options?: {
  search?: string,
  marital_status?: string,
  sex?: string,
  district?: string,
  province?: string,
  has_driving_license?: string,
  format?: string,
}) {
  let whereClauses = []
  let values = []
  let idx = 1

  if (options?.search) {
    whereClauses.push(`(national_id ILIKE $${idx} OR passport_id ILIKE $${idx} OR full_name ILIKE $${idx} OR mobile_phone ILIKE $${idx})`)
    values.push(`%${options.search}%`)
    idx++
  }
  if (options?.marital_status) {
    whereClauses.push(`marital_status = $${idx}`)
    values.push(options.marital_status)
    idx++
  }
  if (options?.sex) {
    whereClauses.push(`sex = $${idx}`)
    values.push(options.sex)
    idx++
  }
  if (options?.district) {
    whereClauses.push(`district = $${idx}`)
    values.push(options.district)
    idx++
  }
  if (options?.province) {
    whereClauses.push(`province = $${idx}`)
    values.push(options.province)
    idx++
  }
  if (options?.has_driving_license) {
    whereClauses.push(`has_driving_license = $${idx}`)
    values.push(options.has_driving_license === 'true')
    idx++
  }

  let where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
  let query = `SELECT * FROM students ${where} ORDER BY created_at DESC`

  // If CSV export, return all rows (no limit)
  const result = await sql(query, values)
  return result
}

export async function getStudentById(id: number) {
  const result = await sql`
    SELECT s.*, 
           (SELECT full_name FROM users WHERE id = s.created_by) as created_by_name,
           e.id as employment_id,
           e.company_id,
           e.position,
           e.salary,
           e.employment_date,
           e.contract_duration_months,
           c.company_name,
           c.country as company_country
    FROM students s
    LEFT JOIN employees e ON s.id = e.student_id
    LEFT JOIN companies c ON e.company_id = c.id
    WHERE s.id = ${id}
  `
  return result[0]
}

export async function createStudent(studentData: any) {
  return await sql`
    INSERT INTO students (
      full_name, permanent_address, district, province, date_of_birth,
      national_id, passport_id, passport_expired_date, sex, marital_status,
      spouse_name, number_of_children, mobile_phone, whatsapp_number,
      has_driving_license, vehicle_type, email_address, education_ol, education_al,
      other_qualifications, work_experience, work_experience_abroad, cv_photo_url, created_by
    ) VALUES (
      ${studentData.fullName}, ${studentData.permanentAddress}, ${studentData.district}, 
      ${studentData.province}, ${studentData.dateOfBirth}, ${studentData.nationalId},
      ${studentData.passportId}, ${studentData.passportExpiredDate}, ${studentData.sex},
      ${studentData.maritalStatus}, ${studentData.spouseName}, ${studentData.numberOfChildren},
      ${studentData.mobilePhone}, ${studentData.whatsappNumber}, ${studentData.hasDrivingLicense},
      ${studentData.vehicleType}, ${studentData.emailAddress}, ${studentData.educationOL}, ${studentData.educationAL},
      ${studentData.otherQualifications}, ${studentData.workExperience}, 
      ${studentData.workExperienceAbroad}, ${studentData.cvPhotoUrl}, ${studentData.createdBy}
    )
    RETURNING *
  `
}

export async function updateStudent(id: number, studentData: any) {
  return await sql`
    UPDATE students SET
      full_name = ${studentData.fullName},
      permanent_address = ${studentData.permanentAddress},
      district = ${studentData.district},
      province = ${studentData.province},
      date_of_birth = ${studentData.dateOfBirth},
      national_id = ${studentData.nationalId},
      passport_id = ${studentData.passportId},
      passport_expired_date = ${studentData.passportExpiredDate},
      sex = ${studentData.sex},
      marital_status = ${studentData.maritalStatus},
      spouse_name = ${studentData.spouseName},
      number_of_children = ${studentData.numberOfChildren},
      mobile_phone = ${studentData.mobilePhone},
      whatsapp_number = ${studentData.whatsappNumber},
      has_driving_license = ${studentData.hasDrivingLicense},
      vehicle_type = ${studentData.vehicleType},
      email_address = ${studentData.emailAddress},
      education_ol = ${studentData.educationOL},
      education_al = ${studentData.educationAL},
      other_qualifications = ${studentData.otherQualifications},
      work_experience = ${studentData.workExperience},
      work_experience_abroad = ${studentData.workExperienceAbroad},
      cv_photo_url = ${studentData.cvPhotoUrl},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
}

export async function deleteStudent(id: number) {
  return await sql`
    UPDATE students 
    SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING id
  `
}

// Company management
export async function getCompanies() {
  return await sql`
    SELECT c.*, 
           (SELECT full_name FROM users WHERE id = c.created_by) as created_by_name,
           (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id) as employee_count
    FROM companies c
    WHERE is_active = true 
    ORDER BY created_at DESC
  `
}

export async function getCompanyById(id: number) {
  const result = await sql`
    SELECT c.*,
           (SELECT full_name FROM users WHERE id = c.created_by) as created_by_name
    FROM companies c
    WHERE c.id = ${id} AND c.is_active = true
  `
  return result[0]
}

export async function createCompany(companyData: {
  companyName: string
  country: string
  industry?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  createdBy: number
}) {
  return await sql`
    INSERT INTO companies (company_name, country, industry, contact_person, contact_email, contact_phone, address, created_by)
    VALUES (${companyData.companyName}, ${companyData.country}, ${companyData.industry}, 
            ${companyData.contactPerson}, ${companyData.contactEmail}, ${companyData.contactPhone}, 
            ${companyData.address}, ${companyData.createdBy})
    RETURNING *
  `
}

export async function updateCompany(id: number, companyData: any) {
  return await sql`
    UPDATE companies SET
      company_name = ${companyData.companyName},
      country = ${companyData.country},
      industry = ${companyData.industry},
      contact_person = ${companyData.contactPerson},
      contact_email = ${companyData.contactEmail},
      contact_phone = ${companyData.contactPhone},
      address = ${companyData.address},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
}

export async function deleteCompany(id: number) {
  return await sql`
    DELETE FROM companies
    WHERE id = ${id}
    RETURNING id
  `
}

// Employee management
export async function createEmployee(employeeData: {
  studentId: number
  companyId: number
  position: string
  salary?: number
  employmentDate: string
  contractDurationMonths?: number
  createdBy: number
}) {
  // Start transaction
  await sql`BEGIN`

  try {
    // Update student status to employed
    await sql`
      UPDATE students 
      SET status = 'employed', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${employeeData.studentId}
    `

    // Insert employee record
    const result = await sql`
      INSERT INTO employees (student_id, company_id, position, salary, employment_date, contract_duration_months, created_by)
      VALUES (${employeeData.studentId}, ${employeeData.companyId}, ${employeeData.position}, 
              ${employeeData.salary}, ${employeeData.employmentDate}, ${employeeData.contractDurationMonths}, ${employeeData.createdBy})
      RETURNING *
    `

    await sql`COMMIT`
    return result
  } catch (error) {
    await sql`ROLLBACK`
    throw error
  }
}

export async function getEmployees() {
  return await sql`
    SELECT 
      e.*,
      s.full_name as student_name,
      s.national_id,
      s.mobile_phone,
      c.company_name,
      c.country,
      c.industry,
      (SELECT full_name FROM users WHERE id = e.created_by) as created_by_name
    FROM employees e
    JOIN students s ON e.student_id = s.id
    JOIN companies c ON e.company_id = c.id
    ORDER BY e.employment_date DESC
  `
}

export async function getEmployeeById(id: number) {
  const result = await sql`
    SELECT 
      e.*,
      s.full_name as student_name,
      s.national_id,
      s.mobile_phone,
      s.email_address,
      c.company_name,
      c.country,
      c.industry,
      c.contact_person,
      c.contact_email,
      (SELECT full_name FROM users WHERE id = e.created_by) as created_by_name
    FROM employees e
    JOIN students s ON e.student_id = s.id
    JOIN companies c ON e.company_id = c.id
    WHERE e.id = ${id}
  `
  return result[0]
}

// Analytics - Descriptive (Post Analysis)
export async function getDescriptiveAnalytics() {
  const [
    totalStudents,
    employedStudents,
    districtStats,
    provinceStats,
    monthlyRegistrations,
    employmentByCountry,
    topCompanies,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM students WHERE status = 'active'`,
    sql`SELECT COUNT(*) as count FROM students WHERE status = 'employed'`,
    sql`
      SELECT district, COUNT(*) as count 
      FROM students 
      GROUP BY district 
      ORDER BY count DESC 
      LIMIT 10
    `,
    sql`
      SELECT province, COUNT(*) as count 
      FROM students 
      GROUP BY province 
      ORDER BY count DESC
    `,
    sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM students 
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `,
    sql`
      SELECT 
        c.country,
        COUNT(*) as employee_count
      FROM employees e
      JOIN companies c ON e.company_id = c.id
      GROUP BY c.country
      ORDER BY employee_count DESC
    `,
    sql`
      SELECT 
        c.company_name,
        c.country,
        COUNT(*) as employee_count
      FROM employees e
      JOIN companies c ON e.company_id = c.id
      GROUP BY c.id, c.company_name, c.country
      ORDER BY employee_count DESC
      LIMIT 5
    `,
  ])

  return {
    totalStudents: Number.parseInt(totalStudents[0]?.count || 0),
    employedStudents: Number.parseInt(employedStudents[0]?.count || 0),
    districtStats,
    provinceStats,
    monthlyRegistrations,
    employmentByCountry,
    topCompanies,
  }
}

// Analytics - Predictive (Pre Analysis) - Owner Only
export async function getPredictiveAnalytics() {
  const [yearlyTrend, seasonalData, employmentSuccess, districtGrowth, provinceGrowth] = await Promise.all([
    sql`
      SELECT 
        EXTRACT(YEAR FROM created_at) as year,
        COUNT(*) as registrations,
        COUNT(CASE WHEN status = 'employed' THEN 1 END) as employed
      FROM students 
      WHERE created_at >= CURRENT_DATE - INTERVAL '3 years'
      GROUP BY EXTRACT(YEAR FROM created_at)
      ORDER BY year
    `,
    sql`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as registrations,
        AVG(COUNT(*)) OVER() as avg_registrations
      FROM students 
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `,
    sql`
      SELECT 
        province,
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'employed' THEN 1 END) as employed_students,
        ROUND(
          (COUNT(CASE WHEN status = 'employed' THEN 1 END)::float / COUNT(*)::float) * 100, 
          2
        ) as success_rate
      FROM students 
      GROUP BY province
      ORDER BY success_rate DESC
    `,
    sql`
      SELECT 
        district,
        COUNT(*) as current_count,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '1 year' THEN 1 END) as recent_count,
        ROUND(
          (COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '1 year' THEN 1 END)::float / 
           NULLIF(COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '2 years' AND created_at < CURRENT_DATE - INTERVAL '1 year' THEN 1 END), 0)::float) * 100,
          2
        ) as growth_rate
      FROM students 
      GROUP BY district
      HAVING COUNT(*) > 5
      ORDER BY growth_rate DESC NULLS LAST
      LIMIT 10
    `,
    sql`
      SELECT 
        province,
        COUNT(*) as current_count,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '1 year' THEN 1 END) as recent_count,
        ROUND(
          (COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '1 year' THEN 1 END)::float / 
           NULLIF(COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '2 years' AND created_at < CURRENT_DATE - INTERVAL '1 year' THEN 1 END), 0)::float) * 100,
          2
        ) as growth_rate
      FROM students 
      GROUP BY province
      ORDER BY growth_rate DESC NULLS LAST
    `,
  ])

  // Calculate predictions based on trends
  const currentYear = new Date().getFullYear()
  const lastYearData = yearlyTrend.find((y) => y.year === currentYear - 1)
  const avgGrowthRate =
    yearlyTrend.length > 1
      ? (yearlyTrend[yearlyTrend.length - 1].registrations - yearlyTrend[0].registrations) / (yearlyTrend.length - 1)
      : 0

  const predictedNextYear = lastYearData ? Math.round(lastYearData.registrations + avgGrowthRate) : 0

  return {
    yearlyTrend,
    seasonalData,
    employmentSuccess,
    districtGrowth,
    provinceGrowth,
    predictions: {
      nextYearStudents: predictedNextYear,
      avgGrowthRate: Math.round(avgGrowthRate),
      topGrowthDistricts: districtGrowth.slice(0, 5),
      topGrowthProvinces: provinceGrowth.slice(0, 3),
    },
  }
}

// Placement management
export async function createPlacement(placementData: {
  studentId: number
  startDate: string
  endDate: string
  visaType: string
  companyName: string
  companyAddress: string
  industry: string
  residentAddress: string
  emergencyContact: string
  languageProficiency: string
  photo?: string
  createdBy: number
}) {
  console.log("createPlacement called with data:", placementData)
  
  // Start transaction
  await sql`BEGIN`

  try {
    // Update student status to employed
    console.log("Updating student status...")
    await sql`
      UPDATE students 
      SET status = 'employed', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${placementData.studentId}
    `

    // Insert placement record
    console.log("Inserting placement record...")
    const result = await sql`
      INSERT INTO placements (
        student_id, start_date, end_date, visa_type, company_name, 
        company_address, industry, resident_address, emergency_contact, 
        language_proficiency, photo
      )
      VALUES (
        ${placementData.studentId}, ${placementData.startDate}, ${placementData.endDate}, 
        ${placementData.visaType}, ${placementData.companyName}, ${placementData.companyAddress}, 
        ${placementData.industry}, ${placementData.residentAddress}, ${placementData.emergencyContact}, 
        ${placementData.languageProficiency}, ${placementData.photo || null}
      )
      RETURNING *
    `

    console.log("Placement created successfully:", result)
    await sql`COMMIT`
    return result
  } catch (error) {
    console.error("Error in createPlacement:", error)
    await sql`ROLLBACK`
    throw error
  }
}

export async function getPlacements() {
  return await sql`
    SELECT 
      p.*,
      s.full_name as student_name,
      s.national_id,
      s.passport_id,
      s.mobile_phone,
      s.email_address,
      (SELECT full_name FROM users WHERE id = s.created_by) as created_by_name
    FROM placements p
    JOIN students s ON p.student_id = s.id
    ORDER BY p.start_date DESC
  `
}

export async function getPlacementById(id: number) {
  const result = await sql`
    SELECT 
      p.*,
      s.full_name as student_name,
      s.national_id,
      s.mobile_phone,
      s.email_address,
      s.permanent_address,
      s.district,
      s.province,
      (SELECT full_name FROM users WHERE id = s.created_by) as created_by_name
    FROM placements p
    JOIN students s ON p.student_id = s.id
    WHERE p.placement_id = ${id}
  `
  return result[0]
}
