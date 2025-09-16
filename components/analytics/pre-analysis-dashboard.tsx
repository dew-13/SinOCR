"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import AIInsights from "./ai-insights"
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
  MapPin,
  Clock,
  Star,
  TrendingDown,
  Lightbulb,
  BarChart3,
  PieChart as PieChartIcon,
  Building2,
  GraduationCap,
  Globe,
  Calendar
} from "lucide-react"

interface PreAnalysisData {
  employmentProbability: Array<{
    education_qualification: string
    district: string
    sex: string
    marital_status: string
    has_driving_license: boolean
    total_students: number
    employed_students: number
    employment_rate: number
  }>
  employmentProgress: Array<{
    month: string
    employments: number
    companies_hired: number
    students_employed: number
  }>
  marketTrends: Array<{
    industry: string
    country: string
    total_employments: number
    unique_students: number
    companies_involved: number
    first_employment: string
    latest_employment: string
  }>
  skillDemand: Array<{
    education_qualification: string
    other_qualifications: string
    total_students: number
    employed_count: number
    demand_rate: number
  }>
  seasonalPatterns: Array<{
    month: number
    year: number
    registrations: number
    employments: number
  }>
  districtPotential: Array<{
    district: string
    province: string
    total_students: number
    employed_students: number
    employment_rate: number
    avg_age: number
  }>
  ageAnalysis: Array<{
    age_group: string
    total_students: number
    employed_students: number
    employment_rate: number
  }>
  qualificationImpact: Array<{
    education_qualification: string
    total_students: number
    employed_students: number
    employment_rate: number
  }>
  experienceCorrelation: Array<{
    experience_level: string
    total_students: number
    employed_students: number
    employment_rate: number
  }>
  futureProjections: Array<{
    month: string
    registrations: number
    prev_month: number
    growth_rate: number
  }>
  riskAssessment: Array<{
    district: string
    total_students: number
    employed_students: number
    employment_rate: number
    risk_level: string
  }>
  marketingInsights: Array<{
    insight_type: string
    target_area: string
    student_count: number
    success_rate: number
    reasoning: string
  }>
  companyPerformance: Array<{
    company_name: string
    industry: string
    country: string
    total_employments: number
    unique_students: number
    first_hire_date: string
    latest_hire_date: string
    market_share: number
  }>
  geographicDistribution: Array<{
    district: string
    province: string
    total_students: number
    employed_students: number
    employment_rate: number
    active_students: number
  }>
  predictions: {
    nextYearStudents: number
    avgGrowthRate: number
    topGrowthDistricts: string[]
    seasonalPeak: string
  }
  marketingRecommendations: Array<{
    category: string
    recommendation: string
    priority: string
    reasoning: string
  }>
  overallEmploymentRate: number
  insights: {
    totalStudents: number
    totalEmployed: number
    topIndustries: Record<string, number>
    riskAreas: number
    topPerformingDistricts: string[]
    topPerformingQualifications: string[]
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function PreAnalysisDashboard() {
  const [data, setData] = useState<PreAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [prompt, setPrompt] = useState("")
  const [prediction, setPrediction] = useState<string>("")
  const [predicting, setPredicting] = useState(false)

  useEffect(() => {
    fetchPreAnalysisData()
  }, [])

  const fetchPreAnalysisData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/analytics/pre-analysis", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else {
        const errorData = await response.json()
        const errorMessage = typeof errorData?.error === 'string' ? errorData.error : "Failed to load pre-analysis data"
        setError(errorMessage)
      }
    } catch (error) {
      console.error("Failed to fetch pre-analysis data:", error)
      setError(error instanceof Error ? error.message : "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }


          const handleGeminiPredict = async () => {
            setPredicting(true)
            setPrediction("")
            try {
              const res = await fetch("/api/analytics/pre-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
              })
              const result = await res.json()
              setPrediction(result.prediction || "No prediction returned.")
            } catch (err) {
              setPrediction("Error fetching prediction.")
            } finally {
              setPredicting(false)
            }
          }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{String(error)}</AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>Unable to load pre-analysis data. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium Risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low Risk': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Pre Analysis Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered predictive insights and employment probability analysis
        </p>
      </div>

      {/* Key Predictions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Year Prediction</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.predictions?.nextYearStudents ?? "N/A"}</div>
            <p className="text-xs text-muted-foreground">Expected new students</p>
            <Progress value={data?.predictions?.nextYearStudents ? 75 : 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{data?.predictions?.avgGrowthRate ?? "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Students per year</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employment Probability</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overallEmploymentRate ?? "N/A"}%</div>
            <p className="text-xs text-muted-foreground">Current success rate</p>
            <Progress value={data?.overallEmploymentRate ?? 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Areas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.insights?.riskAreas ?? "N/A"}</div>
            <p className="text-xs text-muted-foreground">High-risk districts</p>
            <div className="flex items-center mt-2">
              <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
              <span className="text-xs text-orange-500">Needs attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employment Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Employment Progress Tracking
          </CardTitle>
          <CardDescription>Monthly employment trends and progress analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.employmentProgress ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              />
              <Area type="monotone" dataKey="employments" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Employments" />
              <Line type="monotone" dataKey="companies_hired" stroke="#00C49F" strokeWidth={2} name="Companies" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Future Market Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Market Expansion Opportunities
            </CardTitle>
            <CardDescription>Industries and countries with growth potential</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.marketTrends?.slice(0, 8) ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_employments" fill="#0088FE" name="Total Employments" />
                <Bar dataKey="companies_involved" fill="#00C49F" name="Companies" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seasonal Registration Patterns
            </CardTitle>
            <CardDescription>Optimal timing for enrollment campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.seasonalPatterns?.slice(0, 12) ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="registrations" stroke="#FF8042" strokeWidth={2} name="Registrations" />
                <Line type="monotone" dataKey="employments" stroke="#8884D8" strokeWidth={2} name="Employments" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* District Potential & Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              District Growth Potential
            </CardTitle>
            <CardDescription>Areas with highest expansion opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.districtPotential?.slice(0, 5).map((district, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-semibold">{district.district}</p>
                    <p className="text-sm text-muted-foreground">{district.province}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{district.employment_rate}%</p>
                  <p className="text-xs text-muted-foreground">{district.total_students} students</p>
                </div>
              </div>
            )) ?? <p>No district data available</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment Dashboard
            </CardTitle>
            <CardDescription>Districts requiring intervention strategies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.riskAssessment?.slice(0, 5).map((risk, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${getRiskColor(risk.risk_level)}`}>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`h-4 w-4 ${
                    risk.risk_level === 'High Risk' ? 'text-red-600' : 
                    risk.risk_level === 'Medium Risk' ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                  <div>
                    <p className="font-semibold">{risk.district}</p>
                    <Badge variant="outline" className={getRiskColor(risk.risk_level)}>
                      {risk.risk_level}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{risk.employment_rate}%</p>
                  <p className="text-xs text-muted-foreground">{risk.total_students} students</p>
                </div>
              </div>
            )) ?? <p>No risk data available</p>}
          </CardContent>
        </Card>
      </div>

      {/* Future Projections & Growth Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Growth Projections & Forecasting
          </CardTitle>
          <CardDescription>Monthly registration trends and growth rate analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.futureProjections ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              />
              <Line yAxisId="left" type="monotone" dataKey="registrations" stroke="#8884d8" strokeWidth={2} name="Registrations" />
              <Line yAxisId="right" type="monotone" dataKey="growth_rate" stroke="#00C49F" strokeWidth={2} name="Growth Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.ageAnalysis ?? []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ age_group, employment_rate }) => `${age_group}: ${employment_rate}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="employment_rate"
                >
                  {(data?.ageAnalysis ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
      {/* Market Insights & Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Powered Strategic Recommendations
          </CardTitle>
          <CardDescription>Data-driven insights for business expansion and improvement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.marketingRecommendations ?? []).map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{rec.category}</span>
                  <Badge variant={rec.priority === 'High' ? 'default' : 'secondary'} className="ml-auto">
                    {rec.priority}
                  </Badge>
                </div>
                <p className="font-medium text-sm mb-2">{rec.recommendation}</p>
                <p className="text-xs text-gray-600">{rec.reasoning}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AIInsights data={data} />

      {/* Gemini AI Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Gemini AI Predictive Analysis
          </CardTitle>
          <CardDescription>Ask AI for specific predictions about your student placement system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Analysis Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Predict employment trends for next quarter based on current data..."
                className="w-full mt-1 p-3 border rounded-md min-h-[100px] resize-none"
              />
              <button
                onClick={handleGeminiPredict}
                disabled={predicting || !prompt.trim()}
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {predicting ? "Analyzing..." : "Generate AI Prediction"}
              </button>
            </div>
            
            <div>
              <label className="text-sm font-medium">AI Prediction Results</label>
              <div className="mt-1 p-3 border rounded-md min-h-[100px] bg-gray-50">
                {predicting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-purple-600 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-gray-600">AI is analyzing your data...</span>
                  </div>
                ) : prediction ? (
                  <p className="text-sm whitespace-pre-wrap">{prediction}</p>
                ) : (
                  <p className="text-sm text-gray-500">Enter a prompt and click "Generate AI Prediction" to get insights</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 