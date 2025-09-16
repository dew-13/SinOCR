const fs = require('fs');

const csvContent = [
  'studentId,fullName,permanentAddress,district,province,dateOfBirth,nationalId,sex,maritalStatus,mobilePhone,whatsappNumber,emailAddress,expectedJobCategory,educationOL,educationAL,guardianContact,passportId,passportExpiredDate,spouseName,numberOfChildren,hasDrivingLicense,vehicleType,otherQualifications,workExperience,workExperienceAbroad,guardianName,admissionDate',
  'STU999,Alice Modified,123 Main St Colombo,Colombo,Western,1990-01-01,900000000V,Male,Single,0771234567,0771234567,john@example.com,IT,true,true,0771234568,N1234567,2030-12-31,,0,false,,,,,Jane Doe,2025-09-15'
];

// Write with proper line endings
fs.writeFileSync('test-modified.csv', csvContent.join('\n'), 'utf8');

console.log('✅ Created test CSV with modified student');
console.log('📄 Testing validation...');

// Test the validation
const content = fs.readFileSync('test-modified.csv', 'utf8');
const lines = content.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim());

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

const headers = parseCSVLine(lines[0]);
const values = parseCSVLine(lines[1]);

console.log('📋 Headers:', headers.length);
console.log('📊 Values:', values.length);

const student = {};
headers.forEach((header, index) => {
  student[header] = values[index] || '';
});

console.log('\n👤 Student data:');
console.log('- Student ID:', student.studentId);
console.log('- Full Name:', student.fullName);
console.log('- Email:', student.emailAddress);
console.log('- Education OL:', student.educationOL);
console.log('- Education AL:', student.educationAL);

const REQUIRED_FIELDS = [
  "studentId", "fullName", "permanentAddress", "district", "province", 
  "dateOfBirth", "nationalId", "sex", "maritalStatus", "mobilePhone", 
  "whatsappNumber", "emailAddress", "expectedJobCategory", "educationOL", 
  "educationAL", "guardianContact"
];

console.log('\n🔍 Validation results:');
const errors = [];
for (const field of REQUIRED_FIELDS) {
  if (field === 'educationOL' || field === 'educationAL') {
    if (student[field] === undefined || student[field] === null || student[field] === '') {
      errors.push(`Missing required field '${field}'`);
    } else {
      console.log(`✅ ${field}: "${student[field]}"`);
    }
  } else {
    if (!student[field] || student[field].trim() === '') {
      errors.push(`Missing required field '${field}'`);
    } else {
      console.log(`✅ ${field}: "${student[field]}"`);
    }
  }
}

if (errors.length > 0) {
  console.log('\n❌ Validation errors:');
  errors.forEach(error => console.log(`  - ${error}`));
} else {
  console.log('\n🎉 ALL VALIDATION PASSED!');
}