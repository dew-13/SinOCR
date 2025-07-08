"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Zap, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  MapPin,
  Clock,
  Star,
  TrendingDown,
  Lightbulb,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import PreAnalysisDashboard from "@/components/analytics/pre-analysis-dashboard"

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
          <h1 className="text-3xl font-bold tracking-tight">Pre Analysis (Predictive)</h1>
          <p className="text-muted-foreground">Future trends and predictions</p>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          
        </h1>
        <p className="text-muted-foreground mt-2">
         
        </p>
      </div>

      {/* Main Dashboard Component */}
      <PreAnalysisDashboard />
    </div>
  )
} 