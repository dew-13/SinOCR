import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createStudent } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

interface StudentData {
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

const REQUIRED_FIELDS = [
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

function validateStudentData(student: any, rowIndex: number): string[] {
  const errors: string[] = [];
  
  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    // Handle boolean fields specially - they can be false but should be present
    if (field === 'educationOL' || field === 'educationAL') {
      if (student[field] === undefined || student[field] === null) {
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
    errors.push(`Row ${rowIndex}: Sex must be 'Male'/'male' or 'Female'/'female'`);
  }
  
  // Validate marital status  
  if (student.maritalStatus && !["single", "married", "divorced", "widowed"].includes(student.maritalStatus.toLowerCase())) {
    errors.push(`Row ${rowIndex}: Marital status must be 'Single', 'Married', 'Divorced', or 'Widowed' (case insensitive)`);
  }
  
  // Validate date format (YYYY-MM-DD)
  if (student.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(student.dateOfBirth)) {
    errors.push(`Row ${rowIndex}: Date of birth must be in YYYY-MM-DD format`);
  }
  
  // Validate admission date format if provided
  if (student.admissionDate && !/^\d{4}-\d{2}-\d{2}$/.test(student.admissionDate)) {
    errors.push(`Row ${rowIndex}: Admission date must be in YYYY-MM-DD format`);
  }
  
  // Validate email format
  if (student.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.emailAddress)) {
    errors.push(`Row ${rowIndex}: Invalid email address format`);
  }
  
  // Validate phone numbers (Sri Lankan format)
  if (student.mobilePhone && !/^07\d{8}$/.test(student.mobilePhone)) {
    errors.push(`Row ${rowIndex}: Mobile phone must be in format 07XXXXXXXX`);
  }
  
  if (student.whatsappNumber && !/^07\d{8}$/.test(student.whatsappNumber)) {
    errors.push(`Row ${rowIndex}: WhatsApp number must be in format 07XXXXXXXX`);
  }
  
  if (student.guardianContact && !/^07\d{8}$/.test(student.guardianContact)) {
    errors.push(`Row ${rowIndex}: Guardian contact must be in format 07XXXXXXXX`);
  }
  
  // Validate education qualifications
  if (!student.educationOL && !student.educationAL) {
    errors.push(`Row ${rowIndex}: At least one education qualification (OL or AL) must be selected`);
  }
  
  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!hasPermission(decoded.role, "CREATE_STUDENT")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
    }

    const text = await file.text();
    // Handle both Windows (\r\n) and Unix (\n) line endings
    const lines = text.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file must contain at least a header row and one data row" }, { status: 400 });
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
    
    // Validate headers
    const missingHeaders = REQUIRED_FIELDS.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}` 
      }, { status: 400 });
    }

    const students: StudentData[] = [];
    const errors: string[] = [];
    
    // Parse CSV data
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`);
        continue;
      }

      const student: any = {};
      headers.forEach((header, index) => {
        student[header] = values[index];
      });

      // Convert boolean fields
      student.educationOL = student.educationOL?.toLowerCase() === 'true';
      student.educationAL = student.educationAL?.toLowerCase() === 'true';
      student.hasDrivingLicense = student.hasDrivingLicense?.toLowerCase() === 'true';
      
      // Convert number fields
      if (student.numberOfChildren) {
        student.numberOfChildren = parseInt(student.numberOfChildren) || 0;
      }

      // Normalize text fields to match database constraints
      if (student.sex) {
        student.sex = student.sex.toLowerCase();
      }
      if (student.maritalStatus) {
        student.maritalStatus = student.maritalStatus.toLowerCase();
      }

      // Set default values for fields expected by createStudent function
      student.createdBy = decoded.userId;
      student.admissionDate = student.admissionDate || new Date().toISOString().split('T')[0];
      student.status = student.status || 'Pending';
      student.expectedSubJobCategory = student.expectedSubJobCategory || '';
      student.cvPhotoUrl = null;

      // Validate student data
      const validationErrors = validateStudentData(student, i + 1);
      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
        continue;
      }

      students.push(student);
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: "Validation errors found", 
        errors: errors 
      }, { status: 400 });
    }

    // Import students
    const results = {
      imported: 0,
      errors: [] as string[]
    };

    for (let i = 0; i < students.length; i++) {
      try {
        await createStudent(students[i]);
        results.imported++;
      } catch (error: any) {
        results.errors.push(`Row ${i + 2}: ${error.message || 'Failed to create student'}`);
      }
    }

    return NextResponse.json(results);
    
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}