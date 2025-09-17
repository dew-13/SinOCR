const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAndFixStatusCounts() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking current student status distribution...\n');
    
    // Check actual status values
    const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM students
      GROUP BY status
      ORDER BY count DESC;
    `;
    
    const statusResult = await client.query(statusQuery);
    console.log('📊 CURRENT STATUS DISTRIBUTION:');
    console.log('================================');
    
    statusResult.rows.forEach(row => {
      console.log(`${row.status}: ${row.count} students (${row.percentage}%)`);
    });
    
    // Check total students
    const totalQuery = `SELECT COUNT(*) as total FROM students;`;
    const totalResult = await client.query(totalQuery);
    console.log(`\n📈 Total Students in Database: ${totalResult.rows[0].total}`);
    
    // Check placement stats
    const placementQuery = `
      SELECT 
        COUNT(*) as total_placements,
        COUNT(DISTINCT student_id) as unique_students_placed
      FROM placements;
    `;
    
    const placementResult = await client.query(placementQuery);
    console.log(`📋 Total Placements: ${placementResult.rows[0].total_placements}`);
    console.log(`👥 Unique Students with Placements: ${placementResult.rows[0].unique_students_placed}`);
    
    // Test current analytics queries (showing the issue)
    console.log('\n🔍 TESTING CURRENT ANALYTICS QUERIES:');
    console.log('=====================================');
    
    const activeStudentsQuery = `SELECT COUNT(*) as count FROM students WHERE status = 'active'`;
    const employedStudentsQuery = `SELECT COUNT(*) as count FROM students WHERE status = 'employed'`;
    
    const activeResult = await client.query(activeStudentsQuery);
    const employedResult = await client.query(employedStudentsQuery);
    
    console.log(`Active Students (analytics query): ${activeResult.rows[0].count}`);
    console.log(`Employed Students (analytics query): ${employedResult.rows[0].count}`);
    
    // Show what the queries SHOULD return
    console.log('\n✅ CORRECT ANALYTICS QUERIES:');
    console.log('==============================');
    
    const correctActiveQuery = `SELECT COUNT(*) as count FROM students WHERE status IN ('Active', 'active', 'Pending')`;
    const correctEmployedQuery = `SELECT COUNT(*) as count FROM students WHERE status IN ('Employed', 'employed')`;
    
    const correctActiveResult = await client.query(correctActiveQuery);
    const correctEmployedResult = await client.query(correctEmployedQuery);
    
    console.log(`Registered Students (Active + Pending): ${correctActiveResult.rows[0].count}`);
    console.log(`Employed Students (all employed statuses): ${correctEmployedResult.rows[0].count}`);
    
    // Show students in placements
    const studentsWithPlacementsQuery = `
      SELECT COUNT(DISTINCT s.id) as count
      FROM students s
      JOIN placements p ON s.id = p.student_id;
    `;
    
    const studentsWithPlacementsResult = await client.query(studentsWithPlacementsQuery);
    console.log(`Students with Active Placements: ${studentsWithPlacementsResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking status counts:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndFixStatusCounts();