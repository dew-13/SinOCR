"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Shield, Mail, Calendar, User, UserCog, UserCheck } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import { formatDate } from "@/lib/utils"
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
import UserForm from "@/components/users/user-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter, useSearchParams } from "next/navigation"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const searchParams = useSearchParams();
  const roleFilter = searchParams.get("role");

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

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchUsers()
        setDeleteDialogOpen(false)
        setUserToDelete(null)
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
          <p className="text-muted-foreground">View all users in the system</p>
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
        {users
          .filter((u: any) => {
            if (roleFilter === "owner") return u.role === "owner";
            if (roleFilter === "admin") return u.role === "admin";
            if (roleFilter === "teacher") return u.role === "teacher";
            if (!user) return false;
            if (user.role === "owner") return u.role === "admin" || u.role === "teacher";
            if (user.role === "admin") return u.role === "teacher";
            return false;
          })
          .map((user: any) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={
                      (user.role === "owner"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600"
                        : user.role === "admin"
                        ? "bg-gradient-to-r from-green-500 to-blue-400"
                        : "bg-gradient-to-r from-yellow-400 to-orange-500") +
                      " flex h-12 w-12 items-center justify-center rounded-full"
                    }>
                      {user.role === "admin" ? (
                        <UserCog className="h-6 w-6 text-white" />
                      ) : user.role === "teacher" ? (
                        <UserCheck className="h-6 w-6 text-white" />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="flex flex-col gap-1">
                        {user.full_name}
                        <span className="block text-sm font-normal text-muted-foreground">
                          {user.role}
                        </span>
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/users/${user.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog open={deleteDialogOpen && userToDelete?.id === user.id} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <b>{userToDelete?.full_name}</b>? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmDeleteUser}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground break-all whitespace-nowrap overflow-auto">{user.email}</span>
                    
                    <span className="text-xs text-gray-400">Since: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {users.filter((u: any) => {
        if (roleFilter === "owner") return u.role === "owner";
        if (roleFilter === "admin") return u.role === "admin";
        if (roleFilter === "teacher") return u.role === "teacher";
        if (!user) return false;
        if (user.role === "owner") return u.role === "admin" || u.role === "teacher";
        if (user.role === "admin") return u.role === "teacher";
        return false;
      }).length === 0 && (
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
