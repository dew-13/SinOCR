"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StudentTrendInsight } from "@/lib/types/ai-insights"
import { TrendingUp, TrendingDown, Minus, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react"

interface TrendInsightCardProps {
  insight: StudentTrendInsight
}

export function TrendInsightCard({ insight }: TrendInsightCardProps) {
  const TrendIcon = insight.trend === 'increasing' ? TrendingUp : 
                   insight.trend === 'decreasing' ? TrendingDown : Minus

  const impactColor = insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                     insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                     'bg-green-100 text-green-800'

  const trendColor = insight.trend === 'increasing' ? 'text-green-600' :
                    insight.trend === 'decreasing' ? 'text-red-600' :
                    'text-gray-600'

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendIcon className={`h-5 w-5 ${trendColor}`} />
            <CardTitle className="text-lg">{insight.title}</CardTitle>
          </div>
          <Badge className={impactColor}>
            {insight.impact} impact
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {insight.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Confidence Level</span>
          <span className="font-medium">{insight.confidence}%</span>
        </div>
        <Progress value={insight.confidence} className="h-2" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Category</span>
            <p className="font-medium capitalize">{insight.category}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Timeframe</span>
            <p className="font-medium">{insight.timeframe}</p>
          </div>
        </div>

        {insight.actionable && insight.recommendations && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Recommendations</span>
            </div>
            <ul className="space-y-1">
              {insight.recommendations.map((rec, index) => (
                <li key={index} className="text-xs text-blue-800 flex items-start gap-1">
                  <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}