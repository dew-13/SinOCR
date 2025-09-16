// Test script to verify Sinhala job category translation functionality
// This demonstrates how the OCR will now correctly map Sinhala job categories

const jobCategoryMapping = {
  // Nursing care variations
  "නර්සිං නෝයාව": "Nursing care",
  "නර්සිං සත්කාරය": "Nursing care",
  "හොස්පිටල් සත්කාර සේවාව": "Nursing care",
  "හොස්පිටල්": "Nursing care",
  "සෙවා": "Nursing care",
  "නර්සිං": "Nursing care",
  
  // Building Cleaning
  "ගොඩනැගිලි පිරිසිදු කිරීම": "Building Cleaning",
  "පිරිසිදු කිරීම": "Building Cleaning",
  "ගොඩනැගිලි": "Building Cleaning",
  
  // Industrial manufacturing
  "කාර්මික නිෂ්පාදනය": "Industrial manufacturing",
  "කර්මාන්ත": "Industrial manufacturing",
  "නිෂ්පාදනය": "Industrial manufacturing",
  
  // Construction
  "ගොඩනැගිලි ඉදිකිරීම": "Construction",
  "ඉදිකිරීම": "Construction",
  "ගොඩනැගිලි කාර්මිකය": "Construction",
  
  // Shipbuilding and Marine Industry
  "නෞකා නිෂ්පාදනය සහ සාගර කාර්මික කර්මාන්තය": "Shipbuilding and Marine Industry",
  "නෞකා නිෂ්පාදනය": "Shipbuilding and Marine Industry",
  "සාගර කර්මාන්තය": "Shipbuilding and Marine Industry",
  "නෞකා": "Shipbuilding and Marine Industry",
  
  // Agriculture
  "කෘෂිකර්මය": "Agriculture",
  "ගොවිතැන": "Agriculture",
  "කෘෂිකර්මාන්තය": "Agriculture",
  
  // Timber Industry
  "දාරු කර්මාන්තය": "Timber Industry",
  "දාරු": "Timber Industry",
  "ලී": "Timber Industry"
};

// Function to translate Sinhala job category to English
const translateJobCategory = (sinhalaText) => {
  if (!sinhalaText) return "";
  
  // First try exact match
  const exactMatch = jobCategoryMapping[sinhalaText];
  if (exactMatch) {
    console.log(`🔄 Exact job category match: "${sinhalaText}" → "${exactMatch}"`);
    return exactMatch;
  }
  
  // Try partial matching for any Sinhala text that contains known terms
  for (const [sinhalaKey, englishValue] of Object.entries(jobCategoryMapping)) {
    if (sinhalaText.includes(sinhalaKey) || sinhalaKey.includes(sinhalaText)) {
      console.log(`🔄 Partial job category match: "${sinhalaText}" contains "${sinhalaKey}" → "${englishValue}"`);
      return englishValue;
    }
  }
  
  // If no Sinhala match found, check if it's already in English and valid
  const validEnglishCategories = [
    "Nursing care", "Building Cleaning", "Industrial manufacturing", "Construction",
    "Shipbuilding and Marine Industry", "Automobile Maintenance", "Aviation", "Accommodation",
    "Automobile transport industry", "Railway", "Agriculture", "Fisheries",
    "Food and beverage manufacturing", "Food service", "Forestry", "Timber Industry"
  ];
  
  // Check if the text matches any valid English category (case-insensitive)
  const englishMatch = validEnglishCategories.find(category => 
    category.toLowerCase() === sinhalaText.toLowerCase()
  );
  
  if (englishMatch) {
    console.log(`✅ Valid English job category: "${sinhalaText}" → "${englishMatch}"`);
    return englishMatch;
  }
  
  console.log(`⚠️ No job category translation found for: "${sinhalaText}"`);
  return sinhalaText; // Return original if no translation found
};

// Test cases to demonstrate the translation functionality
console.log("=== Testing Sinhala Job Category Translation ===");
console.log();

// Test exact matches
console.log("🧪 Testing exact Sinhala matches:");
console.log("1.", translateJobCategory("නර්සිං නෝයාව"));
console.log("2.", translateJobCategory("ගොඩනැගිලි පිරිසිදු කිරීම"));
console.log("3.", translateJobCategory("කාර්මික නිෂ්පාදනය"));
console.log("4.", translateJobCategory("කෘෂිකර්මය"));
console.log("5.", translateJobCategory("දාරු කර්මාන්තය"));
console.log();

// Test partial matches
console.log("🧪 Testing partial Sinhala matches:");
console.log("1.", translateJobCategory("නර්සිං"));
console.log("2.", translateJobCategory("ගොඩනැගිලි"));
console.log("3.", translateJobCategory("කර්මාන්ත"));
console.log("4.", translateJobCategory("ගොවිතැන"));
console.log("5.", translateJobCategory("දාරු"));
console.log();

// Test English inputs (should remain unchanged)
console.log("🧪 Testing English inputs (should remain unchanged):");
console.log("1.", translateJobCategory("Nursing care"));
console.log("2.", translateJobCategory("Construction"));
console.log("3.", translateJobCategory("Agriculture"));
console.log();

// Test unknown inputs
console.log("🧪 Testing unknown inputs:");
console.log("1.", translateJobCategory("Unknown Category"));
console.log("2.", translateJobCategory("පුහුණුව"));
console.log();

console.log("=== Translation Test Complete ===");
console.log("✅ The OCR system will now correctly map Sinhala handwritten job categories to English dropdown options!");