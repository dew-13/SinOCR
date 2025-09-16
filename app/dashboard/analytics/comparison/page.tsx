"use client"

import { useEffect, useState } from "react"
import AnalyticsComparison from "@/components/analytics/analytics-comparison"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function ComparisonPage() {
  const [preAnalysisData, setPreAnalysisData] = useState<any>(null)
  const [postAnalysisData, setPostAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBothAnalysisData()
  }, [])

  const fetchBothAnalysisData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("No authentication token found")
        setLoading(false)
        return
      }

      // Fetch both pre-analysis and post-analysis data in parallel
      const [preResponse, postResponse] = await Promise.all([
        fetch("/api/analytics/pre-analysis", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/analytics/post-analysis", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ])

      if (!preResponse.ok) {
        const errorData = await preResponse.json()
        throw new Error(`Pre-analysis error: ${errorData.error || "Failed to load data"}`)
      }

      if (!postResponse.ok) {
        const errorData = await postResponse.json()
        throw new Error(`Post-analysis error: ${errorData.error || "Failed to load data"}`)
      }

      const preData = await preResponse.json()
      const postData = await postResponse.json()

      setPreAnalysisData(preData)
      setPostAnalysisData(postData)
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
      setError(error instanceof Error ? error.message : "Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Comparison</h1>
          <p className="text-muted-foreground">Compare predictive vs historical analytics</p>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Comparison</h1>
          <p className="text-muted-foreground">Compare predictive vs historical analytics</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!preAnalysisData || !postAnalysisData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Comparison</h1>
          <p className="text-muted-foreground">Compare predictive vs historical analytics</p>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load comparison data. Both pre-analysis and post-analysis data are required.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Comparison</h1>
        <p className="text-muted-foreground">
          Compare AI predictions with actual performance data to validate accuracy and insights
        </p>
      </div>

      <AnalyticsComparison 
        preAnalysisData={preAnalysisData} 
        postAnalysisData={postAnalysisData} 
      />
    </div>
  )
}
