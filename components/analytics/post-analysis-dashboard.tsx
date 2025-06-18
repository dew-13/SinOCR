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
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { 
  TrendingUp, 
  Users, 
  MapPin,
  Clock,
  Star,
  Award,
  Building2,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Trophy,
  GraduationCap
} from "lucide-react"

interface PostAnalysisData {
  performanceMetrics: {
    total_students: number
    employed_students: number
    active_students: number
    inactive_students: number
    overall_success_rate: number
  }
  successStories: Array<{
    full_name: string
    education_qualification: string
    district: string
    position: string
    employment_date: string
    company_name: string
    country: string
    industry: string
    age: number
    work_experience: string
    other_qualifications: string
    contract_duration_months: number
  }>
  employmentTimeline: Array<{
    month: string
    employments: number
    companies_hired: number
    students_employed: number
  }>
  employmentAnalysis: Array<{
    position: string
    industry: string
    country: string
    employee_count: number
    unique_students: number
    companies_involved: number
    avg_contract_duration: number
  }>
  companyPerformance: Array<{
    company_name: string
    country: string
    industry: string
    employee_count: number
    unique_students: number
    first_hire: string
    latest_hire: string
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
  demographicAnalysis: Array<{
    sex: string
    marital_status: string
    total_students: number
    employed_students: number
    employment_rate: number
    avg_age: number
  }>
  qualificationSuccess: Array<{
    education_qualification: string
    total_students: number
    employed_students: number
    employment_rate: number
    avg_contract_duration: number
  }>
  experienceImpact: Array<{
    experience_level: string
    total_students: number
    employed_students: number
    employment_rate: number
  }>
  monthlyTrends: Array<{
    month: string
    registrations: number
    employments: number
    success_rate: number
  }>
  yearlyComparison: Array<{
    year: number
    total_registrations: number
    total_employments: number
    yearly_success_rate: number
  }>
  retentionAnalysis: Array<{
    company_name: string
    industry: string
    total_hires: number
    long_term_employees: number
    retention_rate: number
  }>
  progressMetrics: Array<{
    position: string
    industry: string
    employee_count: number
    avg_contract_duration: number
    unique_students: number
    contract_type: string
  }>
  insights: {
    totalStudents: number
    employedStudents: number
    activeStudents: number
    inactiveStudents: number
    overallSuccessRate: number
    topPerformingCompany: string
    mostSuccessfulDistrict: string
    bestQualification: string
    retentionRate: number
    topIndustries: Record<string, number>
    employmentProgress: {
      totalEmployments: number
      uniqueCompanies: number
      averageContractDuration: number
    }
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function PostAnalysisDashboard() {
  const [data, setData] = useState<PostAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPostAnalysisData()
  }, [])

  const fetchPostAnalysisData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/analytics/post-analysis", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load post-analysis data")
      }
    } catch (error) {
      console.error("Failed to fetch post-analysis data:", error)
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
          <CardDescription>Unable to load post-analysis data. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'Long-term': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium-term': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Short-term': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Post Analysis Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Historical performance analysis and success metrics
        </p>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.insights.totalStudents}</div>
            <p className="text-xs text-muted-foreground">All time registrations</p>
            <Progress value={100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successfully Employed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.insights.employedStudents}</div>
            <p className="text-xs text-muted-foreground">Placement success</p>
            <Progress value={data.insights.overallSuccessRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.insights.overallSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">Excellent</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Building2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.insights.employmentProgress.uniqueCompanies}</div>
            <p className="text-xs text-muted-foreground">Employment partners</p>
            <div className="flex items-center mt-2">
              <Award className="h-3 w-3 text-orange-500 mr-1" />
              <span className="text-xs text-orange-500">Partnerships</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Success Stories
          </CardTitle>
          <CardDescription>Latest employment achievements and success patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.successStories.slice(0, 6).map((story, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{story.full_name}</h4>
                  <Badge variant="secondary">{story.contract_duration_months} months</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{story.position}</p>
                <p className="text-xs text-gray-500 mb-2">{story.company_name} • {story.country}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{story.district}</span>
                  <span className="text-green-600">{story.education_qualification}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Industry: {story.industry}</p>
                  <p>Employed: {new Date(story.employment_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employment Timeline & Progress Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Employment Timeline
            </CardTitle>
            <CardDescription>Monthly employment trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.employmentTimeline}>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Employment by Position
            </CardTitle>
            <CardDescription>Employment distribution across different roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.employmentAnalysis.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="position" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employee_count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Company Performance & Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top Performing Companies
            </CardTitle>
            <CardDescription>Companies with highest employment rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.companyPerformance.slice(0, 8).map((company, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{company.company_name}</p>
                    <p className="text-sm text-gray-600">{company.industry} • {company.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{company.employee_count} hires</p>
                    <p className="text-xs text-green-600">{company.market_share}% market share</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Success Distribution
            </CardTitle>
            <CardDescription>Employment rates by district</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.geographicDistribution.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ district, employment_rate }) => `${district}: ${employment_rate}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="employment_rate"
                >
                  {data.geographicDistribution.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Demographic Analysis & Qualification Success */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demographic Performance
            </CardTitle>
            <CardDescription>Success rates by gender and marital status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.demographicAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sex" />
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
              <GraduationCap className="h-5 w-5" />
              Qualification Success Rates
            </CardTitle>
            <CardDescription>Employment success by educational background</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.qualificationSuccess.slice(0, 6).map((qual, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{qual.education_qualification}</p>
                    <p className="text-xs text-gray-600">{qual.total_students} students</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{qual.employment_rate}%</p>
                    <p className="text-xs text-green-600">{qual.avg_contract_duration} months avg</p>
                  </div>
                  <Progress value={qual.employment_rate} className="w-20 ml-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Comparison & Retention Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Yearly Performance Comparison
            </CardTitle>
            <CardDescription>Annual trends and growth patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.yearlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total_registrations" stroke="#8884d8" strokeWidth={2} name="Registrations" />
                <Line type="monotone" dataKey="total_employments" stroke="#00C49F" strokeWidth={2} name="Employments" />
                <Line type="monotone" dataKey="yearly_success_rate" stroke="#FFBB28" strokeWidth={2} name="Success Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Employee Retention Analysis
            </CardTitle>
            <CardDescription>Long-term employment success by company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.retentionAnalysis.slice(0, 6).map((retention, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{retention.company_name}</p>
                    <p className="text-sm text-gray-600">{retention.industry}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{retention.retention_rate}%</p>
                    <p className="text-xs text-gray-600">{retention.long_term_employees}/{retention.total_hires}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Employment Progress Analysis
          </CardTitle>
          <CardDescription>Contract duration and employment stability metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.progressMetrics.slice(0, 9).map((progress, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{progress.position}</h4>
                  <Badge className={getContractTypeColor(progress.contract_type)}>
                    {progress.contract_type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{progress.industry}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Employees:</span>
                    <span className="font-medium">{progress.employee_count}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Contract:</span>
                    <span className="font-medium">{progress.avg_contract_duration} months</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Unique Students:</span>
                    <span className="font-medium">{progress.unique_students}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Key Performance Insights
          </CardTitle>
          <CardDescription>Summary of critical success metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Top Performer</h4>
              <p className="text-sm text-gray-600">{data.insights.topPerformingCompany}</p>
              <p className="text-xs text-green-600">Best employment partner</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h4 className="font-semibold mb-2">Most Successful District</h4>
              <p className="text-sm text-gray-600">{data.insights.mostSuccessfulDistrict}</p>
              <p className="text-xs text-blue-600">Highest employment rate</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-semibold mb-2">Best Qualification</h4>
              <p className="text-sm text-gray-600">{data.insights.bestQualification}</p>
              <p className="text-xs text-purple-600">Highest success rate</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
              <h4 className="font-semibold mb-2">Employment Progress</h4>
              <p className="text-sm text-gray-600">{data.insights.employmentProgress.totalEmployments} total employments</p>
              <p className="text-xs text-orange-600">{data.insights.employmentProgress.averageContractDuration} months avg</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 