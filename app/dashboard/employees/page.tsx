"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Eye, Building2, DollarSign, Calendar, MapPin, Phone, User } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import { formatDate, formatCurrency } from "@/lib/utils"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
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

    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load employees")
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error)
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
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground">Track student employment and placements</p>
        </div>
        {user && hasPermission(user.role, "CREATE_EMPLOYEE") && (
          <Link href="/dashboard/employees/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Employment
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {employees.map((employee: any) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {employee.student_name}
                      <Badge variant="default">Employed</Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Building2 className="h-3 w-3" />
                      {employee.company_name} • {employee.position}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/employees/${employee.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Salary</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {employee.salary ? formatCurrency(employee.salary) : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Employment Date</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(employee.employment_date)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Country</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {employee.country}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {employee.mobile_phone || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">Industry</p>
                  <p className="text-sm text-muted-foreground">{employee.industry || "Not specified"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">Contract Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.contract_duration_months
                      ? `${employee.contract_duration_months} months`
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Employees Found</CardTitle>
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
