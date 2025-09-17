"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [credentialsLoaded, setCredentialsLoaded] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem("savedCredentials")
    if (savedCredentials) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials)
        if (savedEmail && savedPassword) {
          setEmail(savedEmail)
          setPassword(savedPassword)
          setRememberMe(true)
          setCredentialsLoaded(true)
          console.log("Loaded saved credentials")
        } else {
          console.log("Saved credentials are incomplete, clearing them")
          localStorage.removeItem("savedCredentials")
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error)
        // Clear corrupted data
        localStorage.removeItem("savedCredentials")
      }
    } else {
      console.log("No saved credentials found")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem("savedCredentials", JSON.stringify({ email, password }))
          console.log("Credentials saved for remember me")
        } else {
          // Clear saved credentials if remember me is unchecked
          localStorage.removeItem("savedCredentials")
          console.log("Credentials cleared - remember me unchecked")
        }

        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        
        // If must change password, force redirect to change password page
        if (data.user.mustChangePassword) {
          router.push("/change-password")
          return
        }

        // Redirect based on user role
        if (data.user.role === "admin" || data.user.role === "teacher") {
          router.push("/dashboard/students")
        } else {
          router.push("/dashboard")
        }
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRememberMeChange = (checked: boolean | string) => {
    const isChecked = checked === true || checked === "checked"
    setRememberMe(isChecked)
    console.log("Remember me changed to:", isChecked)
    
    // If user unchecks remember me, clear saved credentials
    if (!isChecked) {
      localStorage.removeItem("savedCredentials")
      setCredentialsLoaded(false)
      console.log("Cleared saved credentials - remember me unchecked")
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    // If user manually changes email, clear the loaded indicator
    if (credentialsLoaded) {
      setCredentialsLoaded(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    // If user manually changes password, clear the loaded indicator
    if (credentialsLoaded) {
      setCredentialsLoaded(false)
    }
  }

  const clearSavedCredentials = () => {
    localStorage.removeItem("savedCredentials")
    setEmail("")
    setPassword("")
    setRememberMe(false)
    setCredentialsLoaded(false)
    console.log("Cleared all saved credentials")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Student Management System
            </CardTitle>
            <CardDescription className="text-base mt-2">Sign in to access your dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
                disabled={loading}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>
            
            {credentialsLoaded && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md">
                ✓ Credentials loaded from previous session
                <button
                  type="button"
                  onClick={clearSavedCredentials}
                  className="ml-2 text-red-600 hover:text-red-800 underline"
                >
                  Clear
                </button>
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-orange-600">Developer:</span>
                <span className="text-gray-600">developer@system.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-purple-600">Owner:</span>
                <span className="text-gray-600">owner@system.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-blue-600">Admin:</span>
                <span className="text-gray-600">admin@system.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-green-600">Teacher:</span>
                <span className="text-gray-600">teacher@system.com / admin123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
