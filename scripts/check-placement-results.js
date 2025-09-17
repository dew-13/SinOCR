const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkPlacementResults() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking placement results...\n');
    
    // Check total placements
    const totalQuery = `SELECT COUNT(*) as total FROM placements;`;
    const totalResult = await client.query(totalQuery);
    console.log(`📊 Total placements in database: ${totalResult.rows[0].total}`);
    
    // Check recent placements (last 24 hours)
    const recentQuery = `
      SELECT 
        s.full_name,
        p.company_name,
        p.industry,
        p.start_date,
        p.visa_type
      FROM placements p
      JOIN students s ON p.student_id = s.id
      ORDER BY p.placement_id DESC
      LIMIT 35;
    `;
    
    const recentResult = await client.query(recentQuery);
    console.log(`\n📋 Recent ${recentResult.rows.length} placements:`);
    console.log('================================================');
    
    recentResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.full_name} → ${row.company_name} (${row.industry})`);
      console.log(`   Start Date: ${row.start_date}, Visa: ${row.visa_type}`);
    });
    
    // Check student status distribution
    const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM students
      GROUP BY status
      ORDER BY count DESC;
    `;
    
    const statusResult = await client.query(statusQuery);
    console.log('\n📈 STUDENT STATUS DISTRIBUTION');
    console.log('==============================');
    
    statusResult.rows.forEach(row => {
      console.log(`${row.status}: ${row.count} students`);
    });
    
    // Check placements by company
    const companyQuery = `
      SELECT 
        company_name,
        industry,
        COUNT(*) as student_count
      FROM placements
      GROUP BY company_name, industry
      ORDER BY student_count DESC;
    `;
    
    const companyResult = await client.query(companyQuery);
    console.log('\n🏢 PLACEMENTS BY COMPANY');
    console.log('========================');
    
    companyResult.rows.forEach(row => {
      console.log(`${row.company_name} (${row.industry}): ${row.student_count} students`);
    });
    
  } catch (error) {
    console.error('❌ Error checking results:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkPlacementResults();