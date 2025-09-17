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

      let tempPassword = "";
      if (isEdit) {
        // For editing, use the password from the form if provided
        if (formData.password.trim()) {
          payload.passwordHash = formData.password
        }
      } else {
        // For new users, generate a temporary password
        tempPassword = generateTemporaryPassword(formData.fullName, formData.email, formData.role);
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
      
      // Send credentials email using EmailJS
      const sendEmail = async (toEmail: string, fullName: string, role: string, password: string) => {
        try {
          const serviceId = "service_n04gp98";
          const templateId = "template_9csyyec";
          const userId = "quhY8crx_fqGtgUun";
          const templateParams = {
            to_email: toEmail,
            full_name: fullName,
            role: role.charAt(0).toUpperCase() + role.slice(1),
            password,
            login_url: `${window.location.origin}/login`,
          };
          const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              service_id: serviceId,
              template_id: templateId,
              user_id: userId,
              template_params: templateParams,
            }),
          });
          if (!response.ok) throw new Error("Failed to send email");
          return true;
        } catch (err) {
          return false;
        }
      };

      if (response.ok) {
        if (isEdit) {
          setSuccess("User updated successfully!")
          if (onSuccess) {
            onSuccess()
          }
          // Send email with the new password if provided
          const emailSent = await sendEmail(formData.email, formData.fullName, formData.role, formData.password)
        } else {
          setSuccess("User created successfully! Sending credentials email...")
          setShowEmailButton(false)
          // Send email automatically with tempPassword
          const emailSent = await sendEmail(formData.email, formData.fullName, formData.role, tempPassword)
          if (emailSent) {
            setSuccess("User created and credentials email sent successfully!")
          } else {
            setError("User created, but failed to send credentials email.")
          }
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
        </form>
      </CardContent>
    </Card>
  )
}