"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import UserForm from "@/components/users/user-form"

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!userId) return
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data)
        } else {
          setError("Failed to load user data.")
        }
      } catch (err) {
        setError("Network error occurred.")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [userId])

  if (loading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div className="text-red-600">{error}</div>
  }
  if (!user) {
    return <div>User not found.</div>
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <UserForm user={user} isEdit onSuccess={() => router.push("/dashboard/users")} />
    </div>
  )
} 