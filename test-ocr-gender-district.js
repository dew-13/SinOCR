// Test script to verify OCR gender and district detection
console.log("🧪 Testing OCR Gender and District Detection...");

// Simulate the detection functions from the OCR processor
const detectGender = (text) => {
  const genderMappings = {
    // Sinhala terms for female
    'ස්ත්‍රී': 'female',
    'ස්ත්රී': 'female', 
    'ගැහැණු': 'female',
    'කාන්තා': 'female',
    // Sinhala terms for male
    'පුරුෂ': 'male',
    'පුරුෂා': 'male',
    'පිරිමි': 'male',
    'නරයා': 'male',
    // English terms
    'male': 'male',
    'female': 'female',
    'man': 'male',
    'woman': 'female'
  };

  // Convert text to lowercase for matching
  const lowerText = text.toLowerCase();
  
  // Check for gender field context
  const genderFieldPattern = /(?:ස්ත්‍රී|පුරුෂ|gender|sex|ස්ත්‍රී\s*\/\s*පුරුෂ)/i;
  
  // Look for checked boxes or marked fields near gender indicators
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If this line contains gender field indicator
    if (genderFieldPattern.test(line)) {
      // Check current line and next few lines for marked options
      for (let j = 0; j < 3 && (i + j) < lines.length; j++) {
        const checkLine = lines[i + j];
        
        // Look for checkmarks, X marks, or circled options
        const markedPattern = /[✓✗×✔️☑️🗹]|checked|marked|circled|\[x\]|\(x\)/i;
        
        if (markedPattern.test(checkLine)) {
          // Check which gender term is marked
          for (const [sinhala, english] of Object.entries(genderMappings)) {
            if (checkLine.includes(sinhala)) {
              console.log(`🎯 Gender detected: Found marked ${sinhala} → ${english}`);
              return english;
            }
          }
        }
      }
    }
    
    // Direct detection of gender terms in the line
    for (const [sinhala, english] of Object.entries(genderMappings)) {
      if (line.includes(sinhala)) {
        // Check if this appears to be marked/selected
        const hasMarker = /[✓✗×✔️☑️🗹]|checked|marked|\[x\]|\(x\)/i.test(line);
        if (hasMarker) {
          console.log(`🎯 Gender detected: Found marked ${sinhala} → ${english}`);
          return english;
        }
      }
    }
  }
  
  // Fallback: look for any gender terms in the text
  for (const [sinhala, english] of Object.entries(genderMappings)) {
    if (text.includes(sinhala)) {
      console.log(`🔍 Gender fallback: Found ${sinhala} → ${english}`);
      return english;
    }
  }
  
  return '';
};

