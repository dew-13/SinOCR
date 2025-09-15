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
import React, { useState, useRef } from "react";
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
  // Handler for image upload (OCR)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    setOcrError("");
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);
    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await response.json();
      if (response.ok) {
        // You can parse OCR data and update formData here if needed
      } else {
        setOcrError(data.error || "OCR failed");
      }
    } catch (err) {
      setOcrError("OCR request failed");
    }
    setLoading(false);
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

  // Handler for generic input change
  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
                  <div className="mt-2 text-red-500 text-sm">{ocrError}</div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
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
                <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
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
                <Select value={formData.district} onValueChange={(value) => handleInputChange("district", value)}>
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
            {/* Sex */}
            <div className="mb-4">
              <Label htmlFor="sex">Sex *</Label>
              <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
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
              <Label htmlFor="workExperience">Local Work Experience *</Label>
              <Textarea
                id="workExperience"
                value={formData.workExperience}
                onChange={(e) => handleAlphanumericTextInput("workExperience", e.target.value)}
                disabled={loading}
              />
            </div>
            {/* Work Experience Abroad */}
            <div className="mb-4">
              <Label htmlFor="workExperienceAbroad">Work Experience Abroad *</Label>
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
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
