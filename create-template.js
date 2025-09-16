const fs = require('fs');

// Create a minimal template with just one example row
const csvContent = [
  'studentId,fullName,permanentAddress,district,province,dateOfBirth,nationalId,sex,maritalStatus,mobilePhone,whatsappNumber,emailAddress,expectedJobCategory,educationOL,educationAL,guardianContact,passportId,passportExpiredDate,spouseName,numberOfChildren,hasDrivingLicense,vehicleType,otherQualifications,workExperience,workExperienceAbroad,guardianName,admissionDate',
  'STU001,John Doe,123 Main St Colombo,Colombo,Western,1990-01-01,900000000V,Male,Single,0771234567,0771234567,john@example.com,IT,true,true,0771234568,,,,,false,,,,,John Guardian,2025-09-16'
];

// Write the template
fs.writeFileSync('template-students.csv', csvContent.join('\n'), 'utf8');

console.log('✅ Created minimal template CSV');
console.log('📄 This template has:');
console.log('- All required fields filled');
console.log('- Optional fields left empty (except a few for example)');
console.log('- Proper formatting and line endings');
console.log('- Ready for users to modify student ID and name');

// Also update the main sample file
fs.writeFileSync('sample-students.csv', csvContent.join('\n'), 'utf8');
console.log('✅ Updated main sample-students.csv file');