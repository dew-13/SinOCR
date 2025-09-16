"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AIInsightsData } from "@/lib/types/ai-insights"
import { TrendInsightCard } from "./trend-insight-card"
import { PredictiveMetricCard } from "./predictive-metric-card"
import { GeographicTrendCard } from "./geographic-trend-card"
import { IndustryForecastCard } from "./industry-forecast-card"
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
  BarChart3
} from "lucide-react"

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
      const response = await fetch("/api/analytics/ai-insights", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const insightsData = await response.json()
        setData(insightsData)
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
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalInsights}</div>
            <p className="text-xs text-muted-foreground">Generated insights</p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Impact</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.highImpactInsights}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
            <div className="flex items-center mt-2">
              <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
              <span className="text-xs text-orange-500">Priority items</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.predictionsGenerated}</div>
            <p className="text-xs text-muted-foreground">Future forecasts</p>
            <Progress value={data.overview.confidenceLevel} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.confidenceLevel}%</div>
            <p className="text-xs text-muted-foreground">Average accuracy</p>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">High reliability</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Priority Alerts
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {alert.type}
                      </Badge>
                      <span className="font-medium">{alert.title}</span>
                    </div>
                    {alert.deadline && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Due: {new Date(alert.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Insights */}
      {data.trends.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Trend Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.trends.map((trend, index) => (
              <TrendInsightCard key={index} insight={trend} />
            ))}
          </div>
        </div>
      )}

      {/* Predictions */}
      {data.predictions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Predictive Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.predictions.map((prediction, index) => (
              <PredictiveMetricCard key={index} metric={prediction} />
            ))}
          </div>
        </div>
      )}

      {/* Geographic Trends */}
      {data.geographic.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-purple-600" />
            Geographic Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.geographic.slice(0, 6).map((geo, index) => (
              <GeographicTrendCard key={index} trend={geo} />
            ))}
          </div>
        </div>
      )}

      {/* Industry Forecasts */}
      {data.industries.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" />
            Industry Forecasts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.industries.slice(0, 6).map((industry, index) => (
              <IndustryForecastCard key={index} forecast={industry} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Strategic Recommendations
          </CardTitle>
          <CardDescription>AI-generated actionable recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-red-600 mb-2">Immediate Actions</h4>
                <ul className="space-y-1">
                  {data.recommendations.immediate.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-600 mb-2">Short Term (1-3 months)</h4>
                <ul className="space-y-1">
                  {data.recommendations.shortTerm.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Clock className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-600 mb-2">Long Term (3-12 months)</h4>
                <ul className="space-y-1">
                  {data.recommendations.longTerm.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <TrendingUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-purple-600 mb-2">Strategic (1+ years)</h4>
                <ul className="space-y-1">
                  {data.recommendations.strategic.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Target className="h-3 w-3 text-purple-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}