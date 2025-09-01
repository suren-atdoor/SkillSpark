"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { TrendingUp, Users, Shield, AlertTriangle, CheckCircle, Download } from "lucide-react"
import type { PresetAnalytics } from "@/types/quiz"

interface PresetAnalyticsDashboardProps {
  onClose: () => void
}

export function PresetAnalyticsDashboard({ onClose }: PresetAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<PresetAnalytics[]>([])
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, selectedCategory])

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/presets/analytics?range=${timeRange}&category=${selectedCategory}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
    }
  }

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/presets/analytics/export?range=${timeRange}&category=${selectedCategory}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `preset-analytics-${timeRange}.csv`
      link.click()
    } catch (error) {
      console.error("Error exporting analytics:", error)
    }
  }

  // Calculate summary statistics
  const totalUsage = analytics.reduce((sum, preset) => sum + preset.usageCount, 0)
  const averageScore = analytics.reduce((sum, preset) => sum + (preset.averageQuizScore || 0), 0) / analytics.length
  const averageViolationRate =
    analytics.reduce((sum, preset) => sum + (preset.violationRate || 0), 0) / analytics.length
  const averageCompletionRate =
    analytics.reduce((sum, preset) => sum + (preset.completionRate || 0), 0) / analytics.length

  // Prepare chart data
  const usageData = analytics
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10)
    .map((preset) => ({
      name: preset.presetName.length > 15 ? preset.presetName.substring(0, 15) + "..." : preset.presetName,
      usage: preset.usageCount,
      category: preset.category,
    }))

  const categoryData = analytics.reduce(
    (acc, preset) => {
      const existing = acc.find((item) => item.category === preset.category)
      if (existing) {
        existing.count += preset.usageCount
      } else {
        acc.push({ category: preset.category, count: preset.usageCount })
      }
      return acc
    },
    [] as { category: string; count: number }[],
  )

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Preset Analytics Dashboard</h2>
          <p className="text-gray-600">Track usage patterns and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
              <SelectItem value="Learning">Learning</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quiz Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+2.3% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violation Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageViolationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">-1.2% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+5.1% from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="security">Security Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Used Presets */}
            <Card>
              <CardHeader>
                <CardTitle>Most Used Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Usage by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Preset Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Preset</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-right p-2">Usage</th>
                        <th className="text-right p-2">Avg Score</th>
                        <th className="text-right p-2">Completion</th>
                        <th className="text-right p-2">Violations</th>
                        <th className="text-right p-2">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.map((preset) => (
                        <tr key={preset.presetId} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{preset.presetName}</td>
                          <td className="p-2">
                            <Badge variant="outline">{preset.category}</Badge>
                          </td>
                          <td className="p-2 text-right">{preset.usageCount.toLocaleString()}</td>
                          <td className="p-2 text-right">
                            <span
                              className={
                                preset.averageQuizScore && preset.averageQuizScore >= 70
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {preset.averageQuizScore?.toFixed(1) || "N/A"}%
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex items-center gap-2">
                              <Progress value={preset.completionRate || 0} className="w-16 h-2" />
                              <span>{preset.completionRate?.toFixed(0) || "N/A"}%</span>
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            <span
                              className={
                                preset.violationRate && preset.violationRate > 10 ? "text-red-600" : "text-green-600"
                              }
                            >
                              {preset.violationRate?.toFixed(1) || "N/A"}%
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < (preset.userFeedback || 0) ? "bg-yellow-400" : "bg-gray-200"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-xs">{preset.userFeedback?.toFixed(1) || "N/A"}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Violations */}
            <Card>
              <CardHeader>
                <CardTitle>Security Violation Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics
                    .filter((preset) => preset.violationRate && preset.violationRate > 0)
                    .sort((a, b) => (b.violationRate || 0) - (a.violationRate || 0))
                    .slice(0, 8)
                    .map((preset) => (
                      <div key={preset.presetId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{preset.presetName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={preset.violationRate || 0} className="w-20 h-2" />
                          <span className="text-sm font-medium w-12 text-right">
                            {preset.violationRate?.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle>Security Effectiveness Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics
                    .map((preset) => ({
                      ...preset,
                      effectivenessScore: Math.max(0, 100 - (preset.violationRate || 0) * 2),
                    }))
                    .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
                    .slice(0, 8)
                    .map((preset) => (
                      <div key={preset.presetId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle
                            className={`h-4 w-4 ${preset.effectivenessScore > 80 ? "text-green-500" : preset.effectivenessScore > 60 ? "text-yellow-500" : "text-red-500"}`}
                          />
                          <span className="text-sm">{preset.presetName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={preset.effectivenessScore} className="w-20 h-2" />
                          <span className="text-sm font-medium w-12 text-right">
                            {preset.effectivenessScore.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={[
                    { date: "2024-01", usage: 1200, violations: 45 },
                    { date: "2024-02", usage: 1350, violations: 38 },
                    { date: "2024-03", usage: 1580, violations: 42 },
                    { date: "2024-04", usage: 1720, violations: 35 },
                    { date: "2024-05", usage: 1890, violations: 31 },
                    { date: "2024-06", usage: 2100, violations: 28 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="usage" fill="#8884d8" name="Usage Count" />
                  <Line yAxisId="right" type="monotone" dataKey="violations" stroke="#ff7300" name="Violation Rate" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
