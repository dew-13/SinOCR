"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Users, 
  DollarSign, 
  MapPin,
  Clock,
  Star,
  Brain,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"

interface AnalyticsComparisonProps {
  preAnalysisData: any
  postAnalysisData: any
}

export default function AnalyticsComparison({ preAnalysisData, postAnalysisData }: AnalyticsComparisonProps) {
  const [comparisonMetrics, setComparisonMetrics] = useState<any>(null)

  useEffect(() => {
    if (preAnalysisData && postAnalysisData) {
      generateComparisonMetrics()
    }
  }, [preAnalysisData, postAnalysisData])

  const generateComparisonMetrics = () => {
    const metrics = {
      // Employment Rate Comparison
      employmentRate: {
        predicted: preAnalysisData?.overallEmploymentRate || 0,
        actual: postAnalysisData?.insights?.overallSuccessRate || 0,
        difference: ((postAnalysisData?.insights?.overallSuccessRate || 0) - (preAnalysisData?.overallEmploymentRate || 0)).toFixed(1),
        accuracy: Math.abs(((postAnalysisData?.insights?.overallSuccessRate || 0) - (preAnalysisData?.overallEmploymentRate || 0)) / (preAnalysisData?.overallEmploymentRate || 1) * 100).toFixed(1)
      },

      // Salary Predictions vs Actual
      salaryComparison: {
        predicted: preAnalysisData?.insights?.avgSalary || 0,
        actual: postAnalysisData?.insights?.avgSalary || 0,
        difference: ((postAnalysisData?.insights?.avgSalary || 0) - (preAnalysisData?.insights?.avgSalary || 0)).toFixed(2),
        accuracy: Math.abs(((postAnalysisData?.insights?.avgSalary || 0) - (preAnalysisData?.insights?.avgSalary || 0)) / (preAnalysisData?.insights?.avgSalary || 1) * 100).toFixed(1)
      },

      // Growth Predictions
      growthComparison: {
        predicted: preAnalysisData?.predictions?.avgGrowthRate || 0,
        actual: postAnalysisData?.yearlyComparison?.[0]?.total_registrations || 0,
        difference: ((postAnalysisData?.yearlyComparison?.[0]?.total_registrations || 0) - (preAnalysisData?.predictions?.avgGrowthRate || 0)),
        accuracy: Math.abs(((postAnalysisData?.yearlyComparison?.[0]?.total_registrations || 0) - (preAnalysisData?.predictions?.avgGrowthRate || 0)) / (preAnalysisData?.predictions?.avgGrowthRate || 1) * 100).toFixed(1)
      },

      // Risk Assessment Accuracy
      riskAccuracy: {
        predicted: preAnalysisData?.insights?.riskAreas || 0,
        actual: postAnalysisData?.riskAssessment?.filter((r: any) => r.risk_level === 'High Risk').length || 0,
        accuracy: preAnalysisData?.insights?.riskAreas === (postAnalysisData?.riskAssessment?.filter((r: any) => r.risk_level === 'High Risk').length || 0) ? 100 : 75
      }
    }

    setComparisonMetrics(metrics)
  }

  const getComparisonIcon = (difference: number) => {
    if (difference > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />
    if (difference < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600'
    if (accuracy >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (accuracy >= 75) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
  }

  if (!comparisonMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Comparison</CardTitle>
          <CardDescription>Loading comparison data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Pre vs Post Analysis Comparison
        </CardTitle>
        <CardDescription>
          Compare predicted outcomes with actual results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="salary">Salary</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Accuracy Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Employment Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{comparisonMetrics.employmentRate.accuracy}%</div>
                  <p className="text-xs text-muted-foreground">Prediction accuracy</p>
                  <div className="flex items-center mt-2">
                    {getComparisonIcon(Number(comparisonMetrics.employmentRate.difference))}
                    <span className="text-xs ml-1">
                      {comparisonMetrics.employmentRate.difference}% difference
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Salary Predictions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{comparisonMetrics.salaryComparison.accuracy}%</div>
                  <p className="text-xs text-muted-foreground">Prediction accuracy</p>
                  <div className="flex items-center mt-2">
                    {getComparisonIcon(Number(comparisonMetrics.salaryComparison.difference))}
                    <span className="text-xs ml-1">
                      ${comparisonMetrics.salaryComparison.difference} difference
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth Predictions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{comparisonMetrics.growthComparison.accuracy}%</div>
                  <p className="text-xs text-muted-foreground">Prediction accuracy</p>
                  <div className="flex items-center mt-2">
                    {getComparisonIcon(comparisonMetrics.growthComparison.difference)}
                    <span className="text-xs ml-1">
                      {comparisonMetrics.growthComparison.difference} students difference
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{comparisonMetrics.riskAccuracy.accuracy}%</div>
                  <p className="text-xs text-muted-foreground">Prediction accuracy</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs">
                      {comparisonMetrics.riskAccuracy.actual} actual vs {comparisonMetrics.riskAccuracy.predicted} predicted
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Prediction Performance</CardTitle>
                <CardDescription>Summary of AI prediction accuracy across all metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Accuracy</span>
                    <span className={`text-lg font-bold ${getAccuracyColor(
                      (Number(comparisonMetrics.employmentRate.accuracy) + 
                       Number(comparisonMetrics.salaryComparison.accuracy) + 
                       Number(comparisonMetrics.growthComparison.accuracy) + 
                       comparisonMetrics.riskAccuracy.accuracy) / 4
                    )}`}>
                      {((Number(comparisonMetrics.employmentRate.accuracy) + 
                         Number(comparisonMetrics.salaryComparison.accuracy) + 
                         Number(comparisonMetrics.growthComparison.accuracy) + 
                         comparisonMetrics.riskAccuracy.accuracy) / 4).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(Number(comparisonMetrics.employmentRate.accuracy) + 
                           Number(comparisonMetrics.salaryComparison.accuracy) + 
                           Number(comparisonMetrics.growthComparison.accuracy) + 
                           comparisonMetrics.riskAccuracy.accuracy) / 4} 
                    className="h-2"
                  />
                  <div className="flex justify-center">
                    {getAccuracyBadge((Number(comparisonMetrics.employmentRate.accuracy) + 
                                      Number(comparisonMetrics.salaryComparison.accuracy) + 
                                      Number(comparisonMetrics.growthComparison.accuracy) + 
                                      comparisonMetrics.riskAccuracy.accuracy) / 4)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employment Rate Predictions vs Reality</CardTitle>
                <CardDescription>Compare predicted employment rates with actual outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Predicted Rate</span>
                      <span className="text-lg font-bold text-blue-600">
                        {comparisonMetrics.employmentRate.predicted}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Actual Rate</span>
                      <span className="text-lg font-bold text-green-600">
                        {comparisonMetrics.employmentRate.actual}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Difference</span>
                      <span className={`text-lg font-bold ${
                        Number(comparisonMetrics.employmentRate.difference) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {comparisonMetrics.employmentRate.difference}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Accuracy</span>
                      <span className={`text-lg font-bold ${getAccuracyColor(Number(comparisonMetrics.employmentRate.accuracy))}`}>
                        {comparisonMetrics.employmentRate.accuracy}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getComparisonIcon(Number(comparisonMetrics.employmentRate.difference))}
                        <span className="text-sm">
                          {Number(comparisonMetrics.employmentRate.difference) > 0 
                            ? 'Actual performance exceeded predictions' 
                            : 'Actual performance below predictions'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          Prediction confidence: {Number(comparisonMetrics.employmentRate.accuracy) >= 90 ? 'High' : 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Salary Prediction Accuracy</CardTitle>
                <CardDescription>Compare predicted salary ranges with actual earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Predicted Average</span>
                      <span className="text-lg font-bold text-blue-600">
                        ${comparisonMetrics.salaryComparison.predicted}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Actual Average</span>
                      <span className="text-lg font-bold text-green-600">
                        ${comparisonMetrics.salaryComparison.actual}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Difference</span>
                      <span className={`text-lg font-bold ${
                        Number(comparisonMetrics.salaryComparison.difference) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${comparisonMetrics.salaryComparison.difference}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Accuracy</span>
                      <span className={`text-lg font-bold ${getAccuracyColor(Number(comparisonMetrics.salaryComparison.accuracy))}`}>
                        {comparisonMetrics.salaryComparison.accuracy}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Market Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getComparisonIcon(Number(comparisonMetrics.salaryComparison.difference))}
                        <span className="text-sm">
                          {Number(comparisonMetrics.salaryComparison.difference) > 0 
                            ? 'Market salaries higher than predicted' 
                            : 'Market salaries lower than predicted'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Salary prediction reliability: {Number(comparisonMetrics.salaryComparison.accuracy) >= 85 ? 'High' : 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Prediction Analysis</CardTitle>
                <CardDescription>Compare predicted growth with actual student registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Predicted Growth</span>
                      <span className="text-lg font-bold text-blue-600">
                        {comparisonMetrics.growthComparison.predicted} students
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Actual Growth</span>
                      <span className="text-lg font-bold text-green-600">
                        {comparisonMetrics.growthComparison.actual} students
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Difference</span>
                      <span className={`text-lg font-bold ${
                        comparisonMetrics.growthComparison.difference > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {comparisonMetrics.growthComparison.difference} students
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Accuracy</span>
                      <span className={`text-lg font-bold ${getAccuracyColor(Number(comparisonMetrics.growthComparison.accuracy))}`}>
                        {comparisonMetrics.growthComparison.accuracy}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Growth Insights</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getComparisonIcon(comparisonMetrics.growthComparison.difference)}
                        <span className="text-sm">
                          {comparisonMetrics.growthComparison.difference > 0 
                            ? 'Growth exceeded expectations' 
                            : 'Growth below expectations'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          Growth prediction confidence: {Number(comparisonMetrics.growthComparison.accuracy) >= 80 ? 'High' : 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 