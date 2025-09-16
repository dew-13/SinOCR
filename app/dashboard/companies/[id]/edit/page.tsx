"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import CompanyForm from "@/components/companies/company-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditCompanyPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params?.id
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!companyId) return
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/companies/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          setCompany(data)
        } else {
          setError("Failed to load company data.")
        }
      } catch (err) {
        setError("Network error occurred.")
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [companyId])

  if (loading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div className="text-red-600">{error}</div>
  }
  if (!company) {
    return <div>Company not found.</div>
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Company</CardTitle>
      </CardHeader>
      <CardContent>
        <CompanyForm company={company} isEdit onSuccess={() => router.push("/dashboard/companies")} />
      </CardContent>
    </Card>
  )
} 