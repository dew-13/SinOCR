"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GeographicTrend } from "@/lib/types/ai-insights"
import { MapPin, TrendingUp, AlertTriangle, CheckCircle, Users } from "lucide-react"

interface GeographicTrendCardProps {
  trend: GeographicTrend
}

export function GeographicTrendCard({ trend }: GeographicTrendCardProps) {
  const riskColor = trend.riskLevel === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                   trend.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                   'bg-red-100 text-red-800 border-red-200'

  const riskIcon = trend.riskLevel === 'low' ? CheckCircle : AlertTriangle

  const growthColor = trend.projectedGrowth > 0 ? 'text-green-600' : 
                     trend.projectedGrowth < 0 ? 'text-red-600' : 'text-gray-600'

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{trend.district}</CardTitle>
              <CardDescription className="text-sm">{trend.province} Province</CardDescription>
            </div>
          </div>
          <Badge className={riskColor}>
            {React.createElement(riskIcon, { className: "h-3 w-3 mr-1" })}
            {trend.riskLevel} risk
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{trend.currentStudents}</p>
            <p className="text-xs text-muted-foreground">Current Students</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{trend.employmentRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Employment Rate</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${growthColor}`}>
              {trend.projectedGrowth > 0 ? '+' : ''}{trend.projectedGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Projected Growth</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Employment Success</span>
            <span className="font-medium">{trend.employmentRate.toFixed(1)}%</span>
          </div>
          <Progress value={trend.employmentRate} className="h-2" />
        </div>

        {trend.opportunities.length > 0 && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Opportunities</span>
            </div>
            <ul className="space-y-1">
              {trend.opportunities.slice(0, 2).map((opp, index) => (
                <li key={index} className="text-xs text-green-800 flex items-start gap-1">
                  <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {trend.challenges.length > 0 && (
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Challenges</span>
            </div>
            <ul className="space-y-1">
              {trend.challenges.slice(0, 2).map((challenge, index) => (
                <li key={index} className="text-xs text-orange-800 flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {challenge}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// React import fix
import React from "react"