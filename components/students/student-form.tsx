"use client";
// Check if Student ID already exists before submitting (frontend validation)
const checkStudentIdExists = async (studentId: string) => {
  try {
    const response = await fetch(`/api/students?studentId=${encodeURIComponent(studentId)}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data && data.exists;
  } catch {
    return false;
  }
};
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Loader2 } from "lucide-react";
import { generateStudentPdf } from "@/lib/generateStudentPdf";

const provinces = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
];

const districts = {
  Western: ["Colombo", "Gampaha", "Kalutara"],
  Central: ["Kandy", "Matale", "Nuwara Eliya"],
  Southern: ["Galle", "Matara", "Hambantota"],
  Northern: ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  Eastern: ["Ampara", "Batticaloa", "Trincomalee"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  Uva: ["Badulla", "Monaragala"],
  Sabaragamuwa: ["Ratnapura", "Kegalle"],
};

// Sinhala to English job category mapping for OCR accuracy
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
  
  // Automobile Maintenance
  "මෝටර් රථ නඩත්තු කිරීම": "Automobile Maintenance",
  "මෝටර් රථ": "Automobile Maintenance",
  "නඩත්තු": "Automobile Maintenance",
  "වාහන": "Automobile Maintenance",
  
  // Aviation
  "ගුවන් සේවා": "Aviation",
  "ගුවන්": "Aviation",
  "ගුවන් යානා": "Aviation",
  
  // Accommodation
  "නවාතැන් සැපයීම": "Accommodation",
  "නවාතැන්": "Accommodation",
  "හෝටල්": "Accommodation",
  
  // Automobile transport industry
  "මෝටර් රථ ප්‍රවාහන කර්මාන්තය": "Automobile transport industry",
  "ප්‍රවාහන": "Automobile transport industry",
  "ප්‍රවාහන කර්මාන්තය": "Automobile transport industry",
  
  // Railway
  "දුම්රිය සේවාව": "Railway",
  "දුම්රිය": "Railway",
  "රේල්": "Railway",
  
  // Agriculture
  "කෘෂිකර්මය": "Agriculture",
  "ගොවිතැන": "Agriculture",
  "කෘෂිකර්මාන්තය": "Agriculture",
  
  // Fisheries
  "මාළු කර්මාන්තය": "Fisheries",
  "මාළු": "Fisheries",
  "ධීවර": "Fisheries",
  
  // Food and beverage manufacturing
  "ආහාර නිෂ්පාදනය": "Food and beverage manufacturing",
  "ආහාර": "Food and beverage manufacturing",
  "ආහාර කර්මාන්තය": "Food and beverage manufacturing",
  
  // Food service
  "ආහාර සේවා": "Food service",
  "ආහාර සේවාව": "Food service",
  "ආහාරසේවා": "Food service",
  
  // Forestry
  "වනාන්තර කළමනාකරණය": "Forestry",
  "වනාන්තර": "Forestry",
  "වන": "Forestry",
  
  // Timber Industry
  "දාරු කර්මාන්තය": "Timber Industry",
  "දාරු": "Timber Industry",
  "ලී": "Timber Industry"
};

// Function to translate Sinhala job category to English
const translateJobCategory = (sinhalaText: string): string => {
  if (!sinhalaText) return "";
  
  // First try exact match
  const exactMatch = jobCategoryMapping[sinhalaText as keyof typeof jobCategoryMapping];
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

interface StudentFormData {
  expectedJobCategory?: string;
  studentId: string;
  fullName: string;
  permanentAddress: string;
  district: string;
  province: string;
  dateOfBirth: string;
  nationalId: string;
  passportId: string;
  passportExpiredDate: string;
  sex: string;
  maritalStatus: string;
  spouseName: string;
  numberOfChildren: number;
  mobilePhone: string;
  whatsappNumber: string;
  hasDrivingLicense: boolean;
  vehicleType: string;
  emailAddress: string;
  educationOL: boolean;
  educationAL: boolean;
  otherQualifications: string;
  workExperience: string;
  workExperienceAbroad: string;
  cvPhotoUrl: string | null;
  status: string;
  guardianName?: string;
  guardianContact?: string;
}

interface StudentFormProps {
  student?: any;
  isEdit?: boolean;
}

export default function StudentForm({ student, isEdit = false }: StudentFormProps) {
  // Validate required fields before submit
  const requiredFields: (keyof StudentFormData)[] = [
    "studentId", "fullName", "permanentAddress", "district", "province", "dateOfBirth", "nationalId", "sex", "maritalStatus", "mobilePhone", "whatsappNumber", "guardianName", "guardianContact", "emailAddress", "expectedJobCategory"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    for (const field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === "string" && (formData[field] as string).trim() === "")) {
        setError("Please complete all required fields marked with *.");
        setLoading(false);
        return;
      }
    }
    // Education qualification: require at least one checkbox
    if (!formData.educationOL && !formData.educationAL) {
      setError("Please select at least one Education Qualification.");
      setLoading(false);
      return;
    }

    // Check for duplicate Student ID (only on add, not edit)
    if (!isEdit) {
      const exists = await checkStudentIdExists(formData.studentId);
      if (exists) {
        setError("Student ID already exists. Please use a different ID.");
        setLoading(false);
        return;
      }
    }

    // Prepare payload
    const payload = {
      ...formData,
      mobilePhone: formData.mobilePhone ? `+94${formData.mobilePhone}` : null,
      whatsappNumber: formData.whatsappNumber ? `+94${formData.whatsappNumber}` : null,
      dateOfBirth: formData.dateOfBirth && formData.dateOfBirth.trim() !== "" ? formData.dateOfBirth : null,
      passportExpiredDate: formData.passportExpiredDate && formData.passportExpiredDate.trim() !== "" ? formData.passportExpiredDate : null,
    };

    try {
      const token = localStorage.getItem("token");
      const url = isEdit ? `/api/students/${student?.id}` : "/api/students";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        router.push("/dashboard/students");
      } else {
        // Check for duplicate constraint errors
        if (data.error && typeof data.error === "string") {
          if (data.error.includes("students_national_id_key")) {
            setError("National ID already exists.");
            return;
          }
          if (data.error.includes("students_passport_id_key")) {
            setError("Passport No already exists.");
            return;
          }
          if (data.error.includes("students_student_id_key")) {
            setError("Student ID already exists.");
            return;
          }
        }
        setError(data.error || "Failed to save student");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Handler for document upload and AI processing
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setOcrError("");
    const startTime = Date.now();

    try {
      console.log("🔄 Starting OCR processing for new document...");
      
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      // Call the AI processing API
      const response = await fetch("/api/ai-document-processor", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error("Failed to process document");
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;
      
      if (result.error) {
        setOcrError(result.error);
        return;
      }

      // Auto-fill form with extracted data
      if (result.extractedData) {
        console.log("📝 Clearing previous form data and applying new OCR data...");
        
        // Clear form data and only fill with new extracted data
        const initialFormData: StudentFormData = {
          fullName: "",
          permanentAddress: "",
          district: "",
          province: "",
          dateOfBirth: "",
          nationalId: "",
          passportId: "",
          passportExpiredDate: "",
          sex: "",
          maritalStatus: "",
          spouseName: "",
          numberOfChildren: 0,
          mobilePhone: "",
          whatsappNumber: "",
          hasDrivingLicense: false,
          vehicleType: "",
          emailAddress: "",
          educationOL: false,
          educationAL: false,
          otherQualifications: "",
          workExperience: "",
          workExperienceAbroad: "",
          cvPhotoUrl: null,
          studentId: "",
          expectedJobCategory: "",
          status: "Pending",
          guardianName: "",
          guardianContact: "",
        };

        // Only set fields that have actual data from OCR
        const cleanedData = { ...initialFormData };
        console.log("🔍 OCR extracted data keys:", Object.keys(result.extractedData));
        console.log("🔍 OCR extracted data:", result.extractedData);
        
        let fieldsExtracted = 0;
        const totalFields = Object.keys(initialFormData).length;
        
        Object.keys(result.extractedData).forEach(key => {
          let value = result.extractedData[key];
          
          // Apply job category translation for expectedJobCategory field
          if (key === "expectedJobCategory" && value) {
            const translatedValue = translateJobCategory(value);
            if (translatedValue !== value) {
              console.log(`🔄 Job category translated: "${value}" → "${translatedValue}"`);
              value = translatedValue;
            }
          }
          
          // Only set non-empty values and ensure key exists in StudentFormData
          if (value !== null && value !== undefined && value !== "" && key in cleanedData) {
            (cleanedData as any)[key] = value;
            fieldsExtracted++;
            console.log(`✅ Mapped ${key}: ${value}`);
          } else {
            console.log(`⚠️ Skipped empty/invalid field ${key}: ${value}`);
          }
        });

        // Calculate accuracy based on confidence or use a default calculation
        const accuracy = result.confidence || Math.min(95, (fieldsExtracted / totalFields) * 100 + 20);
        
        // Set OCR summary
        setOcrSummary({
          accuracy: Math.round(accuracy),
          fieldsExtracted,
          totalFields,
          documentType: result.documentType || "Student Document",
          processingTime: Math.round(processingTime / 1000)
        });

        // Validate province-district relationship and auto-detect province
        if (cleanedData.district && !cleanedData.province) {
          // Auto-detect province based on district
          const districtToProvince: Record<string, string> = {
            'Colombo': 'Western', 'Gampaha': 'Western', 'Kalutara': 'Western',
            'Kandy': 'Central', 'Matale': 'Central', 'Nuwara Eliya': 'Central',
            'Galle': 'Southern', 'Matara': 'Southern', 'Hambantota': 'Southern',
            'Jaffna': 'Northern', 'Kilinochchi': 'Northern', 'Mannar': 'Northern', 'Mullaitivu': 'Northern', 'Vavuniya': 'Northern',
            'Ampara': 'Eastern', 'Batticaloa': 'Eastern', 'Trincomalee': 'Eastern',
            'Kurunegala': 'North Western', 'Puttalam': 'North Western',
            'Anuradhapura': 'North Central', 'Polonnaruwa': 'North Central',
            'Badulla': 'Uva', 'Monaragala': 'Uva',
            'Ratnapura': 'Sabaragamuwa', 'Kegalle': 'Sabaragamuwa'
          };
          
          if (districtToProvince[cleanedData.district]) {
            cleanedData.province = districtToProvince[cleanedData.district];
            console.log(`🔧 Province auto-detected: ${cleanedData.district} → ${cleanedData.province}`);
          }
        }

        // Validate province-district relationship
        if (cleanedData.province && cleanedData.district) {
          const validDistricts = districts[cleanedData.province as keyof typeof districts];
          if (validDistricts && !validDistricts.includes(cleanedData.district)) {
            console.log(`⚠️ District ${cleanedData.district} not valid for province ${cleanedData.province}, clearing district`);
            console.log(`⚠️ Valid districts for ${cleanedData.province}:`, validDistricts);
            cleanedData.district = "";
          } else {
            console.log(`✅ District ${cleanedData.district} is valid for province ${cleanedData.province}`);
          }
        }

        // Set form data with proper sequencing for province-district relationship
        setFormData((prevData) => {
          const newData = {
            ...prevData,
            ...cleanedData
          };
          
          console.log("✅ Form cleared and filled with new OCR data");
          console.log("🔍 Final form data after OCR update:", newData);
          console.log("🔍 Gender value set to:", newData.sex);
          console.log("🔍 District value set to:", newData.district);
          console.log("🔍 Province value set to:", newData.province);
          
          // Force a small delay to ensure Select components re-render
          setTimeout(() => {
            console.log("🔄 Checking form data after render delay:", {
              province: newData.province,
              district: newData.district,
              isDistrictValid: newData.province && newData.district ? 
                districts[newData.province as keyof typeof districts]?.includes(newData.district) : null
            });
          }, 100);
          
          return newData;
        });
        
        setOcrError("");
        
        // Show success message to user
        setError("");
        setTimeout(() => {
          setOcrError("✅ Document processed successfully! Form has been cleared and filled with new data.");
          // Clear success message after 5 seconds
          setTimeout(() => {
            setOcrError("");
          }, 5000);
        }, 500);
      }

    } catch (error) {
      console.error("Error processing document:", error);
      setOcrError("Failed to process document. Please try again.");
      setOcrSummary(null);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const [formData, setFormData] = useState<StudentFormData>({
    fullName: student?.full_name || "",
    permanentAddress: student?.permanent_address || "",
    district: student?.district || "",
    province: student?.province || "",
    dateOfBirth: student?.date_of_birth || "",
    nationalId: student?.national_id || "",
    passportId: student?.passport_id || "",
    passportExpiredDate: student?.passport_expired_date || "",
    sex: student?.sex || "",
    maritalStatus: student?.marital_status || "",
    spouseName: student?.spouse_name || "",
    numberOfChildren: student?.number_of_children || 0,
    mobilePhone: student?.mobile_phone || "",
    whatsappNumber: student?.whatsapp_number || "",
    hasDrivingLicense: student?.has_driving_license || false,
    vehicleType: student?.vehicle_type || "",
    emailAddress: student?.email_address || "",
    educationOL: student?.education_ol || false,
    educationAL: student?.education_al || false,
    otherQualifications: student?.other_qualifications || "",
    workExperience: student?.work_experience || "",
    workExperienceAbroad: student?.work_experience_abroad || "",
    cvPhotoUrl: student?.cv_photo_url || null,
    studentId: student?.student_id || "",
  expectedJobCategory: student?.expected_job_category || "",
    status: student?.status || "Pending",
    guardianName: student?.guardian_name || "",
    guardianContact: student?.guardian_contact || "",
  });

  // Save button handler: generate PDF and prompt user to save
  const handleSavePdf = () => {
    const doc = generateStudentPdf(formData);
    if (doc && typeof doc.save === "function") {
      // Sanitize filename: remove spaces and special chars from name
      const safeName = (formData.fullName || "").replace(/[^a-zA-Z0-9]/g, "_");
      const safeId = (formData.studentId || "").replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${safeId}_${safeName}.pdf`;
      doc.save(filename);
    }
  };

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ocrError, setOcrError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState("");
  const [ocrSummary, setOcrSummary] = useState<{
    accuracy: number;
    fieldsExtracted: number;
    totalFields: number;
    documentType: string;
    processingTime: number;
  } | null>(null);

  // Effect to validate district when province changes (but not during OCR processing)
  useEffect(() => {
    if (formData.province && formData.district && !loading) {
      const validDistricts = districts[formData.province as keyof typeof districts];
      if (validDistricts && !validDistricts.includes(formData.district)) {
        console.log(`🔧 Province changed: District ${formData.district} not valid for ${formData.province}, clearing district`);
        setFormData(prev => ({ ...prev, district: "" }));
      }
    }
  }, [formData.province, loading]);

  // Handler for generic input change
  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Special handler for province change
  const handleProvinceChange = (province: string) => {
    setFormData((prev) => {
      const newData = { ...prev, province };
      
      // Check if current district is valid for new province
      if (prev.district) {
        const validDistricts = districts[province as keyof typeof districts];
        if (!validDistricts || !validDistricts.includes(prev.district)) {
          console.log(`🔧 Province changed to ${province}: District ${prev.district} not valid, clearing district`);
          newData.district = "";
        } else {
          console.log(`✅ Province changed to ${province}: District ${prev.district} remains valid`);
        }
      }
      
      return newData;
    });
  };

  // Handler for text-only input
  const handleTextOnlyInput = (field: keyof StudentFormData, value: string) => {
    const filtered = value.replace(/[^a-zA-Z\s]/g, "");
    setFormData((prev) => ({ ...prev, [field]: filtered }));
  };

  // Handler for email input
  const handleEmailInput = (value: string) => {
    setFormData((prev) => ({ ...prev, emailAddress: value }));
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  // Handler for number of children (max 10)
  const handleNumberOfChildrenInput = (value: string) => {
    let num = Number(value.replace(/[^0-9]/g, ""));
    if (isNaN(num)) num = 0;
    if (num > 10) num = 10;
    setFormData((prev) => ({ ...prev, numberOfChildren: num }));
  };

  // Handler for Sri Lankan phone numbers (9 digits only, prefix +94)
  const handleSriLankaPhoneInput = (field: keyof StudentFormData, value: string) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 9) digits = digits.slice(0, 9);
    setFormData((prev) => ({ ...prev, [field]: digits }));
  };

  // Handler for Student ID (alphanumeric only, max 10 characters)
  const handleStudentIdInput = (value: string) => {
    // Remove any non-alphanumeric characters and limit to 10 characters
    const filtered = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, studentId: filtered }));
  };

  // Handler for Permanent Address (alphanumeric, comma, forward slash only)
  const handleAddressInput = (field: keyof StudentFormData, value: string) => {
    // Allow only alphanumeric characters, spaces, commas, and forward slashes
    const filtered = value.replace(/[^a-zA-Z0-9\s,/]/g, "");
    setFormData((prev) => ({ ...prev, [field]: filtered }));
  };

  // Handler for Passport ID (first character letter, followed by 8 numbers, max 9 chars)
  const handlePassportIdInput = (value: string) => {
    // Remove any non-alphanumeric characters first
    let cleaned = value.replace(/[^a-zA-Z0-9]/g, "");
    
    if (cleaned.length === 0) {
      setFormData((prev) => ({ ...prev, passportId: "" }));
      return;
    }
    
    // First character must be a letter
    let firstChar = cleaned[0].toUpperCase();
    if (!/^[A-Z]$/.test(firstChar)) {
      // If first character is not a letter, ignore the input
      return;
    }
    
    // Remaining characters must be numbers, limit to 8 digits
    let remainingChars = cleaned.slice(1).replace(/[^0-9]/g, "").slice(0, 8);
    
    // Combine first letter with numbers
    let formatted = firstChar + remainingChars;
    
    setFormData((prev) => ({ ...prev, passportId: formatted }));
  };

  // Handler for National ID (alphanumeric only, max 12 characters)
  const handleNationalIdInput = (value: string) => {
    // Remove any non-alphanumeric characters and limit to 12 characters
    const filtered = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
    setFormData((prev) => ({ ...prev, nationalId: filtered }));
  };

  // Handler for alphanumeric text input (letters, numbers, and spaces)
  const handleAlphanumericTextInput = (field: keyof StudentFormData, value: string) => {
    // Allow letters, numbers, and spaces - useful for descriptions, qualifications, etc.
    const filtered = value.replace(/[^a-zA-Z0-9\s]/g, "");
    setFormData((prev) => ({ ...prev, [field]: filtered }));
  };

  // Handler to clear all form data
  const handleClearForm = () => {
    const clearedFormData: StudentFormData = {
      fullName: "",
      permanentAddress: "",
      district: "",
      province: "",
      dateOfBirth: "",
      nationalId: "",
      passportId: "",
      passportExpiredDate: "",
      sex: "",
      maritalStatus: "",
      spouseName: "",
      numberOfChildren: 0,
      mobilePhone: "",
      whatsappNumber: "",
      hasDrivingLicense: false,
      vehicleType: "",
      emailAddress: "",
      educationOL: false,
      educationAL: false,
      otherQualifications: "",
      workExperience: "",
      workExperienceAbroad: "",
      cvPhotoUrl: null,
      studentId: "",
      expectedJobCategory: "",
      status: "Pending",
      guardianName: "",
      guardianContact: "",
    };
    
    setFormData(clearedFormData);
    setError("");
    setEmailError("");
    setOcrError("");
    setOcrSummary(null);
    console.log("🧹 Form data cleared");
  };

  // Main return statement
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{isEdit ? "Edit Student" : "Add New Student"}</CardTitle>
              <CardDescription>
                {isEdit ? "Update student information" : "Enter comprehensive student details"}
              </CardDescription>
            </div>
            {!isEdit && (
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="h-10"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Processing..." : "Import from Document"}
                </Button>
                <Button
                  type="button"
                  className="h-10"
                  onClick={handleSavePdf}
                >
                  Save
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
                {ocrError && (
                  <div className={`mt-2 text-sm ${ocrError.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
                    {ocrError}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* OCR Summary Section - Only shown after document import */}
          {!isEdit && ocrSummary && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Document Processing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-600 font-medium">Accuracy Rate</span>
                    <span className={`text-lg font-bold ${ocrSummary.accuracy >= 80 ? 'text-green-600' : ocrSummary.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {ocrSummary.accuracy}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 font-medium">Fields Extracted</span>
                    <span className="text-lg font-bold text-blue-600">
                      {ocrSummary.fieldsExtracted}/{ocrSummary.totalFields}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 font-medium">Document Type</span>
                    <span className="text-sm font-medium text-gray-800">
                      {ocrSummary.documentType}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 font-medium">Processing Time</span>
                    <span className="text-lg font-bold text-purple-600">
                      {ocrSummary.processingTime}s
                    </span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> Please review all extracted fields before submitting. You can manually edit any incorrect information.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student ID at the top */}
            <div className="mb-4">
              <Label htmlFor="studentId">Student ID (e.g., N213xxxx) *</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => handleStudentIdInput(e.target.value)}
                maxLength={10}
                required
                disabled={loading}
              />
            </div>
            {/* ...existing code for all other fields... */}
            {/* Guardian's Name and Contact Number */}
            {/* Full Name */}
            <div className="mb-4">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleTextOnlyInput("fullName", e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {/* Permanent Address */}
            <div className="mb-4">
              <Label htmlFor="permanentAddress">Permanent Address *</Label>
              <Input
                id="permanentAddress"
                value={formData.permanentAddress}
                onChange={(e) => handleAddressInput("permanentAddress", e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {/* Province and District */}
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="province">Province *</Label>
                <Select value={formData.province} onValueChange={handleProvinceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((prov) => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="district">District *</Label>
                <Select 
                  key={`district-${formData.province}`} 
                  value={formData.district} 
                  onValueChange={(value) => handleInputChange("district", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {(districts[formData.province as keyof typeof districts] || []).map((dist: string) => (
                      <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Date of Birth */}
            <div className="mb-4">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {/* National ID */}
            <div className="mb-4">
              <Label htmlFor="nationalId">National ID *</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => handleNationalIdInput(e.target.value)}
                maxLength={12}
                required
                disabled={loading}
              />
            </div>
            {/* Passport ID and Expiry */}
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="passportId">Passport ID</Label>
                <Input
                  id="passportId"
                  value={formData.passportId}
                  onChange={(e) => handlePassportIdInput(e.target.value)}
                  maxLength={9}
                  disabled={loading}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="passportExpiredDate">Passport Expiry Date</Label>
                <Input
                  id="passportExpiredDate"
                  type="date"
                  value={formData.passportExpiredDate}
                  onChange={(e) => handleInputChange("passportExpiredDate", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            {/* Gender */}
            <div className="mb-4">
              <Label htmlFor="sex">Gender *</Label>
              <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Marital Status, Spouse Name, and Number of Children in one row */}
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="maritalStatus">Marital Status *</Label>
                <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange("maritalStatus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.maritalStatus === "married" && (
                <div className="flex-1">
                  <Label htmlFor="spouseName">Spouse Name</Label>
                  <Input
                    id="spouseName"
                    value={formData.spouseName}
                    onChange={(e) => handleTextOnlyInput("spouseName", e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
              <div className="flex-1">
                <Label htmlFor="numberOfChildren">Number of Children</Label>
                <Input
                  id="numberOfChildren"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.numberOfChildren}
                  onChange={(e) => handleNumberOfChildrenInput(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            {/* Mobile Phone and WhatsApp */}
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="mobilePhone">Mobile Phone *</Label>
                <div className="flex items-center">
                  <span className="px-2 py-2 border border-r-0 rounded-l bg-gray-100 select-none">+94</span>
                  <Input
                    id="mobilePhone"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{9}"
                    maxLength={9}
                    className="rounded-l-none"
                    value={formData.mobilePhone}
                    onChange={(e) => handleSriLankaPhoneInput("mobilePhone", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="whatsappNumber">WhatsApp / Viber / Imo *</Label>
                <div className="flex items-center">
                  <span className="px-2 py-2 border border-r-0 rounded-l bg-gray-100 select-none">+94</span>
                  <Input
                    id="whatsappNumber"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{9}"
                    maxLength={9}
                    className="rounded-l-none"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleSriLankaPhoneInput("whatsappNumber", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            {/* Guardian's Name and Contact Number */}
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="guardianName">Guardian's Name *</Label>
                <Input
                  id="guardianName"
                  value={formData.guardianName || ""}
                  onChange={(e) => handleTextOnlyInput("guardianName", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="guardianContact">Guardian's Contact Number (+94xxxxxxxxx) *</Label>
                <div className="flex items-center">
                  <span className="px-2 py-2 border border-r-0 rounded-l bg-gray-100 select-none">+94</span>
                  <Input
                    id="guardianContact"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{9}"
                    maxLength={9}
                    className="rounded-l-none"
                    value={formData.guardianContact || ""}
                    onChange={(e) => handleSriLankaPhoneInput("guardianContact", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            {/* Has Driving License and Vehicle Type */}
            <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 flex items-center space-x-2">
                <Label htmlFor="hasDrivingLicense">Has Driving License?</Label>
                <Checkbox
                  id="hasDrivingLicense"
                  checked={formData.hasDrivingLicense}
                  onCheckedChange={(checked) => handleInputChange("hasDrivingLicense", checked)}
                />
              </div>
              {formData.hasDrivingLicense && (
                <div className="flex-1">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Input
                    id="vehicleType"
                    value={formData.vehicleType}
                    onChange={(e) => handleTextOnlyInput("vehicleType", e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
            </div>
            {/* Email Address */}
            <div className="mb-4">
              <Label htmlFor="emailAddress">Email Address *</Label>
              <Input
                id="emailAddress"
                type="email"
                value={formData.emailAddress}
                onChange={(e) => handleEmailInput(e.target.value)}
                disabled={loading}
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>
            {/* Education Qualification */}
            <div className="mb-4">
              <Label>Education Qualification *</Label>
              <div className="flex flex-row gap-6 items-center mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="educationOL"
                    checked={formData.educationOL}
                    onCheckedChange={(checked) => handleInputChange("educationOL", checked)}
                    disabled={loading}
                  />
                  <Label htmlFor="educationOL">G.C.E (O/L)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="educationAL"
                    checked={formData.educationAL}
                    onCheckedChange={(checked) => handleInputChange("educationAL", checked)}
                    disabled={loading}
                  />
                  <Label htmlFor="educationAL">G.C.E (A/L)</Label>
                </div>
              </div>
            </div>
            {/* Expected Job Category and Sub Category */}
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="expectedJobCategory">Expected Job Category *</Label>
                <Select value={formData.expectedJobCategory || ""} onValueChange={(value) => handleInputChange("expectedJobCategory", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nursing care">Nursing care</SelectItem>
                    <SelectItem value="Building Cleaning">Building Cleaning</SelectItem>
                    <SelectItem value="Industrial manufacturing">Industrial manufacturing</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Shipbuilding and Marine Industry">Shipbuilding and Marine Industry</SelectItem>
                    <SelectItem value="Automobile Maintenance">Automobile Maintenance</SelectItem>
                    <SelectItem value="Aviation">Aviation</SelectItem>
                    <SelectItem value="Accommodation">Accommodation</SelectItem>
                    <SelectItem value="Automobile transport industry">Automobile transport industry</SelectItem>
                    <SelectItem value="Railway">Railway</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Fisheries">Fisheries</SelectItem>
                    <SelectItem value="Food and beverage manufacturing">Food and beverage manufacturing</SelectItem>
                    <SelectItem value="Food service">Food service</SelectItem>
                    <SelectItem value="Forestry">Forestry</SelectItem>
                    <SelectItem value="Timber Industry">Timber Industry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Other Qualifications */}
            <div className="mb-4">
              <Label htmlFor="otherQualifications">Other Qualifications</Label>
              <Textarea
                id="otherQualifications"
                value={formData.otherQualifications}
                onChange={(e) => handleAlphanumericTextInput("otherQualifications", e.target.value)}
                disabled={loading}
              />
            </div>
            {/* Local Work Experience */}
            <div className="mb-4">
              <Label htmlFor="workExperience">Local Work Experience</Label>
              <Textarea
                id="workExperience"
                value={formData.workExperience}
                onChange={(e) => handleAlphanumericTextInput("workExperience", e.target.value)}
                disabled={loading}
              />
            </div>
            {/* Work Experience Abroad */}
            <div className="mb-4">
              <Label htmlFor="workExperienceAbroad">Work Experience Abroad</Label>
              <Textarea
                id="workExperienceAbroad"
                value={formData.workExperienceAbroad}
                onChange={(e) => handleAlphanumericTextInput("workExperienceAbroad", e.target.value)}
                disabled={loading}
              />
            </div>
            {/* ...existing code for all other fields... */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-4 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Update Student" : "Add Student"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClearForm} disabled={loading}>
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
