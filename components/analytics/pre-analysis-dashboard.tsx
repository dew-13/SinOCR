"use client"

import { useState, useEffect } from "react"
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
  MapPin,
  Clock,
  Star,
  TrendingDown,
  Lightbulb,
  BarChart3,
  PieChart as PieChartIcon,
  Building2,
  GraduationCap
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
        setError(errorData.error || "Failed to load pre-analysis data")
      }
    } catch (error) {
      console.error("Failed to fetch pre-analysis data:", error)
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
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
            <div className="text-2xl font-bold">{data.predictions.nextYearStudents}</div>
            <p className="text-xs text-muted-foreground">Expected new students</p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{data.predictions.avgGrowthRate}
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
            <div className="text-2xl font-bold">{data.overallEmploymentRate}%</div>
            <p className="text-xs text-muted-foreground">Current success rate</p>
            <Progress value={data.overallEmploymentRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Areas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.insights.riskAreas}</div>
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
            <AreaChart data={data.employmentProgress}>
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

      {/* Employment Probability Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Employment Probability by Qualification
            </CardTitle>
            <CardDescription>Success rates based on educational background</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.qualificationImpact.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="education_qualification" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employment_rate" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Age Group Analysis
            </CardTitle>
            <CardDescription>Employment success by age demographics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.ageAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ age_group, employment_rate }) => `${age_group}: ${employment_rate}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="employment_rate"
                >
                  {data.ageAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends & Company Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Market Trends by Industry
            </CardTitle>
            <CardDescription>Employment distribution across industries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.marketTrends.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_employments" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Performing Companies
            </CardTitle>
            <CardDescription>Companies with highest employment rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.companyPerformance.slice(0, 6).map((company, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{company.company_name}</p>
                    <p className="text-sm text-gray-600">{company.industry} • {company.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{company.total_employments} hires</p>
                    <p className="text-xs text-green-600">{company.market_share}% market share</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* District Potential & Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              District Potential Analysis
            </CardTitle>
            <CardDescription>High-potential districts for expansion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.districtPotential.slice(0, 8).map((district, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{district.district}</p>
                    <p className="text-sm text-gray-600">{district.province}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{district.employment_rate}%</p>
                    <Progress value={district.employment_rate} className="w-20 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
            <CardDescription>Areas requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.riskAssessment.slice(0, 6).map((risk, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{risk.district}</p>
                    <p className="text-sm text-gray-600">{risk.employment_rate}% success rate</p>
                  </div>
                  <Badge className={getRiskColor(risk.risk_level)}>
                    {risk.risk_level}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Marketing Insights & Recommendations
          </CardTitle>
          <CardDescription>AI-powered strategic recommendations for improvement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.marketingRecommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{rec.category}</span>
                </div>
                <p className="font-medium text-sm mb-2">{rec.recommendation}</p>
                <p className="text-xs text-gray-600">{rec.reasoning}</p>
                <div className="mt-2">
                  <Badge variant={rec.priority === 'High' ? 'default' : 'secondary'}>
                    Priority: {rec.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Growth Projections & Seasonal Patterns
          </CardTitle>
          <CardDescription>Predicted trends and seasonal patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.futureProjections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                />
                <Line type="monotone" dataKey="registrations" stroke="#8884d8" strokeWidth={2} name="Registrations" />
                <Line type="monotone" dataKey="growth_rate" stroke="#00C49F" strokeWidth={2} name="Growth Rate %" />
              </LineChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Seasonal Insights</h4>
                <p className="text-sm text-gray-600 mb-2">Peak registration month: <strong>{data.predictions.seasonalPeak}</strong></p>
                <p className="text-sm text-gray-600">Top growth districts: {data.predictions.topGrowthDistricts.join(', ')}</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <h4 className="font-semibold mb-2">Market Insights</h4>
                <p className="text-sm text-gray-600">Total students: <strong>{data.insights.totalStudents}</strong></p>
                <p className="text-sm text-gray-600">Employed students: <strong>{data.insights.totalEmployed}</strong></p>
                <p className="text-sm text-gray-600">Top industries: {Object.keys(data.insights.topIndustries).slice(0, 3).join(', ')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Key Performance Indicators
          </CardTitle>
          <CardDescription>Summary of critical success metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Top Performing Districts</h4>
              <p className="text-sm text-gray-600">{data.insights.topPerformingDistricts.slice(0, 3).join(', ')}</p>
              <p className="text-xs text-green-600">Highest employment success rates</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h4 className="font-semibold mb-2">Top Qualifications</h4>
              <p className="text-sm text-gray-600">{data.insights.topPerformingQualifications.slice(0, 3).join(', ')}</p>
              <p className="text-xs text-blue-600">Highest employment rates</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-semibold mb-2">Market Share</h4>
              <p className="text-sm text-gray-600">{data.companyPerformance.length} active companies</p>
              <p className="text-xs text-purple-600">Employment partnerships</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
              <h4 className="font-semibold mb-2">Risk Management</h4>
              <p className="text-sm text-gray-600">{data.insights.riskAreas} high-risk areas</p>
              <p className="text-xs text-orange-600">Requires attention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 