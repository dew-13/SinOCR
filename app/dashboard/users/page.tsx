"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Shield, Mail, Calendar, User } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import { formatDate } from "@/lib/utils"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (!hasPermission(parsedUser.role, "VIEW_ALL_USERS")) {
        setError("You don't have permission to view users")
        setLoading(false)
        return
      }
    }

    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load users")
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to delete user")
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      alert("Network error occurred")
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "teacher":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        {user && (hasPermission(user.role, "CREATE_ADMIN") || hasPermission(user.role, "CREATE_TEACHER")) && (
          <Link href="/dashboard/users/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {users.map((userData: any) => (
          <Card key={userData.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {userData.full_name}
                      <Badge className={getRoleBadgeColor(userData.role)}>
                        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3" />
                      {userData.email}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {user && hasPermission(user.role, "UPDATE_USER") && (
                    <Link href={`/dashboard/users/${userData.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {user && hasPermission(user.role, "DELETE_USER") && userData.id !== user.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(userData.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">User ID</p>
                  <p className="text-muted-foreground">#{userData.id}</p>
                </div>
                <div>
                  <p className="font-medium">Created By</p>
                  <p className="text-muted-foreground">{userData.created_by_name || "System"}</p>
                </div>
                <div>
                  <p className="font-medium">Created Date</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(userData.created_at)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <Badge variant={userData.is_active ? "default" : "secondary"}>
                    {userData.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Users Found</CardTitle>
            <CardDescription>
              {user && (hasPermission(user.role, "CREATE_ADMIN") || hasPermission(user.role, "CREATE_TEACHER"))
                ? "Get started by adding your first user."
                : "No users have been created yet."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
