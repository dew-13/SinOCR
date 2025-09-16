"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { IndustryForecast } from "@/lib/types/ai-insights"
import { Building2, TrendingUp, Users, Target, Lightbulb } from "lucide-react"

interface IndustryForecastCardProps {
  forecast: IndustryForecast
}

export function IndustryForecastCard({ forecast }: IndustryForecastCardProps) {
  const demandColor = forecast.demandLevel === 'high' ? 'bg-green-100 text-green-800' :
                     forecast.demandLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                     'bg-red-100 text-red-800'

  const preparednessColor = forecast.preparednessScore >= 80 ? 'text-green-600' :
                           forecast.preparednessScore >= 60 ? 'text-yellow-600' :
                           'text-red-600'

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{forecast.industry}</CardTitle>
          </div>
          <Badge className={demandColor}>
            {forecast.demandLevel} demand
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{forecast.projectedJobs}</p>
            <p className="text-xs text-muted-foreground">Projected Jobs</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className={`text-2xl font-bold ${preparednessColor}`}>{forecast.preparednessScore}%</p>
            <p className="text-xs text-muted-foreground">Preparedness</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Market Readiness</span>
            <span className="font-medium">{forecast.preparednessScore}%</span>
          </div>
          <Progress value={forecast.preparednessScore} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Key Skills Required</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {forecast.skillsRequired.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {forecast.skillsRequired.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{forecast.skillsRequired.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {forecast.opportunities.length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Market Opportunities</span>
              </div>
              <ul className="space-y-1">
                {forecast.opportunities.slice(0, 2).map((opp, index) => (
                  <li key={index} className="text-xs text-green-800 flex items-start gap-1">
                    <div className="h-1 w-1 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {forecast.gapAnalysis.length > 0 && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Action Items</span>
              </div>
              <ul className="space-y-1">
                {forecast.gapAnalysis.slice(0, 2).map((gap, index) => (
                  <li key={index} className="text-xs text-orange-800 flex items-start gap-1">
                    <div className="h-1 w-1 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}