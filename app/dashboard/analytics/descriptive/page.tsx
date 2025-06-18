"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, Users, MapPin, Building2 } from "lucide-react"
import dynamic from "next/dynamic"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]
const SriLankaDistrictMap = dynamic(() => import("@/components/analytics/SriLankaDistrictMap"), { ssr: false })

export default function DescriptiveAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/analytics/descriptive", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Post Analysis (Descriptive)</h1>
          <p className="text-muted-foreground">Historical data analysis and insights</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>Unable to load analytics data. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const employmentRate =
    analyticsData.totalStudents > 0
      ? (
          (analyticsData.employedStudents / (analyticsData.totalStudents + analyticsData.employedStudents)) *
          100
        ).toFixed(1)
      : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Post Analysis (Descriptive)
        </h1>
        <p className="text-muted-foreground mt-2">Historical data analysis showing past performance and trends</p>
      </div>

      {/* Sri Lanka District Map */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Students by District</CardTitle>
          <CardDescription>Choropleth map of Sri Lanka districts colored by number of registered students</CardDescription>
        </CardHeader>
        <CardContent>
          <SriLankaDistrictMap districtStats={analyticsData.districtStats || []} />
        </CardContent>
      </Card>
    </div>
  )
}
