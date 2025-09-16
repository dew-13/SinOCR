"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PredictiveMetric } from "@/lib/types/ai-insights"
import { TrendingUp, TrendingDown, Minus, Target, Clock } from "lucide-react"

interface PredictiveMetricCardProps {
  metric: PredictiveMetric
}

export function PredictiveMetricCard({ metric }: PredictiveMetricCardProps) {
  const TrendIcon = metric.trend === 'up' ? TrendingUp : 
                   metric.trend === 'down' ? TrendingDown : Minus

  const trendColor = metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'

  const trendBgColor = metric.trend === 'up' ? 'bg-green-100 text-green-800' :
                      metric.trend === 'down' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{metric.metric}</CardTitle>
          </div>
          <Badge className={trendBgColor}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {metric.trend}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {metric.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="text-2xl font-bold text-gray-900">{metric.currentValue}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Predicted</p>
            <p className="text-2xl font-bold text-blue-900">{metric.predictedValue}</p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <span className={`text-sm font-medium ${trendColor}`}>
            {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground">change</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground">Timeframe</span>
              <p className="font-medium">{metric.timeframe}</p>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Confidence</span>
            <p className="font-medium">{metric.confidence}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}