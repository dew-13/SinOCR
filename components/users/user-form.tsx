"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle } from "lucide-react"
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
  const [success, setSuccess] = useState("")
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [showEmailButton, setShowEmailButton] = useState(false)
  const router = useRouter()

  // Set allowedRoles based on logged-in user
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      if (userData) {
        const loggedInUser = JSON.parse(userData);
        if (loggedInUser.role === "developer") setAllowedRoles(["developer", "owner", "admin", "teacher"]);
        else if (loggedInUser.role === "owner") setAllowedRoles(["admin", "teacher"]);
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

  // Generate temporary password based on user input
  const generateTemporaryPassword = (fullName: string, email: string, role: string) => {
    const timestamp = Date.now().toString().slice(-4);
    const nameInitials = fullName.split(' ').map(name => name.charAt(0)).join('').toLowerCase();
    const emailPrefix = email.split('@')[0].slice(0, 3);
    const rolePrefix = role.slice(0, 2).toLowerCase();
    
    // Create a unique password combining all elements
    const password = `${nameInitials}${emailPrefix}${rolePrefix}${timestamp}`;
    
    // Ensure it's at least 8 characters and add some complexity
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*'];
    const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];
    
    return `${password}${randomSpecial}`;
  };

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
    if (isEdit && !formData.password.trim()) {
      setError("Password is required for editing")
      return false
    }
    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const url = isEdit ? `/api/users/${user.id}` : "/api/users"
      const method = isEdit ? "PUT" : "POST"
      
      let payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
      }

      if (isEdit) {
        // For editing, use the password from the form if provided
        if (formData.password.trim()) {
          payload.passwordHash = formData.password
        }
      } else {
        // For new users, generate a temporary password
        const tempPassword = generateTemporaryPassword(formData.fullName, formData.email, formData.role);
        setGeneratedPassword(tempPassword);
        payload.password = tempPassword
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
        if (isEdit) {
          setSuccess("User updated successfully!")
          if (onSuccess) {
            onSuccess()
          }
        } else {
          setSuccess("User created successfully! Click 'Send Email' to send credentials.")
          setShowEmailButton(true)
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

  // Send email with credentials
  const sendCredentialsEmail = () => {
    const subject = "Your Student Management System Account Credentials";
    const body = `Dear ${formData.fullName},

Welcome to the Student Management System!

Your account has been created successfully. Here are your login credentials:

Full Name: ${formData.fullName}
Email: ${formData.email}
Role: ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
Temporary Password: ${generatedPassword}

Please log in to the system and change your password immediately for security purposes.

Login URL: ${window.location.origin}/login

Best regards,
Student Management System Team`;

    // Create mailto link
    const mailtoLink = `mailto:${formData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open default email client
    window.open(mailtoLink);
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit User" : "Add New User"}</CardTitle>
        <CardDescription>
          {isEdit ? "Update user information" : "Enter user details. A temporary password will be generated automatically."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
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

          {/* Password - Only show for editing */}
          {isEdit && (
            <div>
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={loading}
                placeholder="Leave blank to keep current password"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update User" : "Add User"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/users")}>
              Cancel
            </Button>
          </div>

          {/* Send Email Button - Only show after successful user creation */}
          {showEmailButton && generatedPassword && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Send Credentials Email</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Click the button below to open your email client and send the login credentials to {formData.email}
              </p>
              <Button 
                type="button" 
                onClick={sendCredentialsEmail}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 