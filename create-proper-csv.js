const fs = require('fs');

const csvContent = [
  'studentId,fullName,permanentAddress,district,province,dateOfBirth,nationalId,sex,maritalStatus,mobilePhone,whatsappNumber,emailAddress,expectedJobCategory,educationOL,educationAL,guardianContact,passportId,passportExpiredDate,spouseName,numberOfChildren,hasDrivingLicense,vehicleType,otherQualifications,workExperience,workExperienceAbroad,guardianName,admissionDate',
  'STU001,John Doe,123 Main St Colombo,Colombo,Western,1990-01-01,900000000V,Male,Single,0771234567,0771234567,john@example.com,IT,true,true,0771234568,N1234567,2030-12-31,,0,false,,,,,Jane Doe,2025-09-15',
  'STU002,Jane Smith,456 Oak Ave Kandy,Kandy,Central,1992-05-15,920000001V,Female,Married,0779876543,0779876543,jane@example.com,Healthcare,true,false,0778765432,N1234567,2030-12-31,Bob Smith,2,true,light_vehicle,Nursing Certificate,2 years as nurse,1 year in Dubai,Mary Smith,2025-09-16'
];

// Write with proper line endings
fs.writeFileSync('sample-students-proper.csv', csvContent.join('\n'), 'utf8');

console.log('✅ Created proper CSV file');
console.log('📄 Content:');
console.log(csvContent.join('\n'));
console.log('\n📊 Verification:');
const readContent = fs.readFileSync('sample-students-proper.csv', 'utf8');
console.log('Lines:', readContent.split('\n').length);
console.log('First line:', readContent.split('\n')[0].length, 'chars');
console.log('Second line:', readContent.split('\n')[1].length, 'chars');