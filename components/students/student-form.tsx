"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera } from "lucide-react"

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
]

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
}

interface StudentFormData {
  fullName: string
  permanentAddress: string
  district: string
  province: string
  dateOfBirth: string
  nationalId: string
  passportId: string
  passportExpiredDate: string
  sex: string
  maritalStatus: string
  spouseName: string
  numberOfChildren: number
  mobilePhone: string
  whatsappNumber: string
  hasDrivingLicense: boolean
  vehicleType: string
  emailAddress: string
  educationOL: boolean
  educationAL: boolean
  otherQualifications: string
  workExperience: string
  workExperienceAbroad: string
  cvPhotoUrl: string | null
}

interface StudentFormProps {
  student?: any
  isEdit?: boolean
}

export default function StudentForm({ student, isEdit = false }: StudentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
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
  })

  // Email validation state
  const [emailError, setEmailError] = useState("");

  /**
   * Handles the image upload event.
   * - Sends the image to the OCR API endpoint.
   * - Receives processed and mapped student data.
   * - Updates the form state to autofill fields.
   */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError("")

    const uploadFormData = new FormData()
    uploadFormData.append("image", file)

    try {
      // API call to the OCR processing endpoint
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: uploadFormData,
      })

      const data = await response.json()

      if (response.ok) {
        // Autofill form with data received from the API
        setFormData((prev) => ({
          ...prev,
          ...data.studentData,
        }))
      } else {
        setError(data.error || "Failed to process image.")
      }
    } catch (error) {
      setError("Network error during image upload. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Passport ID validation: must start with one letter followed by 9 digits
  const isValidPassportId = (passportId: string) => {
    return /^[A-Za-z][0-9]{9}$/.test(passportId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate required fields (update to match all * fields in the form)
    const requiredFields: (keyof StudentFormData)[] = [
      "fullName",
      "permanentAddress",
      "district",
      "province",
      "dateOfBirth",
      "nationalId",
      "passportId",
      "passportExpiredDate",
      "sex",
      "maritalStatus",
      "mobilePhone",
      "whatsappNumber",
      // Education qualification is now two checkboxes, require at least one
      "workExperience",
      "workExperienceAbroad",
    ];
    for (const field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === "string" && (formData[field] as string).trim() === "")) {
        setError("Please complete all required fields marked with *.");
        setLoading(false)
        return
      }
    }
    // Education qualification: require at least one checkbox
    if (!formData.educationOL && !formData.educationAL) {
      setError("Please select at least one Education Qualification.");
      setLoading(false)
      return;
    }
    // Passport ID: if filled, must match pattern
    if (formData.passportId && !isValidPassportId(formData.passportId)) {
      setError("Passport number must start with one letter followed by 9 digits.");
      setLoading(false)
      return;
    }

    // Ensure all optional fields are null if empty
    const payload = {
      ...formData,
      nationalId: formData.nationalId || null,
      passportId: formData.passportId || null,
      passportExpiredDate: formData.passportExpiredDate || null,
      spouseName: formData.spouseName || null,
      mobilePhone: formData.mobilePhone ? `+94${formData.mobilePhone}` : null,
      whatsappNumber: formData.whatsappNumber ? `+94${formData.whatsappNumber}` : null,
      vehicleType: formData.vehicleType || null,
      emailAddress: formData.emailAddress || null,
      otherQualifications: formData.otherQualifications || null,
      workExperience: formData.workExperience || null,
      workExperienceAbroad: formData.workExperienceAbroad || null,
      cvPhotoUrl: formData.cvPhotoUrl || null,
    }

    try {
      const token = localStorage.getItem("token")
      const url = isEdit ? `/api/students/${student.id}` : "/api/students"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/dashboard/students")
      } else {
        setError(data.error || "Failed to save student")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTextOnlyInput = (field: keyof StudentFormData, value: string) => {
    // Allow only letters, spaces, and basic punctuation (adjust as needed)
    const filtered = value.replace(/[^A-Za-z\s]/g, "");
    setFormData((prev) => ({ ...prev, [field]: filtered }));
  };

  // Add a handler for permanent address (letters, numbers, spaces, '/', and ',')
  const handleAddressInput = (field: keyof StudentFormData, value: string) => {
    const filtered = value.replace(/[^A-Za-z0-9\s\/,]/g, "");
    setFormData((prev) => ({ ...prev, [field]: filtered }));
  };

  // Add a handler for National ID and Passport ID (letters and numbers only, max 12 chars for National ID, strict for Passport ID)
  const handleAlphaNumericInput = (field: keyof StudentFormData, value: string) => {
    if (field === "nationalId") {
      let filtered = value.replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
      setFormData((prev) => ({ ...prev, [field]: filtered }));
    } else if (field === "passportId") {
      // Only allow first char as capital letter, then up to 9 digits
      let filtered = value.replace(/[^A-Za-z0-9]/g, "");
      if (filtered.length === 0) {
        setFormData((prev) => ({ ...prev, [field]: "" }));
        return;
      }
      // First char must be capital letter
      let first = filtered[0].toUpperCase();
      let rest = filtered.slice(1).replace(/[^0-9]/g, "").slice(0, 9);
      filtered = /^[A-Z]$/.test(first) ? first + rest : "";
      setFormData((prev) => ({ ...prev, [field]: filtered }));
    } else {
      const filtered = value.replace(/[^A-Za-z0-9]/g, "");
      setFormData((prev) => ({ ...prev, [field]: filtered }));
    }
  };

  // Email validation state
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
    // Remove non-digits
    let digits = value.replace(/\D/g, "");
    // Only allow 9 digits
    if (digits.length > 9) digits = digits.slice(0, 9);
    setFormData((prev) => ({ ...prev, [field]: digits }));
  };

  // Calculate age from date of birth as of December 31st of the current year
  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const currentYear = new Date().getFullYear();
    const endOfYear = new Date(currentYear, 11, 31); // December is month 11
    let age = currentYear - birthDate.getFullYear();
    if (
      birthDate.getMonth() > 11 ||
      (birthDate.getMonth() === 11 && birthDate.getDate() > 31)
    ) {
      age--;
    }
    // If birthday hasn't occurred by Dec 31, subtract 1
    if (
      birthDate.getMonth() > 11 ||
      (birthDate.getMonth() === 11 && birthDate.getDate() > 31)
    ) {
      age--;
    }
    // If birthdate is after Dec 31 of current year, age should be 0
    if (birthDate > endOfYear) return "";
    return age >= 0 ? age : "";
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{isEdit ? "Edit Student" : "Add New Student"}</CardTitle>
            <CardDescription>
              {isEdit ? "Update student information" : "Enter comprehensive student details"}
            </CardDescription>
          </div>
          {!isEdit && (
            <div>
              <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                <Camera className="mr-2 h-4 w-4" /> Import from Document
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          {/* 1. Full Name */}
          <div className="mb-4">
            <Label htmlFor="fullName">1. Full Name සම්පූර්ණ නම * </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleTextOnlyInput("fullName", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* 2. Permanent Address */}
          <div className="mb-4">
            <Label htmlFor="permanentAddress">2. Permanent Address ස්ථීර ලිපිනය  *</Label>
            <Textarea
              id="permanentAddress"
              value={formData.permanentAddress}
              onChange={(e) => handleAddressInput("permanentAddress", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* 3. Province and District (same line) */}
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="province">3. Province පළාත *</Label>
              <Select
                value={formData.province}
                onValueChange={(value) => {
                  handleInputChange("province", value)
                  handleInputChange("district", "") // Reset district when province changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="district">District දිස්ත්‍රික්කය *</Label>
              <Select value={formData.district} onValueChange={(value) => handleInputChange("district", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {formData.province &&
                    districts[formData.province as keyof typeof districts]?.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 4. Date of Birth and Age (same line) */}
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="dateOfBirth">4. Date of Birth උපන් දිනය  *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="age">Age වයස</Label>
              <Input
                id="age"
                type="text"
                value={calculateAge(formData.dateOfBirth)}
                readOnly
                disabled
              />
            </div>
          </div>

          {/* 5. National ID */}
          <div className="mb-4">
            <Label htmlFor="nationalId">5. National ID ජාතික හැදුනුම්පත්අංකය *</Label>
            <Input
              id="nationalId"
              value={formData.nationalId}
              onChange={(e) => handleAlphaNumericInput("nationalId", e.target.value)}
              maxLength={12}
              disabled={loading}
            />
          </div>

          {/* 6. Passport ID and Passport Expiry Date (same line) */}
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="passportId">6. Passport ID විදේශ ගුවන් බලපත්‍ර අංකය *</Label>
              <Input
                id="passportId"
                value={formData.passportId}
                onChange={(e) => handleAlphaNumericInput("passportId", e.target.value)}
                maxLength={10}
                disabled={loading}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="passportExpiredDate">Passport Expiry Date කල් ඉකුත්වන දිනය *</Label>
              <Input
                id="passportExpiredDate"
                type="date"
                value={formData.passportExpiredDate}
                onChange={(e) => handleInputChange("passportExpiredDate", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* 7. Sex */}
          <div className="mb-4">
            <Label htmlFor="sex">7. Sex ස්ත්‍රී පුරුෂ භාවය *</Label>
            <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 8. Marital Status and Spouse Name (same line if married) */}
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="maritalStatus">8. Marital Status විවාහක / අවිවාහක බව *</Label>
              <Select
                value={formData.maritalStatus}
                onValueChange={(value) => handleInputChange("maritalStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.maritalStatus === "married" && (
              <div className="flex-1">
                <Label htmlFor="spouseName">Spouse Name විවාහ වූ අයගේ නම</Label>
                <Input
                  id="spouseName"
                  value={formData.spouseName}
                  onChange={(e) => handleTextOnlyInput("spouseName", e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* 9. Number of Children */}
          <div className="mb-4">
            <Label htmlFor="numberOfChildren">9. Number of Children දරුවන් සංඛ්‍යාව</Label>
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

          {/* 10. Mobile Phone and WhatsApp (same line) */}
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="mobilePhone">10. Mobile Phone දුරකථන අංක *</Label>
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

          {/* 11. Has Driving License and Vehicle Type (same line) */}
          <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 flex items-center space-x-2">
              <Label htmlFor="hasDrivingLicense">11. Has Driving License රියදුරු බලපත්‍රය ලබාගෙන තිබේද ?</Label>
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

          {/* 12. Email Address */}
          <div className="mb-4">
            <Label htmlFor="emailAddress">12. Email Address ඊ-මේල්ලිපිනය *</Label>
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

          {/* 13. Education Qualification */}
          <div className="mb-4">
            <Label>13. Education Qualification අධ්‍යාපන සුදුසුකම් *</Label>
            <div className="flex flex-row gap-6 items-center mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="educationOL"
                  checked={formData.educationOL}
                  onCheckedChange={(checked) => handleInputChange("educationOL", checked)}
                  disabled={loading}
                />
                <Label htmlFor="educationOL">G.C.E (O/L)  අපොස (සාමාන්‍ය පෙළ)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="educationAL"
                  checked={formData.educationAL}
                  onCheckedChange={(checked) => handleInputChange("educationAL", checked)}
                  disabled={loading}
                />
                <Label htmlFor="educationAL">G.C.E (A/L) අපොස (උසස් පෙළ)</Label>
              </div>
            </div>
          </div>

          {/* 13. Other */}
          <div className="mb-4">
            <Label htmlFor="otherQualifications">14. Other වෙනත්</Label>
            <Textarea
              id="otherQualifications"
              value={formData.otherQualifications}
              onChange={(e) => handleTextOnlyInput("otherQualifications", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* 14. Other Qualifications */}
          <div className="mb-4">
            <Label htmlFor="otherQualifications">15. Other Qualifications වෙනත් සුදුසුකම්</Label>
            <Textarea
              id="otherQualifications"
              value={formData.otherQualifications}
              onChange={(e) => handleTextOnlyInput("otherQualifications", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* 16. Local Work Experience */}
          <div className="mb-4">
            <Label htmlFor="workExperience">16. Local Work Experience රැකියා පළපුරුද්ද *</Label>
            <Textarea
              id="workExperience"
              value={formData.workExperience}
              onChange={(e) => handleTextOnlyInput("workExperience", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* 17. Work Experience Abroad */}
          <div className="mb-4">
            <Label htmlFor="workExperienceAbroad">17. Work Experience Abroad විදේශ රැකියාපළපුරුද්ද *</Label>
            <Textarea
              id="workExperienceAbroad"
              value={formData.workExperienceAbroad}
              onChange={(e) => handleTextOnlyInput("workExperienceAbroad", e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
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
  )
}
