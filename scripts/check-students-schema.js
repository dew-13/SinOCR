const { sql } = require('../lib/db.ts');

async function checkStudentsSchema() {
  try {
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'students'
      ORDER BY ordinal_position
    `;
    
    console.log('Students table columns:');
    result.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Also check a few sample rows
    console.log('\nSample data from students table:');
    const sampleData = await sql`SELECT * FROM students LIMIT 1`;
    if (sampleData.length > 0) {
      console.log('Column names in actual data:', Object.keys(sampleData[0]));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkStudentsSchema();
