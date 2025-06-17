"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Building2, Mail, Phone, MapPin, Users } from "lucide-react"
import { hasPermission } from "@/lib/permissions"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (!hasPermission(parsedUser.role, "VIEW_COMPANIES")) {
        setError("You don't have permission to view companies")
        setLoading(false)
        return
      }
    }

    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/companies", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load companies")
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm("Are you sure you want to delete this company?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchCompanies() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to delete company")
      }
    } catch (error) {
      console.error("Failed to delete company:", error)
      alert("Network error occurred")
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
          <h1 className="text-3xl font-bold tracking-tight">Company Management</h1>
          <p className="text-muted-foreground">Manage partner companies and employers</p>
        </div>
        <Alert variant="destructive">
          <Building2 className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Management</h1>
          <p className="text-muted-foreground">Manage partner companies and employers</p>
        </div>
        {user && hasPermission(user.role, "CREATE_COMPANY") && (
          <Link href="/dashboard/companies/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {companies.map((company: any) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {company.company_name}
                      <Badge variant="outline">{company.industry || "General"}</Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3" />
                      {company.country}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {user && hasPermission(user.role, "UPDATE_COMPANY") && (
                    <Link href={`/dashboard/companies/${company.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {user && hasPermission(user.role, "DELETE_COMPANY") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCompany(company.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Contact Person</p>
                  <p className="text-muted-foreground">{company.contact_person || "Not specified"}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {company.contact_email || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {company.contact_phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Employees</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {company.employee_count || 0} students
                  </p>
                </div>
              </div>
              {company.address && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">Address</p>
                  <p className="text-sm text-muted-foreground">{company.address}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Companies Found</CardTitle>
            <CardDescription>
              {user && hasPermission(user.role, "CREATE_COMPANY")
                ? "Get started by adding your first partner company."
                : "No companies have been registered yet."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
