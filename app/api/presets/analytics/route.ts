import { type NextRequest, NextResponse } from "next/server"
import type { PresetAnalytics } from "@/types/quiz"

// Mock analytics data - in real app, this would come from database
const generateMockAnalytics = (range: string, category: string): PresetAnalytics[] => {
  const baseData = [
    {
      presetId: "certification-exam",
      presetName: "High-Stakes Certification",
      category: "Academic",
      usageCount: 1247,
      lastUsed: "2024-06-19T16:45:00Z",
      averageQuizScore: 78.5,
      violationRate: 12.3,
      completionRate: 89.2,
      userFeedback: 4.2,
    },
    {
      presetId: "compliance-training",
      presetName: "Compliance Training",
      category: "Corporate",
      usageCount: 2156,
      lastUsed: "2024-06-20T15:10:00Z",
      averageQuizScore: 85.1,
      violationRate: 8.7,
      completionRate: 94.5,
      userFeedback: 4.5,
    },
    {
      presetId: "self-paced",
      presetName: "Self-Paced Learning",
      category: "Learning",
      usageCount: 3421,
      lastUsed: "2024-06-20T16:15:00Z",
      averageQuizScore: 72.8,
      violationRate: 2.1,
      completionRate: 96.8,
      userFeedback: 4.7,
    },
    {
      presetId: "university-final",
      presetName: "University Final Exam",
      category: "Academic",
      usageCount: 892,
      lastUsed: "2024-06-18T13:22:00Z",
      averageQuizScore: 74.2,
      violationRate: 15.6,
      completionRate: 87.3,
      userFeedback: 3.9,
    },
    {
      presetId: "skills-assessment",
      presetName: "Skills Assessment",
      category: "Corporate",
      usageCount: 1543,
      lastUsed: "2024-06-19T11:45:00Z",
      averageQuizScore: 69.4,
      violationRate: 18.2,
      completionRate: 82.1,
      userFeedback: 3.8,
    },
    {
      presetId: "security-clearance",
      presetName: "Security Clearance",
      category: "Security",
      usageCount: 234,
      lastUsed: "2024-06-15T14:20:00Z",
      averageQuizScore: 88.7,
      violationRate: 3.2,
      completionRate: 91.4,
      userFeedback: 4.1,
    },
  ]

  // Filter by category if specified
  const filteredData = category === "all" ? baseData : baseData.filter((item) => item.category === category)

  // Adjust data based on time range (mock implementation)
  const rangeMultiplier =
    {
      "7d": 0.1,
      "30d": 0.4,
      "90d": 0.8,
      "1y": 1.0,
    }[range] || 1.0

  return filteredData.map((item) => ({
    ...item,
    usageCount: Math.floor(item.usageCount * rangeMultiplier),
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"
    const category = searchParams.get("category") || "all"

    const analytics = generateMockAnalytics(range, category)

    return NextResponse.json(analytics)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
