"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
} from "recharts"
import { TrendingUp, Brain, Target, Zap, AlertTriangle } from "lucide-react"
import { hasPermission } from "@/lib/permissions"

export default function PredictiveAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (!hasPermission(parsedUser.role, "VIEW_PREDICTIVE_ANALYTICS")) {
        setError("You don't have permission to view predictive analytics")
        setLoading(false)
        return
      }
    }

    fetchPredictiveAnalytics()
  }, [])

  const fetchPredictiveAnalytics = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/analytics/predictive", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load predictive analytics")
      }
    } catch (error) {
      console.error("Failed to fetch predictive analytics:", error)
      setError("Network error occurred")
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

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pre Analysis (Predictive)</h1>
          <p className="text-muted-foreground">Future trends and predictions</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>Unable to load predictive analytics data. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Pre Analysis (Predictive)
        </h1>
        <p className="text-muted-foreground mt-2">Future trends, predictions, and strategic insights for planning</p>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Year Prediction</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.predictions?.nextYearStudents || 0}</div>
            <p className="text-xs text-muted-foreground">Expected new students</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.predictions?.avgGrowthRate > 0 ? "+" : ""}
              {analyticsData.predictions?.avgGrowthRate || 0}
            </div>
            <p className="text-xs text-muted-foreground">Students per year</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Growth Districts</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.predictions?.topGrowthDistricts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">High potential areas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seasonal Peak</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.seasonalData?.reduce(
                (max: any, month: any) => (month.registrations > (max?.registrations || 0) ? month : max),
                null,
              )?.month || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Best registration month</p>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Trend Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>Yearly Registration Trend & Prediction</CardTitle>
          <CardDescription>Historical data with future projections</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.yearlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="registrations" stroke="#8884d8" strokeWidth={2} name="Registrations" />
              <Line type="monotone" dataKey="employed" stroke="#00C49F" strokeWidth={2} name="Employed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seasonal Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Registration Pattern</CardTitle>
            <CardDescription>Monthly registration patterns for planning</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.seasonalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                    return months[value - 1] || value
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => {
                    const months = [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ]
                    return months[value - 1] || value
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Registrations"
                />
                <Area
                  type="monotone"
                  dataKey="avg_registrations"
                  stroke="#ff7300"
                  fill="none"
                  strokeDasharray="5 5"
                  name="Average"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employment Success by Province */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Success Rate by Province</CardTitle>
            <CardDescription>Success rates for strategic planning</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.employmentSuccess} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="province" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value}%`, "Success Rate"]} />
                <Bar dataKey="success_rate" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Growth Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Growth */}
        <Card>
          <CardHeader>
            <CardTitle>High Growth Districts</CardTitle>
            <CardDescription>Districts with highest growth potential</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.predictions?.topGrowthDistricts?.slice(0, 5).map((district: any, index: number) => (
                <div
                  key={district.district}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{district.district}</p>
                      <p className="text-sm text-gray-600">{district.current_count} current students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {district.growth_rate > 0 ? "+" : ""}
                      {district.growth_rate}%
                    </p>
                    <p className="text-sm text-gray-600">growth rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Province Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Provincial Growth Trends</CardTitle>
            <CardDescription>Province-wise growth analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.predictions?.topGrowthProvinces?.slice(0, 5).map((province: any, index: number) => (
                <div
                  key={province.province}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{province.province}</p>
                      <p className="text-sm text-gray-600">{province.current_count} current students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {province.growth_rate > 0 ? "+" : ""}
                      {province.growth_rate}%
                    </p>
                    <p className="text-sm text-gray-600">growth rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Insights & Recommendations</CardTitle>
          <CardDescription>AI-powered insights for decision making</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Growth Opportunities</h4>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                  <p className="font-medium text-green-800">High Potential Districts</p>
                  <p className="text-sm text-green-700">
                    Focus marketing efforts on {analyticsData.predictions?.topGrowthDistricts?.[0]?.district} and{" "}
                    {analyticsData.predictions?.topGrowthDistricts?.[1]?.district}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="font-medium text-blue-800">Seasonal Planning</p>
                  <p className="text-sm text-blue-700">
                    Peak registration months show consistent patterns - prepare resources accordingly
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Risk Factors</h4>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="font-medium text-yellow-800">Employment Rate Variance</p>
                  <p className="text-sm text-yellow-700">
                    Some provinces show lower success rates - consider targeted support programs
                  </p>
                </div>
                <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                  <p className="font-medium text-red-800">Capacity Planning</p>
                  <p className="text-sm text-red-700">
                    Predicted growth may require additional resources and infrastructure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
