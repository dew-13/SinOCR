"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface StudentFormProps {
  student?: any
  isEdit?: boolean
}

export default function StudentForm({ student, isEdit = false }: StudentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
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
    educationQualification: student?.education_qualification || "",
    otherQualifications: student?.other_qualifications || "",
    workExperience: student?.work_experience || "",
    workExperienceAbroad: student?.work_experience_abroad || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

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
        body: JSON.stringify(formData),
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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Student" : "Add New Student"}</CardTitle>
        <CardDescription>
          {isEdit ? "Update student information" : "Enter comprehensive student details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
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

              <div>
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange("nationalId", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="sex">Gender *</Label>
                <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maritalStatus">Marital Status *</Label>
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
                <div>
                  <Label htmlFor="spouseName">Spouse Name</Label>
                  <Input
                    id="spouseName"
                    value={formData.spouseName}
                    onChange={(e) => handleInputChange("spouseName", e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="numberOfChildren">Number of Children</Label>
                <Input
                  id="numberOfChildren"
                  type="number"
                  min="0"
                  value={formData.numberOfChildren}
                  onChange={(e) => handleInputChange("numberOfChildren", Number.parseInt(e.target.value) || 0)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="permanentAddress">Permanent Address *</Label>
                <Textarea
                  id="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={(e) => handleInputChange("permanentAddress", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="province">Province *</Label>
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

              <div>
                <Label htmlFor="district">District *</Label>
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
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobilePhone">Mobile Phone *</Label>
                <Input
                  id="mobilePhone"
                  value={formData.mobilePhone}
                  onChange={(e) => handleInputChange("mobilePhone", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Passport Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Passport Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passportId">Passport ID</Label>
                <Input
                  id="passportId"
                  value={formData.passportId}
                  onChange={(e) => handleInputChange("passportId", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
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
          </div>

          {/* Driving License */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Driving License</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDrivingLicense"
                  checked={formData.hasDrivingLicense}
                  onCheckedChange={(checked) => handleInputChange("hasDrivingLicense", checked)}
                />
                <Label htmlFor="hasDrivingLicense">Has Driving License</Label>
              </div>

              {formData.hasDrivingLicense && (
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={formData.vehicleType}
                    onValueChange={(value) => handleInputChange("vehicleType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="light_vehicle">Light Vehicle</SelectItem>
                      <SelectItem value="heavy_vehicle">Heavy Vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Education & Qualifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Education & Qualifications</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="educationQualification">Education Qualification *</Label>
                <Textarea
                  id="educationQualification"
                  value={formData.educationQualification}
                  onChange={(e) => handleInputChange("educationQualification", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="otherQualifications">Other Qualifications</Label>
                <Textarea
                  id="otherQualifications"
                  value={formData.otherQualifications}
                  onChange={(e) => handleInputChange("otherQualifications", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Work Experience</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workExperience">Local Work Experience</Label>
                <Textarea
                  id="workExperience"
                  value={formData.workExperience}
                  onChange={(e) => handleInputChange("workExperience", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="workExperienceAbroad">Work Experience Abroad</Label>
                <Textarea
                  id="workExperienceAbroad"
                  value={formData.workExperienceAbroad}
                  onChange={(e) => handleInputChange("workExperienceAbroad", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

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
