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

interface AnalyticsChartsProps {
  data: {
    totalStudents: number
    employedStudents: number
    districtStats: Array<{ district: string; count: number }>
    provinceStats: Array<{ province: string; count: number }>
    monthlyRegistrations: Array<{ month: string; count: number }>
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const employmentRate =
    data.totalStudents > 0
      ? ((data.employedStudents / (data.totalStudents + data.employedStudents)) * 100).toFixed(1)
      : 0

  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Currently registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employed Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.employedStudents}</div>
            <p className="text-xs text-muted-foreground">Successfully placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employmentRate}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
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
                <YAxis />
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
              <PieChart>
                <Pie
                  data={data.provinceStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ province, percent }) => `${province} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.provinceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
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
              <YAxis />
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
