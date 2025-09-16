"use client"

import { useEffect, useState } from "react"
import { Suspense } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import AIInsightsDashboard from "@/components/analytics/ai-insights-dashboard"

export default function PreAnalysisPage() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (!hasPermission(parsedUser.role, "VIEW_PREDICTIVE_ANALYTICS")) {
        setError("You don't have permission to view predictive analytics")
        return
      }
    }
  }, [])

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pre Analysis (AI Insights)</h1>
          <p className="text-muted-foreground">AI-powered insights and predictions for strategic planning</p>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pre Analysis (AI Insights)</h1>
        <p className="text-muted-foreground">AI-powered insights and predictions for strategic planning</p>
      </div>
      
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      }>
        <AIInsightsDashboard />
      </Suspense>
    </div>
  )
} 