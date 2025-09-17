"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Users, GraduationCap, Building2, Briefcase, UserPlus } from "lucide-react"

interface AnalyticsChartsProps {
  data: {
    totalStudents: number
    employedStudents: number
    totalUsers: number
    totalCompanies: number
    totalEmployees: number
    districtStats: Array<{ district: string; count: number }>
    provinceStats: Array<{ province: string; count: number }>
    monthlyRegistrations: Array<{ month: string; count: number }>
    totalRegisteredStudents: number
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

// Helper function to calculate logical Y-axis ticks
const calculateYAxisTicks = (maxValue: number) => {
  if (maxValue === 0) return [0, 1, 2, 3, 4, 5] // Default when no data
  if (maxValue <= 5) return [0, 1, 2, 3, 4, 5]
  if (maxValue <= 10) return [0, 2, 4, 6, 8, 10]
  if (maxValue <= 15) return [0, 3, 6, 9, 12, 15]
  if (maxValue <= 20) return [0, 5, 10, 15, 20]
  if (maxValue <= 25) return [0, 5, 10, 15, 20, 25]
  if (maxValue <= 30) return [0, 5, 10, 15, 20, 25, 30]
  if (maxValue <= 40) return [0, 10, 20, 30, 40]
  if (maxValue <= 50) return [0, 10, 20, 30, 40, 50]
  if (maxValue <= 100) return [0, 20, 40, 60, 80, 100]
  
  // For larger values, use increments of 25, 50, or 100
  const increment = maxValue <= 200 ? 25 : maxValue <= 500 ? 50 : 100
  const ticks = []
  const maxTick = Math.ceil(maxValue / increment) * increment
  for (let i = 0; i <= maxTick; i += increment) {
    ticks.push(i)
  }
  return ticks
}

// Helper function to get max value from data
const getMaxValue = (data: Array<{ count: number }>) => {
  return Math.max(...data.map(item => item.count), 0)
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  // Calculate logical Y-axis ticks for each chart
  const districtMaxValue = getMaxValue(data.districtStats || [])
  const provinceMaxValue = getMaxValue(data.provinceStats || [])
  const monthlyMaxValue = getMaxValue(data.monthlyRegistrations || [])
  
  const districtTicks = calculateYAxisTicks(districtMaxValue)
  const provinceTicks = calculateYAxisTicks(provinceMaxValue)
  const monthlyTicks = calculateYAxisTicks(monthlyMaxValue)

  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeof data.totalRegisteredStudents === 'number' ? data.totalRegisteredStudents : 0}</div>
            <p className="text-xs text-muted-foreground">Currently registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employed Students</CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Successfully placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Users</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Companies</CardTitle>
            <Building2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Total companies</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Students by District</CardTitle>
            <CardDescription>Top 10 districts with most registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.districtStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" angle={-45} textAnchor="end" height={80} />
                <YAxis 
                  domain={[0, Math.max(...districtTicks)]}
                  ticks={districtTicks}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Province Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Province</CardTitle>
            <CardDescription>Provincial distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.provinceStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="province" angle={-45} textAnchor="end" height={80} />
                <YAxis 
                  domain={[0, Math.max(...provinceTicks)]}
                  ticks={provinceTicks}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Registrations Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Trend</CardTitle>
          <CardDescription>Monthly student registrations over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyRegistrations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
                }
              />
              <YAxis 
                domain={[0, Math.max(...monthlyTicks)]}
                ticks={monthlyTicks}
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                }
              />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
