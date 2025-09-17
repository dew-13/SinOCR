"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Building2, Mail, Phone } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<any>(null)

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

  const handleDeleteClick = (company: any) => {
    setCompanyToDelete(company)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCompany = async () => {
    if (!companyToDelete) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/companies/${companyToDelete.id}` , {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        fetchCompanies()
        setDeleteDialogOpen(false)
        setCompanyToDelete(null)
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
          <p className="text-muted-foreground">Manage partner companies in Japan</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Management</h1>
          <p className="text-muted-foreground">Manage partner companies in Japan</p>
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
          <Link key={company.id} href={`/dashboard/companies/${company.id}`} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="flex flex-col gap-1">
                        {company.company_name}
                        <span className="block text-sm font-normal text-muted-foreground">
                          {company.industry || "General"}
                        </span>
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user && hasPermission(user.role, "UPDATE_COMPANY") && (
                      <Link href={`/dashboard/companies/${company.id}/edit`} onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {user && hasPermission(user.role, "DELETE_COMPANY") && (
                      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={e => { e.stopPropagation(); handleDeleteClick(company); }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Company</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <b>{companyToDelete?.company_name}</b>? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteCompany}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{company.contact_person  || "Not specified"}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {company.contact_phone || "Not provided"}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {company.contact_email || "Not provided"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
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
