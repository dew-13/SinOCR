"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit } from "lucide-react"
import { hasPermission } from "@/lib/permissions"

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage student information and records</p>
        </div>
        {user && hasPermission(user.role, "CREATE_STUDENT") && (
          <Link href="/dashboard/students/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {students.map((student: any) => (
          <Card key={student.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{student.full_name}</CardTitle>
                  <CardDescription>
                    {student.district}, {student.province} • {student.mobile_phone}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={student.status === "employed" ? "default" : "secondary"}>{student.status}</Badge>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/students/${student.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {user && hasPermission(user.role, "UPDATE_STUDENT") && (
                      <Link href={`/dashboard/students/${student.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Education</p>
                  <p className="text-muted-foreground">{student.education_qualification}</p>
                </div>
                <div>
                  <p className="font-medium">Age</p>
                  <p className="text-muted-foreground">
                    {new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()} years
                  </p>
                </div>
                <div>
                  <p className="font-medium">Marital Status</p>
                  <p className="text-muted-foreground capitalize">{student.marital_status}</p>
                </div>
                <div>
                  <p className="font-medium">Driving License</p>
                  <p className="text-muted-foreground">
                    {student.has_driving_license ? `Yes (${student.vehicle_type})` : "No"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {students.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Students Found</CardTitle>
            <CardDescription>
              {user && hasPermission(user.role, "CREATE_STUDENT")
                ? "Get started by adding your first student."
                : "No students have been registered yet."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
