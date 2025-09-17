const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function debugAnalyticsAPI() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 DEBUGGING ANALYTICS API DISCREPANCY');
    console.log('======================================\n');
    
    // Test the exact queries from the analytics API
    console.log('1️⃣ Testing NEW analytics API queries (should be 27 and 47):');
    const newTotalQuery = `SELECT COUNT(*) as count FROM students WHERE status IN ('Active', 'active', 'Pending')`;
    const newEmployedQuery = `SELECT COUNT(*) as count FROM students WHERE status IN ('Employed', 'employed')`;
    
    const newTotalResult = await client.query(newTotalQuery);
    const newEmployedResult = await client.query(newEmployedQuery);
    
    console.log(`   Registered Students (new): ${newTotalResult.rows[0].count}`);
    console.log(`   Employed Students (new): ${newEmployedResult.rows[0].count}\n`);
    
    // Test the old queries (what might still be running)
    console.log('2️⃣ Testing OLD analytics API queries (what dashboard might be using):');
    const oldTotalQuery = `SELECT COUNT(*) as count FROM students WHERE status = 'active'`;
    const oldEmployedQuery = `SELECT COUNT(*) as count FROM students WHERE status = 'employed'`;
    
    const oldTotalResult = await client.query(oldTotalQuery);
    const oldEmployedResult = await client.query(oldEmployedQuery);
    
    console.log(`   Registered Students (old): ${oldTotalResult.rows[0].count}`);
    console.log(`   Employed Students (old): ${oldEmployedResult.rows[0].count}\n`);
    
    // Check if there are any cached results or alternative data sources
    console.log('3️⃣ Checking employees table (legacy employment tracking):');
    const employeesQuery = `SELECT COUNT(*) as count FROM employees`;
    const employeesResult = await client.query(employeesQuery);
    console.log(`   Employees table count: ${employeesResult.rows[0].count}\n`);
    
    // Check all status values
    console.log('4️⃣ Current status distribution:');
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
      console.log(`   ${row.status}: ${row.count} students`);
    });
    
    console.log('\n5️⃣ DIAGNOSIS:');
    if (oldEmployedResult.rows[0].count == 4) {
      console.log('❌ Dashboard is using OLD analytics queries!');
      console.log('   The frontend is still calling the old API endpoint or there\'s a cache issue.');
    } else {
      console.log('✅ Analytics queries are updated, checking other possibilities...');
    }
    
    // Check if the API file was actually updated
    console.log('\n6️⃣ NEXT STEPS:');
    console.log('   1. Check if analytics API file changes were saved');
    console.log('   2. Restart the development server');
    console.log('   3. Clear browser cache');
    console.log('   4. Check if there are multiple analytics endpoints');
    
  } catch (error) {
    console.error('❌ Error debugging analytics:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

debugAnalyticsAPI();