const detectDistrict = (text) => {
  const districtMappings = {
    // English to standardized English
    'ampara': 'Ampara',
    'anuradhapura': 'Anuradhapura', 
    'badulla': 'Badulla',
    'batticaloa': 'Batticaloa',
    'colombo': 'Colombo',
    'galle': 'Galle',
    'gampaha': 'Gampaha',
    'hambantota': 'Hambantota',
    'jaffna': 'Jaffna',
    'kalutara': 'Kalutara',
    'kandy': 'Kandy',
    'kegalle': 'Kegalle',
    'kilinochchi': 'Kilinochchi',
    'kurunegala': 'Kurunegala',
    'mannar': 'Mannar',
    'matale': 'Matale',
    'matara': 'Matara',
    'monaragala': 'Monaragala',
    'mullaitivu': 'Mullaitivu',
    'nuwara eliya': 'Nuwara Eliya',
    'polonnaruwa': 'Polonnaruwa',
    'puttalam': 'Puttalam',
    'ratnapura': 'Ratnapura',
    'trincomalee': 'Trincomalee',
    'vavuniya': 'Vavuniya',
    
    // Sinhala to English mapping
    'අම්පාර': 'Ampara',
    'අනුරාධපුර': 'Anuradhapura',
    'බදුල්ල': 'Badulla',
    'මඩකලපුව': 'Batticaloa',
    'බත්තිකලාව': 'Batticaloa',
    'කොළඹ': 'Colombo',
    'ගාල්ල': 'Galle',
    'ගම්පහ': 'Gampaha',
    'හම්බන්තොට': 'Hambantota',
    'යාපනය': 'Jaffna',
    'කලුතර': 'Kalutara',
    'මහනුවර': 'Kandy',
    'කෑගල්ල': 'Kegalle',
    'කිලිනොච්චි': 'Kilinochchi',
    'කුරුණෑගල': 'Kurunegala',
    'මන්නාරම': 'Mannar',
    'මතලේ': 'Matale',
    'මාතර': 'Matara',
    'මොනරාගල': 'Monaragala',
    'මුලතිව්': 'Mullaitivu',
    'නුවර එළිය': 'Nuwara Eliya',
    'පොළොන්නරුව': 'Polonnaruwa',
    'පුත්තලම': 'Puttalam',
    'රත්නපුර': 'Ratnapura',
    'ත්‍රිකුණාමලය': 'Trincomalee',
    'වවුනියාව': 'Vavuniya',
    
    // Common variations and abbreviations
    'nuwara-eliya': 'Nuwara Eliya',
    'nuwaraeliya': 'Nuwara Eliya',
    'nuwara': 'Nuwara Eliya',
    'eliya': 'Nuwara Eliya',
    'කන්ද': 'Kandy',
    'කොළම්බ': 'Colombo'
  };

  // Convert text to lowercase for matching
  const lowerText = text.toLowerCase();
  
  // Check for district field context
  const districtFieldPattern = /(?:district|දිස්ත්‍රික්කය|ගම)/i;
  
  // Look for marked districts near district field indicators
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If this line contains district field indicator
    if (districtFieldPattern.test(line)) {
      // Check current line and next few lines for district names
      for (let j = 0; j < 3 && (i + j) < lines.length; j++) {
        const checkLine = lines[i + j];
        
        // Check for each district mapping
        for (const [term, standardName] of Object.entries(districtMappings)) {
          if (checkLine.toLowerCase().includes(term.toLowerCase()) || checkLine.includes(term)) {
            console.log(`🎯 District detected: Found ${term} → ${standardName}`);
            return standardName;
          }
        }
      }
    }
    
    // Direct detection of district names in any line
    for (const [term, standardName] of Object.entries(districtMappings)) {
      if (line.toLowerCase().includes(term.toLowerCase()) || line.includes(term)) {
        console.log(`🔍 District detected: Found ${term} → ${standardName}`);
        return standardName;
      }
    }
  }
  
  return '';
};

// Test cases
const testCases = [
  {
    name: "Sinhala Female Gender",
    text: "ස්ත්‍රී ✓\nපුරුෂ",
    expectedGender: "female",
    expectedDistrict: ""
  },
  {
    name: "Sinhala Male Gender", 
    text: "ස්ත්‍රී\nපුරුෂ ✓",
    expectedGender: "male",
    expectedDistrict: ""
  },
  {
    name: "District Colombo",
    text: "දිස්ත්‍රික්කය: කොළඹ",
    expectedGender: "",
    expectedDistrict: "Colombo"
  },
  {
    name: "District Kandy (Sinhala)",
    text: "දිස්ත්‍රික්කය: මහනුවර",
    expectedGender: "",
    expectedDistrict: "Kandy"
  },
  {
    name: "Combined Test",
    text: "ස්ත්‍රී ✓\nපුරුෂ\nදිස්ත්‍රික්කය: ගම්පහ",
    expectedGender: "female", 
    expectedDistrict: "Gampaha"
  }
];

console.log("\n📋 Running Test Cases:");
console.log("=====================");

testCases.forEach((testCase, index) => {
  console.log(`\n🧪 Test ${index + 1}: ${testCase.name}`);
  console.log(`📄 Input text: "${testCase.text}"`);
  
  const detectedGender = detectGender(testCase.text);
  const detectedDistrict = detectDistrict(testCase.text);
  
  console.log(`🎯 Expected Gender: "${testCase.expectedGender}", Detected: "${detectedGender}"`);
  console.log(`🎯 Expected District: "${testCase.expectedDistrict}", Detected: "${detectedDistrict}"`);
  
  const genderMatch = detectedGender === testCase.expectedGender;
  const districtMatch = detectedDistrict === testCase.expectedDistrict;
  
  console.log(`${genderMatch ? '✅' : '❌'} Gender: ${genderMatch ? 'PASS' : 'FAIL'}`);
  console.log(`${districtMatch ? '✅' : '❌'} District: ${districtMatch ? 'PASS' : 'FAIL'}`);
});

console.log("\n🏁 Test Complete!");