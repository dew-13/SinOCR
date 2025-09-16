// Types for AI-powered student trend insights and predictions
export interface StudentTrendInsight {
  id: string
  title: string
  description: string
  trend: 'increasing' | 'decreasing' | 'stable'
  confidence: number
  impact: 'high' | 'medium' | 'low'
  category: 'enrollment' | 'employment' | 'geographic' | 'demographic' | 'performance'
  timeframe: string
  actionable: boolean
  recommendations?: string[]
}

export interface PredictiveMetric {
  metric: string
  currentValue: number | string
  predictedValue: number | string
  changePercentage: number
  trend: 'up' | 'down' | 'stable'
  confidence: number
  timeframe: string
  description: string
}

export interface GeographicTrend {
  district: string
  province: string
  currentStudents: number
  projectedGrowth: number
  employmentRate: number
  riskLevel: 'low' | 'medium' | 'high'
  opportunities: string[]
  challenges: string[]
}

export interface DemographicInsight {
  category: string
  segment: string
  currentCount: number
  trendDirection: 'growing' | 'declining' | 'stable'
  employmentSuccess: number
  keyInsights: string[]
  recommendations: string[]
}

export interface IndustryForecast {
  industry: string
  demandLevel: 'high' | 'medium' | 'low'
  projectedJobs: number
  skillsRequired: string[]
  preparednessScore: number
  gapAnalysis: string[]
  opportunities: string[]
}

export interface SeasonalPattern {
  pattern: string
  peakMonths: string[]
  lowMonths: string[]
  averageVariation: number
  recommendations: string[]
  historicalAccuracy: number
}

export interface SuccessPredictor {
  factor: string
  importance: number
  positiveIndicators: string[]
  negativeIndicators: string[]
  currentStatus: 'good' | 'concerning' | 'needs_attention'
  actionItems: string[]
}

export interface AIInsightsData {
  overview: {
    totalInsights: number
    highImpactInsights: number
    trendsIdentified: number
    predictionsGenerated: number
    confidenceLevel: number
    lastAnalyzed: string
  }
  
  trends: StudentTrendInsight[]
  predictions: PredictiveMetric[]
  geographic: GeographicTrend[]
  demographics: DemographicInsight[]
  industries: IndustryForecast[]
  seasonal: SeasonalPattern[]
  successFactors: SuccessPredictor[]
  
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    strategic: string[]
  }
  
  alerts: {
    type: 'opportunity' | 'risk' | 'trend' | 'anomaly'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    actionRequired: boolean
    deadline?: string
  }[]
}

export interface InsightVisualization {
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'heatmap' | 'gauge'
  title: string
  data: any[]
  insights: string[]
  interactable: boolean
}