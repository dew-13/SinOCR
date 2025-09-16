const fs = require('fs');

console.log('🧪 Testing Proper CSV File...');

const content = fs.readFileSync('sample-students-proper.csv', 'utf8');
console.log('Raw content length:', content.length);
console.log('Raw content (first 200 chars):', JSON.stringify(content.substring(0, 200)));

const lines = content.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim());
console.log('📊 Lines after processing:', lines.length);

lines.forEach((line, index) => {
  console.log(`Line ${index + 1} (${line.length} chars):`, line.substring(0, 100) + (line.length > 100 ? '...' : ''));
});

// Test parsing
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
console.log('📋 Headers count:', headers.length);
console.log('📋 Headers:', headers.slice(0, 10).map((h, i) => `${i+1}.${h}`).join(' '));

if (lines.length > 1) {
  const values = parseCSVLine(lines[1]);
  console.log('📊 Values count:', values.length);
  console.log('📊 First few values:', values.slice(0, 5).map((v, i) => `${i+1}."${v}"`).join(' '));
  
  if (headers.length === values.length) {
    console.log('✅ Header and value counts match!');
  } else {
    console.log('❌ Header/value count mismatch');
  }
}