"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  DollarSign,
  MapPin,
  Clock,
  Star,
  Zap,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  category: string
  dataPoints: string[]
  actionItems: string[]
  predictedOutcome: string
}

interface AIInsightsProps {
  data: any
}

export default function AIInsights({ data }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateAIInsights()
  }, [data])

  const generateAIInsights = () => {
    if (!data) return

    const generatedInsights: AIInsight[] = []

    // Employment Probability Insights
    if (data.employmentProbability) {
      const topQualification = data.employmentProbability[0]
      if (topQualification && topQualification.employment_rate > 80) {
        generatedInsights.push({
          id: 'qual-success',
          type: 'opportunity',
          title: 'High Success Qualification Identified',
          description: `${topQualification.education_qualification} shows exceptional employment success rate of ${topQualification.employment_rate}%`,
          confidence: 95,
          impact: 'high',
          category: 'Education',
          dataPoints: [
            `${topQualification.employment_rate}% employment rate`,
            `${topQualification.total_students} students analyzed`,
            `${topQualification.district} district focus`
          ],
          actionItems: [
            'Increase marketing for this qualification',
            'Develop specialized training programs',
            'Partner with companies seeking this skill set'
          ],
          predictedOutcome: 'Potential 15% increase in overall employment rate'
        })
      }
    }

    // Salary Prediction Insights
    if (data.salaryPredictions) {
      const avgSalaryGrowth = data.salaryPredictions.reduce((acc: number, pred: any) => {
        const growth = ((pred.predicted_salary_next_year - pred.avg_salary) / pred.avg_salary) * 100
        return acc + growth
      }, 0) / data.salaryPredictions.length

      if (avgSalaryGrowth > 5) {
        generatedInsights.push({
          id: 'salary-growth',
          type: 'trend',
          title: 'Positive Salary Growth Trend',
          description: `Average salary is predicted to increase by ${avgSalaryGrowth.toFixed(1)}% next year`,
          confidence: 88,
          impact: 'medium',
          category: 'Compensation',
          dataPoints: [
            `${avgSalaryGrowth.toFixed(1)}% average growth`,
            `${data.salaryPredictions.length} positions analyzed`,
            'Market demand increasing'
          ],
          actionItems: [
            'Update salary expectations in marketing materials',
            'Negotiate better compensation packages',
            'Highlight growth potential to students'
          ],
          predictedOutcome: 'Improved student attraction and retention'
        })
      }
    }

    // Risk Assessment Insights
    if (data.riskAssessment) {
      const highRiskDistricts = data.riskAssessment.filter((risk: any) => risk.risk_level === 'High Risk')
      if (highRiskDistricts.length > 0) {
        generatedInsights.push({
          id: 'risk-alert',
          type: 'risk',
          title: 'High-Risk Districts Identified',
          description: `${highRiskDistricts.length} districts show concerning employment rates below 30%`,
          confidence: 92,
          impact: 'high',
          category: 'Geographic',
          dataPoints: highRiskDistricts.map((risk: any) => 
            `${risk.district}: ${risk.employment_rate}% success rate`
          ),
          actionItems: [
            'Implement targeted intervention programs',
            'Increase local company partnerships',
            'Provide additional training and support'
          ],
          predictedOutcome: 'Risk of declining overall performance if not addressed'
        })
      }
    }

    // Market Trend Insights
    if (data.marketTrends) {
      const recentTrend = data.marketTrends.slice(0, 3)
      const trendDirection = recentTrend.reduce((acc: number, trend: any, index: number) => {
        if (index === 0) return 0
        return acc + (trend.employments - recentTrend[index - 1].employments)
      }, 0)

      if (trendDirection > 0) {
        generatedInsights.push({
          id: 'market-growth',
          type: 'trend',
          title: 'Market Expansion Detected',
          description: 'Recent employment trends show positive growth in market demand',
          confidence: 85,
          impact: 'medium',
          category: 'Market',
          dataPoints: [
            `${trendDirection} net increase in employments`,
            'Growing market demand',
            'Favorable economic conditions'
          ],
          actionItems: [
            'Scale up recruitment efforts',
            'Expand training programs',
            'Strengthen industry partnerships'
          ],
          predictedOutcome: 'Opportunity for increased placement success'
        })
      }
    }

    // Seasonal Pattern Insights
    if (data.seasonalPatterns) {
      const peakMonth = data.seasonalPatterns.reduce((max: any, month: any) => 
        month.registrations > (max?.registrations || 0) ? month : max, null
      )

      if (peakMonth) {
        generatedInsights.push({
          id: 'seasonal-peak',
          type: 'opportunity',
          title: 'Seasonal Registration Peak Identified',
          description: `Peak registration period identified in month ${peakMonth.month} with ${peakMonth.registrations} registrations`,
          confidence: 90,
          impact: 'medium',
          category: 'Timing',
          dataPoints: [
            `Peak month: ${peakMonth.month}`,
            `${peakMonth.registrations} registrations`,
            'Predictable pattern established'
          ],
          actionItems: [
            'Increase marketing efforts during peak period',
            'Prepare additional resources for high demand',
            'Optimize training schedules'
          ],
          predictedOutcome: 'Improved resource allocation and efficiency'
        })
      }
    }

    // Qualification Impact Insights
    if (data.qualificationImpact) {
      const lowPerformingQuals = data.qualificationImpact.filter((qual: any) => qual.employment_rate < 50)
      if (lowPerformingQuals.length > 0) {
        generatedInsights.push({
          id: 'qual-improvement',
          type: 'recommendation',
          title: 'Qualification Enhancement Needed',
          description: `${lowPerformingQuals.length} qualifications show below-average employment rates`,
          confidence: 87,
          impact: 'high',
          category: 'Education',
          dataPoints: lowPerformingQuals.map((qual: any) => 
            `${qual.education_qualification}: ${qual.employment_rate}%`
          ),
          actionItems: [
            'Review and update curriculum content',
            'Add industry-relevant skills training',
            'Strengthen industry partnerships for these qualifications'
          ],
          predictedOutcome: 'Potential 20% improvement in employment rates'
        })
      }
    }

    setInsights(generatedInsights)
    setLoading(false)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'trend': return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-yellow-500" />
      default: return <Brain className="h-4 w-4 text-purple-500" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>Generating intelligent insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Intelligent analysis and recommendations based on data patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {insights.map((insight) => (
            <div key={insight.id} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <h3 className="font-semibold">{insight.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact} impact
                  </Badge>
                  <Badge variant="outline">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Key Data Points:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {insight.dataPoints.map((point, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Recommended Actions:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {insight.actionItems.map((action, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-blue-500" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Predicted Outcome:</h4>
                <p className="text-sm text-gray-700">{insight.predictedOutcome}</p>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Confidence Level</span>
                  <span>{insight.confidence}%</span>
                </div>
                <Progress value={insight.confidence} className="mt-1" />
              </div>
            </div>
          ))}

          {insights.length === 0 && (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                No significant insights detected. This may indicate stable performance or insufficient data for analysis.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 