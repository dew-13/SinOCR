require('dotenv').config();

console.log('🔍 Environment Variable Check:');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length);
console.log('GEMINI_API_KEY starts with:', process.env.GEMINI_API_KEY?.substring(0, 10));
console.log('GEMINI_API_KEY ends with:', process.env.GEMINI_API_KEY?.substring(process.env.GEMINI_API_KEY.length - 10));

// Test direct key
const directKey = "AIzaSyA4nXe9Y-W4F3KRVg4wVfD3AzZSmXFGKjQ";
console.log('\n🔍 Direct Key Check:');
console.log('Direct key length:', directKey.length);
console.log('Direct key starts with:', directKey.substring(0, 10));
console.log('Direct key ends with:', directKey.substring(directKey.length - 10));