const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function moveStudentsToEmployed() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking available students for employment placement...');
    
    // Get students who are not already in placements
    const availableStudentsQuery = `
      SELECT s.id, s.full_name, s.mobile_phone, s.expected_job_category, s.status
      FROM students s
      LEFT JOIN placements p ON s.id = p.student_id
      WHERE p.student_id IS NULL 
        AND s.status IN ('Active', 'active', 'Pending')
      ORDER BY s.id
      LIMIT 35;
    `;
    
    const availableResult = await client.query(availableStudentsQuery);
    console.log(`📊 Found ${availableResult.rows.length} students available for employment`);
    
    if (availableResult.rows.length < 35) {
      console.log(`⚠️  Warning: Only ${availableResult.rows.length} students available, less than requested 35`);
    }
    
    if (availableResult.rows.length === 0) {
      console.log('❌ No students available for employment placement');
      return;
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Sample companies for employment placements
    const companies = [
      { name: 'Tech Solutions Lanka', address: 'Colombo 03, Sri Lanka', industry: 'Information Technology' },
      { name: 'Ceylon Manufacturing Ltd', address: 'Gampaha, Sri Lanka', industry: 'Manufacturing & Engineering' },
      { name: 'Health Care Plus', address: 'Kandy, Sri Lanka', industry: 'Healthcare & Nursing Care' },
      { name: 'Construction Masters', address: 'Negombo, Sri Lanka', industry: 'Construction & Infrastructure' },
      { name: 'Agro Food Processing', address: 'Anuradhapura, Sri Lanka', industry: 'Agriculture & Food Processing' },
      { name: 'Island Fisheries Co', address: 'Galle, Sri Lanka', industry: 'Fisheries & Aquaculture' },
      { name: 'Paradise Hotels Group', address: 'Bentota, Sri Lanka', industry: 'Hospitality & Tourism' },
      { name: 'Express Logistics', address: 'Colombo 15, Sri Lanka', industry: 'Logistics & Transportation' },
      { name: 'Business Services Lanka', address: 'Colombo 07, Sri Lanka', industry: 'Business Services' },
      { name: 'Textile Industries Ltd', address: 'Katunayake, Sri Lanka', industry: 'Textile & Manufacturing' },
      { name: 'Security Plus Services', address: 'Colombo 05, Sri Lanka', industry: 'Security Services' },
      { name: 'Digital Solutions Hub', address: 'Malabe, Sri Lanka', industry: 'Information Technology' },
      { name: 'Medical Center Group', address: 'Maharagama, Sri Lanka', industry: 'Healthcare & Nursing Care' },
      { name: 'Engineering Works', address: 'Polgahawela, Sri Lanka', industry: 'Manufacturing & Engineering' },
      { name: 'Royal Construction', address: 'Kurunegala, Sri Lanka', industry: 'Construction & Infrastructure' }
    ];
    
    const contractTypes = ['Full-time', 'Contract', 'Permanent'];
    const salaryRanges = [45000, 55000, 65000, 75000, 85000, 95000, 105000];
    
    let placementCount = 0;
    
    for (const student of availableResult.rows) {
      const company = companies[placementCount % companies.length];
      const salary = salaryRanges[Math.floor(Math.random() * salaryRanges.length)];
      const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
      
      // Calculate start and end dates
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 12)); // Started within last year
      
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 2 + Math.floor(Math.random() * 3)); // 2-4 year contracts
      
      const insertPlacementQuery = `
        INSERT INTO placements (
          student_id,
          company_name,
          company_address,
          industry,
          start_date,
          end_date,
          visa_type,
          resident_address,
          emergency_contact,
          language_proficiency
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      const position = student.expected_job_category || 'General Worker';
      const visaType = 'Local Employment Visa';
      const residentAddress = company.address;
      const emergencyContact = '+94 11 2345678 (Company HR)';
      const languageProficiency = 'English - Intermediate';
      
      await client.query(insertPlacementQuery, [
        student.id,
        company.name,
        company.address,
        company.industry,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        visaType,
        residentAddress,
        emergencyContact,
        languageProficiency
      ]);
      
      // Update student status to 'Employed'
      await client.query(
        'UPDATE students SET status = $1 WHERE id = $2',
        ['Employed', student.id]
      );
      
      placementCount++;
      console.log(`✅ Moved ${student.full_name} to ${company.name} as ${position}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`\n🎉 Successfully moved ${placementCount} students to employment placements!`);
    
    // Generate summary report
    console.log('\n📊 EMPLOYMENT PLACEMENT SUMMARY');
    console.log('================================');
    
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_employed,
        COUNT(DISTINCT company_name) as companies_involved
      FROM placements
      WHERE start_date >= CURRENT_DATE - INTERVAL '1 day';
    `;
    
    const summaryResult = await client.query(summaryQuery);
    const summary = summaryResult.rows[0];
    
    console.log(`👥 Total students moved to employment: ${summary.total_employed}`);
    console.log(`🏢 Companies involved: ${summary.companies_involved}`);
    
    // Show placements by company
    console.log('\n🏢 PLACEMENTS BY COMPANY');
    console.log('========================');
    
    const companyBreakdownQuery = `
      SELECT 
        company_name,
        COUNT(*) as student_count,
        industry
      FROM placements
      WHERE start_date >= CURRENT_DATE - INTERVAL '1 day'
      GROUP BY company_name, industry
      ORDER BY student_count DESC;
    `;
    
    const companyResult = await client.query(companyBreakdownQuery);
    
    companyResult.rows.forEach(row => {
      console.log(`${row.company_name} (${row.industry}): ${row.student_count} students`);
    });
    
    // Show status distribution
    console.log('\n📈 STUDENT STATUS DISTRIBUTION');
    console.log('==============================');
    
    const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM students
      GROUP BY status
      ORDER BY count DESC;
    `;
    
    const statusResult = await client.query(statusQuery);
    
    statusResult.rows.forEach(row => {
      console.log(`${row.status}: ${row.count} students`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error moving students to employment:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await moveStudentsToEmployed();
    console.log('\n✅ Employment placement process completed successfully!');
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();