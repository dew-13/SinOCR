"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import StudentForm from "@/components/students/student-form"

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStudent()
  }, [studentId])

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("No authentication token found")
        setLoading(false)
        return
      }

      const response = await fetch(`/api/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch student details")
      }

      const data = await response.json()
      setStudent(data)
    } catch (error) {
      console.error("Failed to fetch student:", error)
      setError("Failed to load student details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error || "Student not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Student Details
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
          <p className="text-sm text-gray-600">Update student information</p>
        </div>
      </div>
      
      <StudentForm student={student} isEdit={true} />
    </div>
  )
}