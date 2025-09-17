"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CsvImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface StudentRow {
  studentId: string;
  fullName: string;
  permanentAddress: string;
  district: string;
  province: string;
  dateOfBirth: string;
  nationalId: string;
  passportId?: string;
  passportExpiredDate?: string;
  sex: string;
  maritalStatus: string;
  spouseName?: string;
  numberOfChildren?: number;
  mobilePhone: string;
  whatsappNumber: string;
  hasDrivingLicense: boolean;
  vehicleType?: string;
  emailAddress: string;
  expectedJobCategory: string;
  educationOL: boolean;
  educationAL: boolean;
  otherQualifications?: string;
  workExperience?: string;
  workExperienceAbroad?: string;
  guardianName?: string;
  guardianContact: string;
  admissionDate?: string;
}

const REQUIRED_HEADERS = [
  "studentId",
  "fullName", 
  "permanentAddress",
  "district",
  "province",
  "dateOfBirth",
  "nationalId",
  "sex",
  "maritalStatus",
  "mobilePhone",
  "whatsappNumber",
  "emailAddress",
  "expectedJobCategory",
  "educationOL",
  "educationAL",
  "guardianContact"
];

const OPTIONAL_HEADERS = [
  "passportId",
  "passportExpiredDate", 
  "spouseName",
  "numberOfChildren",
  "hasDrivingLicense",
  "vehicleType",
  "otherQualifications",
  "workExperience",
  "workExperienceAbroad",
  "guardianName",
  "admissionDate"
];

// Client-side validation function
const validateStudentRow = (student: any, rowIndex: number): string[] => {
  const errors: string[] = [];
  
  // Check required fields
  for (const field of REQUIRED_HEADERS) {
    // Handle boolean fields specially - they can be false but should be present
    if (field === 'educationOL' || field === 'educationAL') {
      if (student[field] === undefined || student[field] === null || student[field] === '') {
        errors.push(`Row ${rowIndex}: Missing required field '${field}'`);
      }
    } else {
      // For non-boolean fields, check for empty/missing values
      if (!student[field] || (typeof student[field] === "string" && student[field].trim() === "")) {
        errors.push(`Row ${rowIndex}: Missing required field '${field}'`);
      }
    }
  }
  
  // Validate sex
  if (student.sex && !["male", "female"].includes(student.sex.toLowerCase())) {
    errors.push(`Row ${rowIndex}: Sex must be 'Male' or 'Female' (current: '${student.sex}')`);
  }
  
  // Validate marital status  
  if (student.maritalStatus && !["single", "married", "divorced", "widowed"].includes(student.maritalStatus.toLowerCase())) {
    errors.push(`Row ${rowIndex}: Marital status must be 'Single', 'Married', 'Divorced', or 'Widowed' (current: '${student.maritalStatus}')`);
  }
  
  // Validate date format (YYYY-MM-DD)
  if (student.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(student.dateOfBirth)) {
    errors.push(`Row ${rowIndex}: Date of birth must be in YYYY-MM-DD format (current: '${student.dateOfBirth}') - Example: 1990-01-01`);
  }
  
  // Validate admission date format if provided
  if (student.admissionDate && !/^\d{4}-\d{2}-\d{2}$/.test(student.admissionDate)) {
    errors.push(`Row ${rowIndex}: Admission date must be in YYYY-MM-DD format (current: '${student.admissionDate}') - Example: 2025-09-17`);
  }
  
  // Validate email format
  if (student.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.emailAddress)) {
    errors.push(`Row ${rowIndex}: Invalid email address format (current: '${student.emailAddress}') - Example: user@example.com`);
  }
  
  // Validate phone numbers (Sri Lankan format)
  if (student.mobilePhone && !/^07\d{8}$/.test(student.mobilePhone)) {
    errors.push(`Row ${rowIndex}: Mobile phone must start with 07 and have 10 digits (current: '${student.mobilePhone}') - Example: 0771234567`);
  }
  
  if (student.whatsappNumber && !/^07\d{8}$/.test(student.whatsappNumber)) {
    errors.push(`Row ${rowIndex}: WhatsApp number must start with 07 and have 10 digits (current: '${student.whatsappNumber}') - Example: 0771234567`);
  }
  
  if (student.guardianContact && !/^07\d{8}$/.test(student.guardianContact)) {
    errors.push(`Row ${rowIndex}: Guardian contact must start with 07 and have 10 digits (current: '${student.guardianContact}') - Example: 0771234567`);
  }
  
  // Validate education qualifications
  const hasOL = student.educationOL?.toString().toLowerCase() === 'true';
  const hasAL = student.educationAL?.toString().toLowerCase() === 'true';
  if (!hasOL && !hasAL) {
    errors.push(`Row ${rowIndex}: At least one education qualification (OL or AL) must be 'true'`);
  }
  
  // Validate studentId format (basic check)
  if (student.studentId && student.studentId.length < 3) {
    errors.push(`Row ${rowIndex}: Student ID seems too short (current: '${student.studentId}')`);
  }
  
  return errors;
};

