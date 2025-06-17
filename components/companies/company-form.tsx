"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Common industries for selection
const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Construction",
  "Transportation",
  "Energy",
  "Agriculture",
  "Other",
]

// Add this after the existing industries array
const prefectures = [
  "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima",
  "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa",
  "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu",
  "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara",
  "Wakayama", "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi",
  "Tokushima", "Kagawa", "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki",
  "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa"
]

interface CompanyFormProps {
  company?: any
  isEdit?: boolean
  onSuccess?: () => void
}

export default function CompanyForm({ company, isEdit = false, onSuccess }: CompanyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    companyName: company?.company_name || "",
    country: company?.country || "Japan", // Set Japan as default
    industry: company?.industry || "",
    contactPerson: company?.contact_person || "",
    contactEmail: company?.contact_email || "",
    contactPhone: company?.contact_phone || "",
    postalCode: company?.postal_code || "",
    prefecture: company?.prefecture || "",
    city: company?.city || "",
    district: company?.district || "",
    buildingNumber: company?.building_number || "",
  })

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    // Remove any non-digit characters
    const digitsOnly = phone.replace(/\D/g, "")
    // Check if it's a valid Japanese phone number (10-11 digits)
    return digitsOnly.length >= 10 && digitsOnly.length <= 11
  }

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      setError("Company name is required")
      return false
    }
    if (!formData.industry) {
      setError("Industry is required")
      return false
    }
    if (!formData.contactPerson.trim()) {
      setError("Contact person is required")
      return false
    }
    if (!formData.contactEmail.trim()) {
      setError("Contact email is required")
      return false
    }
    if (!validateEmail(formData.contactEmail)) {
      setError("Please enter a valid email address (e.g., contact@company.com)")
      return false
    }
    if (!formData.contactPhone.trim()) {
      setError("Contact phone is required")
      return false
    }
    if (!validatePhone(formData.contactPhone)) {
      setError("Please enter a valid Japanese phone number (e.g., 090-1234-5678)")
      return false
    }
    if (!formData.postalCode.trim()) {
      setError("Postal code is required")
      return false
    }
    if (!formData.prefecture.trim()) {
      setError("Prefecture is required")
      return false
    }
    if (!formData.city.trim()) {
      setError("City is required")
      return false
    }
    if (!formData.district.trim()) {
      setError("District is required")
      return false
    }
    if (!formData.buildingNumber.trim()) {
      setError("Building number is required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const url = isEdit ? `/api/companies/${company.id}` : "/api/companies"
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
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/dashboard/companies")
        }
      } else {
        setError(data.error || "Failed to save company")
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    handleInputChange("contactPhone", value)
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Company" : "Add New Company"}</CardTitle>
        <CardDescription>
          {isEdit ? "Update company information" : "Enter comprehensive company details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  required
                  disabled={loading}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
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
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  required
                  disabled={loading}
                  placeholder="contact@company.com"
                />
                
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Phone *</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={handlePhoneChange}
                  required
                  disabled={loading}
                  placeholder="+81-090-1234-5678"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a valid Japanese phone number (10-11 digits)
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  required
                  disabled={loading}
                  placeholder="123-4567"
                />
              </div>

              <div>
                <Label htmlFor="prefecture">Prefecture *</Label>
                <Select value={formData.prefecture} onValueChange={(value) => handleInputChange("prefecture", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select prefecture" />
                  </SelectTrigger>
                  <SelectContent>
                    {prefectures.map((prefecture) => (
                      <SelectItem key={prefecture} value={prefecture}>
                        {prefecture}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter city name"
                />
              </div>

              <div>
                <Label htmlFor="district">District/Street *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter district or street name"
                />
              </div>

              <div>
                <Label htmlFor="buildingNumber">Building Number *</Label>
                <Input
                  id="buildingNumber"
                  value={formData.buildingNumber}
                  onChange={(e) => handleInputChange("buildingNumber", e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter building number"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Company" : "Add Company"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 