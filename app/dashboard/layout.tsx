"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/dashboard/sidebar"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Redirect admin and teacher users to registered students page
      if ((parsedUser.role === "admin" || parsedUser.role === "teacher") && window.location.pathname === "/dashboard") {
        router.push("/dashboard/students")
        return
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
      return
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-screen w-64 z-30 overflow-y-auto">
        <Sidebar userRole={user.role} userName={user.fullName} />
      </div>
      <main className="ml-64 h-screen overflow-y-auto">
        <div className="p-6 md:p-8 pt-16 md:pt-8">{children}</div>
      </main>
    </div>
  )
}
