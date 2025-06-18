"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import sha256 from "crypto-js/sha256"
import { useRouter } from "next/navigation"
import React from "react"

interface UserFormProps {
  user?: any
  isEdit?: boolean
  onSuccess?: () => void
}

export default function UserForm({ user, isEdit = false, onSuccess }: UserFormProps) {
  const [allowedRoles, setAllowedRoles] = useState<string[]>([])
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    role: user?.role || "teacher",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Set allowedRoles based on logged-in user
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      if (userData) {
        const loggedInUser = JSON.parse(userData);
        if (loggedInUser.role === "owner") setAllowedRoles(["admin", "teacher"]);
        else if (loggedInUser.role === "admin") setAllowedRoles(["teacher"]);
        else setAllowedRoles([]);
      }
    }
  }, []);

  // Set default role if not editing and allowedRoles changes
  useEffect(() => {
    if (!isEdit && allowedRoles.length > 0) {
      setFormData((prev) => ({ ...prev, role: allowedRoles[0] }));
    }
  }, [allowedRoles, isEdit]);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate form fields
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (!formData.role) {
      setError("Role is required")
      return false
    }
    if (!isEdit && !formData.password.trim()) {
      setError("Password is required")
      return false
    }
    return true
  }

  // Handle form submission
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
      const url = isEdit ? `/api/users/${user.id}` : "/api/users"
      const method = isEdit ? "PUT" : "POST"
      // Hash the password if provided
      let payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
      }
      if (formData.password.trim()) {
        payload.passwordHash = sha256(formData.password).toString()
      }
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
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(data.error || "Failed to save user")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit User" : "Add New User"}</CardTitle>
        <CardDescription>{isEdit ? "Update user information" : "Enter comprehensive user details"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              required
              disabled={loading}
              placeholder="Enter full name"
            />
          </div>
          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              disabled={loading}
              placeholder="user@email.com"
            />
          </div>
          {/* Role */}
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Password */}
          <div>
            <Label htmlFor="password">{isEdit ? "New Password (optional)" : "Password *"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required={!isEdit}
              disabled={loading}
              placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
            />
          </div>
          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update User" : "Add User"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/users")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 