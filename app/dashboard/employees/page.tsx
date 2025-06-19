"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Eye, Building2, Calendar, MapPin, Phone, User, FileText, Languages } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import { formatDate } from "@/lib/utils"

export default function EmployeesPage() {
  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (!hasPermission(parsedUser.role, "VIEW_EMPLOYEES")) {
        setError("You don't have permission to view employees")
        setLoading(false)
        return
      }
    }

    fetchPlacements()
  }, [])

  const fetchPlacements = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/placements", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPlacements(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load placements")
      }
    } catch (error) {
      console.error("Failed to fetch placements:", error)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employment Management</h1>
          <p className="text-muted-foreground">Track student employment and placements</p>
        </div>
        <Alert variant="destructive">
          <User className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employment Management</h1>
          <p className="text-muted-foreground">Track student employment and placements</p>
        </div>
        {user && hasPermission(user.role, "CREATE_EMPLOYEE") && (
          <Link href="/dashboard/employees/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Selected Employee
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {placements.map((placement: any) => (
          <Card key={placement.placement_id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {placement.student_name}
                      <Badge variant="default">Employed</Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Building2 className="h-3 w-3" />
                      {placement.company_name} • {placement.industry}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">National ID</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    {placement.national_id || "-"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Passport Number</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    {placement.passport_id ? placement.passport_id : "-"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Visa Type</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {placement.visa_type}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {placement.mobile_phone || "Not provided"}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    <span className="font-medium">Emergency:</span> {placement.emergency_contact || "-"}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">Employment Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(placement.start_date)} — {formatDate(placement.end_date)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">Language Proficiency</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Languages className="h-3 w-3" />
                    {placement.language_proficiency || "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {placements.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Placements Found</CardTitle>
            <CardDescription>
              {user && hasPermission(user.role, "CREATE_EMPLOYEE")
                ? "Get started by adding your first employment record."
                : "No employment records have been created yet."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
