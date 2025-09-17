"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  TrendingUp, 
  Users, 
  MapPin, 
  Building2,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  BarChart3,
  Briefcase
} from "lucide-react"

interface AIInsightsData {
  provinceRegistrations: {
    predictions: Record<string, number>;
    totalPredicted: number;
    confidence: number;
    insights: string[];
    recommendations: string[];
    historicalTrends?: Record<string, number>;
    seasonalFactors?: Record<string, number>;
  };
  jobCategoryEmployment: {
    predictions: Record<string, number>;
    totalPredicted: number;
    confidence: number;
    insights: string[];
    recommendations: string[];
    marketDemand?: Record<string, number>;
    riskFactors?: string[];
  };
  generatedAt: string;
  dataPoints: {
    totalStudents: number;
    totalPlacements: number;
    analysisRange: string;
  };
}

export default function AIInsightsDashboard() {
  const [data, setData] = useState<AIInsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAIInsights()
  }, [])

  const fetchAIInsights = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai-insights", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || "Failed to load AI insights")
        }
      } else {
        setError("Failed to load AI insights")
      }
    } catch (err) {
      setError("Error fetching AI insights")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
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
          <CardTitle>No AI Insights Available</CardTitle>
          <CardDescription>Unable to generate insights. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.dataPoints.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Students analyzed</p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
            <Briefcase className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.dataPoints.totalPlacements}</div>
            <p className="text-xs text-muted-foreground">Employment records</p>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">Active data</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Province Predictions</CardTitle>
            <MapPin className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.provinceRegistrations.totalPredicted}</div>
            <p className="text-xs text-muted-foreground">Next 3 months</p>
            <Progress value={data.provinceRegistrations.confidence} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Predictions</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.jobCategoryEmployment.totalPredicted}</div>
            <p className="text-xs text-muted-foreground">Employment forecast</p>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-blue-500">{data.jobCategoryEmployment.confidence}% confidence</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Analysis Summary
          </CardTitle>
          <CardDescription>Generated on {new Date(data.generatedAt).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-blue-600 mb-2">Province Forecast</h4>
              <p className="text-2xl font-bold text-blue-700">{data.provinceRegistrations.totalPredicted}</p>
              <p className="text-sm text-gray-600">Total predicted registrations</p>
              <p className="text-xs text-gray-500 mt-1">Confidence: {data.provinceRegistrations.confidence}%</p>
            </div>
            <div>
              <h4 className="font-medium text-green-600 mb-2">Japan Employment Forecast</h4>
              <p className="text-2xl font-bold text-green-700">{data.jobCategoryEmployment.totalPredicted}</p>
              <p className="text-sm text-gray-600">Japan placement opportunities</p>
              <p className="text-xs text-gray-500 mt-1">Confidence: {data.jobCategoryEmployment.confidence}%</p>
              <div className="flex items-center mt-1">
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">🇯🇵 Japan Focus</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-purple-600 mb-2">Data Analysis</h4>
              <p className="text-2xl font-bold text-purple-700">{data.dataPoints.totalStudents + data.dataPoints.totalPlacements}</p>
              <p className="text-sm text-gray-600">Total records analyzed</p>
              <p className="text-xs text-gray-500 mt-1">Range: {data.dataPoints.analysisRange}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Province Registration Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Province Registration Predictions
          </CardTitle>
          <CardDescription>Predicted student registrations by province for the next 3 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.provinceRegistrations.predictions)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([province, count], index) => (
                <div key={province} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{province}</h4>
                    <Badge className="bg-blue-100 text-blue-800">{count} students</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Predicted registrations</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Key Insights</h4>
              <ul className="space-y-2">
                {data.provinceRegistrations.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {data.provinceRegistrations.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Japan Employment Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            Japan Employment Predictions
            <Badge className="bg-red-100 text-red-800">🇯🇵 Japan Focus</Badge>
          </CardTitle>
          <CardDescription>Predicted employment placements in Japan for Sri Lankan citizens (next 3 months)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.jobCategoryEmployment.predictions)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([category, count], index) => (
                <div key={category} className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 text-sm">{category}</h4>
                    <Badge className="bg-green-100 text-green-800">{count} positions</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Japan placements</p>
                  {data.jobCategoryEmployment.marketDemand && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Japan demand: {((data.jobCategoryEmployment.marketDemand[category] || 1) * 100).toFixed(0)}%
                      </p>
                      <div className="flex items-center mt-1">
                        {category === 'Nursing care' && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">High Priority</span>}
                        {category === 'Agriculture' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">TITP Popular</span>}
                        {category === 'Information Technology' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">SSW Eligible</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Japan Market Insights</h4>
              <ul className="space-y-2">
                {data.jobCategoryEmployment.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {data.jobCategoryEmployment.riskFactors && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-orange-600">Japan Employment Risk Factors</h4>
                <ul className="space-y-2">
                  {data.jobCategoryEmployment.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Japan Employment Strategy</h4>
              <ul className="space-y-2">
                {data.jobCategoryEmployment.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Japan Visa Types Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-3 text-blue-800">Japan Visa Programs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-700">TITP (Technical Intern Training)</p>
                  <p className="text-gray-600">3-5 year programs, basic skill training</p>
                  <p className="text-xs text-gray-500">Popular: Agriculture, Manufacturing, Construction</p>
                </div>
                <div>
                  <p className="font-medium text-blue-700">SSW (Specified Skilled Worker)</p>
                  <p className="text-gray-600">5+ year programs, skilled workers</p>
                  <p className="text-xs text-gray-500">Focus: Nursing care, IT, Advanced manufacturing</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}