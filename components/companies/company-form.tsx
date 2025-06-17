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
  "Food Service",
  "Agriculture",
  "Airport Ground Handling",
  "Building Cleaning",
  "Care Giver",
  "Driving",
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

// Add a list of countries
const countries = [
  "Japan", "United Arab Emirates", "Qatar", "Saudi Arabia", "Kuwait", "Bahrain", "Oman", "India", "Singapore", "Malaysia", "Other"
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
    country: company?.country || "Japan",
    industry: company?.industry || "",
    contactPerson: company?.contact_person || "",
    contactEmail: company?.contact_email || "",
    contactPhone: company?.contact_phone || "+81-",
    address: company?.address || "",
  })

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    // Expect format: +81-XX-XXXX-XXXX
    const phoneRegex = /^\+81\-\d{2}\-\d{4}\-\d{4}$/
    return phoneRegex.test(phone)
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
    if (!formData.contactPhone.trim() || formData.contactPhone === "+81-") {
      setError("Contact phone is required")
      return false
    }
    if (!validatePhone(formData.contactPhone)) {
      setError("Please enter a valid Japanese phone number (e.g., +81-90-1234-5678)")
      return false
    }
    if (!formData.address.trim()) {
      setError("Address is required")
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

  const formatPhoneInput = (value: string) => {
    // Remove all non-digit characters except the initial '+81-'
    let digits = value.replace(/[^\d]/g, "")
    if (digits.startsWith("81")) digits = digits.slice(2)
    // Only allow up to 10 digits after country code
    digits = digits.slice(0, 10)
    let formatted = "+81-"
    if (digits.length > 0) {
      formatted += digits.slice(0, 2)
    }
    if (digits.length > 2) {
      formatted += "-" + digits.slice(2, 6)
    }
    if (digits.length > 6) {
      formatted += "-" + digits.slice(6, 10)
    }
    return formatted
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Always keep '+81-' at the start
    let formatted = formatPhoneInput(value)
    setFormData((prev) => ({ ...prev, contactPhone: formatted }))
  }

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      router.push("/dashboard/companies")
    }
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
                {isEdit ? (
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    required
                    disabled={loading}
                    readOnly
                    className="bg-gray-100"
                  />
                )}
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
                  placeholder="+81-90-1234-5678"
                  maxLength={16}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Format: +81-90-1234-5678
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address</h3>
            <div>
              <Label htmlFor="address">Company Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
                disabled={loading}
                rows={3}
                placeholder="Enter company address"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Company" : "Add Company"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 