// Function to detect common CSV formatting issues
const detectCSVIssues = (lines: string[]): string[] => {
  const issues: string[] = [];
  
  // Check for duplicate headers (common copy-paste error)
  const firstLine = lines[0];
  const headers = firstLine.split(',');
  const uniqueHeaders = new Set(headers);
  if (headers.length !== uniqueHeaders.size) {
    issues.push("Duplicate column headers detected. Each column must have a unique name.");
  }
  
  // Check for very long lines (might indicate merged rows)
  lines.forEach((line, index) => {
    if (line.length > 2000) {
      issues.push(`Row ${index + 1} seems unusually long (${line.length} characters). Check for merged rows or missing line breaks.`);
    }
  });
  
  // Check for inconsistent column counts in first few rows
  const headerCount = headers.length;
  for (let i = 1; i < Math.min(lines.length, 6); i++) {
    const columns = lines[i].split(',').length;
    if (columns !== headerCount && lines[i].trim()) {
      issues.push(`Row ${i + 1} has ${columns} columns, but header has ${headerCount}. Check for missing commas or extra content.`);
    }
  }
  
  return issues;
};

export default function CsvImport({ onClose, onSuccess }: CsvImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<StudentRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [processingReport, setProcessingReport] = useState<string[]>([]);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please select a valid CSV file");
        return;
      }
      setFile(selectedFile);
      setError("");
      setProcessingReport([]);
      setShowDetailedReport(false);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Handle both Windows (\r\n) and Unix (\n) line endings
      const lines = text.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setError("CSV file must contain at least a header row and one data row");
        return;
      }

      // Parse CSV properly handling quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
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
      };

      const headers = parseCSVLine(lines[0]);
      const errors: string[] = [];
      const report: string[] = [];
      
      // Check for common CSV formatting issues first
      const csvIssues = detectCSVIssues(lines);
      if (csvIssues.length > 0) {
        errors.push(...csvIssues);
        report.push("🚨 CSV Format Issues Detected:");
        csvIssues.forEach(issue => {
          report.push(`   • ${issue}`);
        });
        report.push("");
      }
      
      // Generate detailed report
      report.push("=== CSV Processing Report ===");
      report.push(`📄 File: ${file.name}`);
      report.push(`📊 Total rows: ${lines.length} (including header)`);
      report.push(`📋 Headers found: ${headers.length} columns`);
      report.push("");
      
      report.push("📝 Column Headers:");
      headers.forEach((header, index) => {
        const type = REQUIRED_HEADERS.includes(header) ? "REQUIRED" : "OPTIONAL";
        const num = (index + 1).toString().padStart(2);
        report.push(`   ${num}. ${header.padEnd(25)} [${type}]`);
      });
      report.push("");
      
      // Validate headers
      const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
        report.push(`❌ Missing required headers: ${missingHeaders.join(', ')}`);
      } else {
        report.push("✅ All required headers present");
      }
      report.push("");

      // Parse data rows
      const students: StudentRow[] = [];
      report.push(`🔄 Processing ${lines.length - 1} data rows...`);
      report.push("");
      
      for (let i = 1; i < lines.length; i++) {
        report.push(`--- Processing Row ${i + 1} ---`);
        const values = parseCSVLine(lines[i]);
        report.push(`📊 Parsed ${values.length} values`);
        
        if (values.length !== headers.length) {
          const errorMsg = `Row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`;
          errors.push(errorMsg);
          report.push(`❌ ${errorMsg}`);
          continue;
        }

        const student: any = {};
        headers.forEach((header, index) => {
          student[header] = values[index];
        });

        report.push(`👤 Student: ${student.fullName} (${student.studentId})`);
        report.push(`📍 Location: ${student.district}, ${student.province}`);
        report.push(`📧 Contact: ${student.emailAddress}`);

        // Convert boolean fields
        const originalOL = student.educationOL;
        const originalAL = student.educationAL;
        const originalLicense = student.hasDrivingLicense;
        
        student.educationOL = student.educationOL?.toLowerCase() === 'true';
        student.educationAL = student.educationAL?.toLowerCase() === 'true';
        student.hasDrivingLicense = student.hasDrivingLicense?.toLowerCase() === 'true';
        
        report.push(`🎓 Education: OL=${originalOL}→${student.educationOL}, AL=${originalAL}→${student.educationAL}`);
        report.push(`🚗 License: ${originalLicense}→${student.hasDrivingLicense}`);
        
        // Convert number fields
        if (student.numberOfChildren) {
          const original = student.numberOfChildren;
          student.numberOfChildren = parseInt(student.numberOfChildren) || 0;
          report.push(`👶 Children: ${original}→${student.numberOfChildren}`);
        }

        // Client-side validation
        const clientValidationErrors = validateStudentRow(student, i + 1);
        if (clientValidationErrors.length > 0) {
          errors.push(...clientValidationErrors);
          report.push(`❌ Validation errors for Row ${i + 1}:`);
          clientValidationErrors.forEach(err => {
            report.push(`   • ${err}`);
          });
          report.push("");
          continue;
        }

        report.push(`✅ Row ${i + 1} processed successfully`);
        report.push("");
        students.push(student);
      }

      if (errors.length === 0) {
        report.push(`🎉 Successfully processed ${students.length} students!`);
      } else {
        report.push(`⚠️ Processed ${students.length} students with ${errors.length} errors`);
      }

      setValidationErrors(errors);
      setProcessingReport(report);
      setPreview(students.slice(0, 5)); // Show first 5 rows for preview
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS];
    const sampleRow = [
      // Required fields (in order of REQUIRED_HEADERS)
      "STU001", // studentId
      "John Doe", // fullName
      "123 Main St Colombo", // permanentAddress (no commas to avoid CSV parsing issues)
      "Colombo", // district
      "Western", // province
      "1990-01-01", // dateOfBirth (YYYY-MM-DD format - NOT DD/MM/YYYY)
      "900000000V", // nationalId
      "Male", // sex (Male/Female - NOT M/F)
      "Single", // maritalStatus (Single/Married/Divorced/Widowed)
      "0771234567", // mobilePhone (MUST start with 07 - NOT 771234567)
      "0771234567", // whatsappNumber (MUST start with 07 - NOT 771234567)
      "john@example.com", // emailAddress
      "IT", // expectedJobCategory
      "true", // educationOL (true/false)
      "true", // educationAL (true/false)
      "0771234568", // guardianContact (MUST start with 07 - NOT 771234568)
      
      // Optional fields (in order of OPTIONAL_HEADERS)
      "N1234567", // passportId (optional)
      "2030-12-31", // passportExpiredDate (optional, YYYY-MM-DD format)
      "", // spouseName (optional)
      "0", // numberOfChildren (optional, number)
      "false", // hasDrivingLicense (optional, true/false)
      "", // vehicleType (optional)
      "", // otherQualifications (optional)
      "", // workExperience (optional)
      "", // workExperienceAbroad (optional)
      "Jane Doe", // guardianName (optional)
      "2025-09-17" // admissionDate (optional, YYYY-MM-DD format - NOT DD/MM/YYYY)
    ];
    
    // Function to escape CSV values that contain commas, quotes, or newlines
    const escapeCsvValue = (value: string | number): string => {
      const stringValue = String(value);
      
      // If the value contains comma, quote, or newline, wrap it in quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        // Escape any existing quotes by doubling them
        const escapedValue = stringValue.replace(/"/g, '""');
        return `"${escapedValue}"`;
      }
      return stringValue;
    };
    
    const csvHeaders = headers.join(',');
    const csvRow = sampleRow.map(escapeCsvValue).join(',');
    const csvContent = [csvHeaders, csvRow].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file || validationErrors.length > 0) return;

    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem("token");
      const response = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        const importReport: string[] = [];
        importReport.push("=== Import Results ===");
        importReport.push(`✅ Successfully imported: ${data.imported} students`);
        importReport.push(`❌ Errors encountered: ${data.errors?.length || 0}`);
        
        if (data.errors?.length > 0) {
          importReport.push("");
          importReport.push("Error Details:");
          data.errors.forEach((error: string) => {
            importReport.push(`  • ${error}`);
          });
        }
        
        setProcessingReport(prev => [...prev, "", ...importReport]);
        setSuccess(`Successfully imported ${data.imported} students. ${data.errors?.length || 0} errors occurred.`);
        
        if (data.errors?.length > 0) {
          setValidationErrors(data.errors);
        }
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(data.error || "Failed to import students");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto max-h-[90vh] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Import Students from CSV</CardTitle>
            <CardDescription>
              Upload a CSV file to add multiple students at once
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 overflow-y-auto flex-1 min-h-0">
        {/* Download Template */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm ">
              Download a template CSV file with all required columns
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="csvFile">Choose CSV File</Label>
          <div className="flex items-center gap-4">
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={loading}
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                {file.name}
              </div>
            )}
          </div>
        </div>

        {/* Data Format Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 max-h-48 overflow-y-auto">
          <h4 className="font-semibold text-blue-900 mb-2">📋 Data Format Requirements</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div><strong>Sex:</strong> Must be "Male" or "Female" (not M/F)</div>
            <div><strong>Marital Status:</strong> Must be "Single", "Married", "Divorced", or "Widowed"</div>
            <div><strong>Dates:</strong> Must be YYYY-MM-DD format (e.g., 1990-01-01) ❌ NOT DD/MM/YYYY</div>
            <div><strong>Phone Numbers:</strong> Must start with 07 (e.g., 0771234567) ❌ NOT 771234567</div>
            <div><strong>Email:</strong> Must be valid email format (e.g., user@example.com)</div>
            <div><strong>Education:</strong> At least one of OL or AL must be "true"</div>
            <div><strong>Boolean Fields:</strong> Use "true" or "false" (case insensitive)</div>
            <div><strong>Addresses:</strong> Avoid commas in addresses or use full quotes if needed</div>
            <div><strong>Text Fields:</strong> Avoid line breaks and special characters when possible</div>
          </div>
        </div>
        
        {/* Common Mistakes Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <h4 className="font-semibold text-amber-800 mb-2">⚠️ Common Mistakes to Avoid</h4>
          <div className="text-sm text-amber-700 space-y-1">
            <div>• Don't use DD/MM/YYYY date format (use YYYY-MM-DD instead)</div>
            <div>• Don't forget "07" prefix for phone numbers</div>
            <div>• Don't use "M"/"F" for sex (use "Male"/"Female")</div>
            <div>• Don't leave required fields empty</div>
            <div>• Don't mix date formats within the same file</div>
          </div>
        </div>

        {/* Validation Summary */}
        {(validationErrors.length > 0 || (preview.length > 0 && validationErrors.length === 0)) && (
          <div className="space-y-2">
            <Label>Validation Summary</Label>
            <div className={`border rounded-md p-4 ${validationErrors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              {validationErrors.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <span>❌</span>
                    <span>{validationErrors.length} validation error(s) found</span>
                  </div>
                  <div className="text-sm text-red-700">
                    Please fix these errors before importing:
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <span>✅</span>
                  <span>All {preview.length} rows passed validation</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-semibold">Validation Errors:</div>
                <div className="max-h-40 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-sm">• {error}</div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Processing Report */}
        {processingReport.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Processing Report</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDetailedReport(!showDetailedReport)}
              >
                {showDetailedReport ? "Hide Details" : "Show Details"}
              </Button>
            </div>
            {showDetailedReport && (
              <div className="border rounded-md p-4 bg-gray-50 max-h-80 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
                  {processingReport.join('\n')}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && validationErrors.length === 0 && (
          <div className="space-y-2">
            <Label>Preview (First 5 rows)</Label>
            <div className="border rounded-md p-4 bg-gray-50 max-h-64 overflow-y-auto">
              <div className="text-sm space-y-2">
                {preview.map((student, index) => (
                  <div key={index} className="border-b pb-2 last:border-b-0">
                    <div className="font-medium">Row {index + 1}:</div>
                    <div className="text-gray-700">
                      <span className="font-semibold">{student.fullName}</span> ({student.studentId})
                    </div>
                    <div className="text-gray-600 text-xs">
                      {student.district}, {student.province} • {student.emailAddress}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      {/* Actions - Fixed at bottom */}
      <div className="flex-shrink-0 border-t bg-white p-6">
        <div className="flex gap-4">
          <Button 
            onClick={handleImport} 
            disabled={!file || loading || validationErrors.length > 0}
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? "Importing..." : "Import Students"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}