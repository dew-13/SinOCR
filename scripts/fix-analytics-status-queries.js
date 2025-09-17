const fs = require('fs');
const path = require('path');

// Files that need status query updates
const filesToUpdate = [
  'app/api/analytics/pre-analysis/route.ts',
  'app/api/analytics/post-analysis/route.ts',
  'app/api/analytics/ai-insights/route.ts'
];

function updateStatusQueries(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace old employed status queries
    const oldEmployedPattern = /status = 'employed'/g;
    if (content.match(oldEmployedPattern)) {
      content = content.replace(oldEmployedPattern, "status IN ('Employed', 'employed')");
      changed = true;
      console.log(`✅ Updated employed status queries in ${filePath}`);
    }
    
    // Replace old active status queries (if any)
    const oldActivePattern = /status = 'active'/g;
    if (content.match(oldActivePattern)) {
      content = content.replace(oldActivePattern, "status IN ('Active', 'active', 'Pending')");
      changed = true;
      console.log(`✅ Updated active status queries in ${filePath}`);
    }
    
    // Special case for AI insights - update the filter
    if (filePath.includes('ai-insights')) {
      const aiInsightsPattern = /s\.status === 'Employed'/g;
      if (content.match(aiInsightsPattern)) {
        content = content.replace(aiInsightsPattern, "['Employed', 'employed'].includes(s.status)");
        changed = true;
        console.log(`✅ Updated AI insights status filter in ${filePath}`);
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`💾 Saved changes to ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed in ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log('🔧 UPDATING STATUS QUERIES IN ANALYTICS FILES');
console.log('==============================================\n');

filesToUpdate.forEach(file => {
  const fullPath = path.join('m:', 'sms', file);
  console.log(`📄 Processing: ${file}`);
  updateStatusQueries(fullPath);
  console.log('');
});

console.log('🎉 Status query updates completed!');
console.log('💡 Next steps:');
console.log('   1. Restart the development server');
console.log('   2. Clear browser cache');
console.log('   3. Test the analytics dashboard');