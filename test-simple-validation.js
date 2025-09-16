import fs from 'fs';

console.log('🧪 Testing Simple CSV Validation...');

// Read the test CSV
const csvContent = fs.readFileSync('test-simple.csv', 'utf8');
console.log('\n📄 CSV Content:');
console.log('==========================================');
console.log(csvContent);
console.log('==========================================');

// Parse CSV manually to check for issues
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');
const dataRow = lines[1];

console.log('\n📋 Headers (' + headers.length + '):');
headers.forEach((header, index) => {
  console.log(`  ${index + 1}. ${header}`);
});

console.log('\n📊 Data Row:');
console.log(dataRow);

// Parse the data row more carefully
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last value
  values.push(current.trim());
  return values;
}

const parsedValues = parseCSVLine(dataRow);
console.log('\n🔍 Parsed Values (' + parsedValues.length + '):');
parsedValues.forEach((value, index) => {
  console.log(`  ${index + 1}. "${value}" (length: ${value.length})`);
});

// Check for validation issues
const REQUIRED_FIELDS = [
  "studentId", "fullName", "permanentAddress", "district", "province", 
  "dateOfBirth", "nationalId", "sex", "maritalStatus", "mobilePhone", 
  "whatsappNumber", "emailAddress", "expectedJobCategory", "educationOL", 
  "educationAL", "guardianContact"
];

console.log('\n🔍 Validation Check:');
const student = {};
headers.forEach((header, index) => {
  student[header] = parsedValues[index] || '';
});

console.log('\n📝 Student Object:');
console.log(JSON.stringify(student, null, 2));

console.log('\n❌ Missing Required Fields:');
const errors = [];
for (const field of REQUIRED_FIELDS) {
  if (field === 'educationOL' || field === 'educationAL') {
    if (student[field] === undefined || student[field] === null || student[field] === '') {
      errors.push(`Missing required field '${field}' (current value: "${student[field]}")`);
    }
  } else {
    if (!student[field] || student[field].trim() === '') {
      errors.push(`Missing required field '${field}' (current value: "${student[field]}")`);
    }
  }
}

if (errors.length > 0) {
  errors.forEach(error => console.log(`  ❌ ${error}`));
} else {
  console.log('  ✅ All required fields present');
}