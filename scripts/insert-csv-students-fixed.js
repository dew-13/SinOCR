/**
 * CSV to Database Insertion Script (Fixed Version)
 * Reads registeredstudents.csv and inserts all student data directly into the database
 * Fixed to match actual database schema
 */

const fs = require('fs');
const path = require('path');

// For Neon database connection
const { neon } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// CSV parsing function
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      // Simple CSV parsing (handles quoted fields)
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Push the last value
      
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      data.push(record);
    }
  }
  
  return data;
}

// Convert CSV date strings to SQL date format
function convertDate(dateStr) {
  if (!dateStr || dateStr === '') return null;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (error) {
    return null;
  }
}

// Convert CSV timestamp to SQL timestamp
function convertTimestamp(timestampStr) {
  if (!timestampStr || timestampStr === '') return new Date().toISOString();
  
  try {
    const date = new Date(timestampStr);
    if (isNaN(date.getTime())) return new Date().toISOString();
    return date.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

// Map CSV status to database status
function mapStatus(csvStatus) {
  switch (csvStatus.toLowerCase()) {
    case 'active': return 'Active';
    case 'employed': return 'Employed';
    case 'pending': return 'Pending';
    default: return 'Pending';
  }
}

// Main insertion function
async function insertStudents() {
  try {
    console.log('🔍 Reading CSV file...');
    
    // Read the CSV file
    const csvPath = path.join(__dirname, '../data/registeredstudents.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    console.log('📊 Parsing CSV data...');
    const students = parseCSV(csvContent);
    
    console.log(`✅ Found ${students.length} students in CSV`);
    
    // Test database connection
    console.log('🔄 Testing database connection...');
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Check table structure
    console.log('🔍 Checking table structure...');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Available columns:', columns.map(c => c.column_name).join(', '));
    
    // Add missing columns if they don't exist
    console.log('🔧 Adding missing columns...');
    try {
      await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS education_ol BOOLEAN DEFAULT false`;
      await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS education_al BOOLEAN DEFAULT false`;
      console.log('✅ Missing columns added');
    } catch (error) {
      console.log('⚠️ Column additions skipped (may already exist)');
    }
    
    console.log('📝 Starting student data insertion...');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insert students one by one with error handling
    for (const [index, student] of students.entries()) {
      try {
        const id = parseInt(student.id);
        if (isNaN(id)) continue;
        
        // Use only columns that exist in the table
        await sql`
          INSERT INTO students (
            id, full_name, permanent_address, district, province, date_of_birth, 
            national_id, passport_id, passport_expired_date, sex, marital_status, 
            spouse_name, number_of_children, mobile_phone, whatsapp_number, 
            has_driving_license, vehicle_type, email_address,
            other_qualifications, work_experience, work_experience_abroad, 
            cv_photo_url, status, created_by, created_at, updated_at, 
            education_ol, education_al, student_id, guardian_contact, 
            admission_date, expected_job_category, expected_sub_job_category
          ) VALUES (
            ${id},
            ${student.full_name || ''},
            ${student.permanent_address || ''},
            ${student.district || ''},
            ${student.province || ''},
            ${convertDate(student.date_of_birth)},
            ${student.national_id || ''},
            ${student.passport_id || ''},
            ${convertDate(student.passport_expired_date)},
            ${student.sex || 'male'},
            ${student.marital_status || 'single'},
            ${student.spouse_name || ''},
            ${parseInt(student.number_of_children) || 0},
            ${student.mobile_phone || ''},
            ${student.whatsapp_number || ''},
            ${student.has_driving_license === 'true'},
            ${student.vehicle_type || null},
            ${student.email_address || ''},
            ${student.other_qualifications || ''},
            ${student.work_experience || ''},
            ${student.work_experience_abroad || ''},
            ${student.cv_photo_url || ''},
            ${mapStatus(student.status)},
            ${parseInt(student.created_by) || 1},
            ${convertTimestamp(student.created_at)},
            ${convertTimestamp(student.updated_at)},
            ${student.education_ol === 'true'},
            ${student.education_al === 'true'},
            ${student.student_id || ''},
            ${student.guardian_contact || ''},
            ${convertDate(student.admission_date)},
            ${student.expected_job_category || ''},
            ${student.expected_sub_job_category || ''}
          )
          ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            permanent_address = EXCLUDED.permanent_address,
            district = EXCLUDED.district,
            province = EXCLUDED.province,
            date_of_birth = EXCLUDED.date_of_birth,
            national_id = EXCLUDED.national_id,
            passport_id = EXCLUDED.passport_id,
            passport_expired_date = EXCLUDED.passport_expired_date,
            sex = EXCLUDED.sex,
            marital_status = EXCLUDED.marital_status,
            spouse_name = EXCLUDED.spouse_name,
            number_of_children = EXCLUDED.number_of_children,
            mobile_phone = EXCLUDED.mobile_phone,
            whatsapp_number = EXCLUDED.whatsapp_number,
            has_driving_license = EXCLUDED.has_driving_license,
            vehicle_type = EXCLUDED.vehicle_type,
            email_address = EXCLUDED.email_address,
            other_qualifications = EXCLUDED.other_qualifications,
            work_experience = EXCLUDED.work_experience,
            work_experience_abroad = EXCLUDED.work_experience_abroad,
            cv_photo_url = EXCLUDED.cv_photo_url,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP,
            education_ol = EXCLUDED.education_ol,
            education_al = EXCLUDED.education_al,
            student_id = EXCLUDED.student_id,
            guardian_contact = EXCLUDED.guardian_contact,
            admission_date = EXCLUDED.admission_date,
            expected_job_category = EXCLUDED.expected_job_category,
            expected_sub_job_category = EXCLUDED.expected_sub_job_category
        `;
        
        successCount++;
        if ((index + 1) % 10 === 0) {
          console.log(`📊 Processed ${index + 1}/${students.length} students...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting student ID ${student.id}:`, error.message);
        errorCount++;
      }
    }
    
    // Generate summary report
    console.log('\n📊 INSERTION SUMMARY:');
    console.log(`✅ Successfully inserted/updated: ${successCount} students`);
    console.log(`❌ Errors encountered: ${errorCount} students`);
    
    // Get database statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_students,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_students,
        COUNT(CASE WHEN status = 'Employed' THEN 1 END) as employed_students
      FROM students
    `;
    
    console.log('\n📈 DATABASE STATISTICS:');
    console.log(`Total Students: ${stats[0].total_students}`);
    console.log(`Active: ${stats[0].active_students}`);
    console.log(`Pending: ${stats[0].pending_students}`);
    console.log(`Employed: ${stats[0].employed_students}`);
    
    // Province breakdown
    const provinceStats = await sql`
      SELECT 
        province,
        COUNT(*) as student_count,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'Employed' THEN 1 END) as employed
      FROM students
      GROUP BY province
      ORDER BY student_count DESC
    `;
    
    console.log('\n🗺️ STUDENTS BY PROVINCE:');
    provinceStats.forEach(stat => {
      console.log(`${stat.province}: ${stat.student_count} total (Active: ${stat.active}, Pending: ${stat.pending}, Employed: ${stat.employed})`);
    });
    
    // Show some example students
    const examples = await sql`
      SELECT id, full_name, district, status 
      FROM students 
      ORDER BY id 
      LIMIT 10
    `;
    
    console.log('\n👥 SAMPLE STUDENTS:');
    examples.forEach(student => {
      console.log(`ID ${student.id}: ${student.full_name} (${student.district}) - Status: ${student.status}`);
    });
    
    console.log('\n🎉 Student data insertion completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the insertion
if (require.main === module) {
  insertStudents();
}

module.exports = { insertStudents };