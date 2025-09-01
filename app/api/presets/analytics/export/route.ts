import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"
    const category = searchParams.get("category") || "all"

    // Mock CSV data - in real app, generate from actual analytics
    const csvData = `Preset Name,Category,Usage Count,Average Score,Completion Rate,Violation Rate,User Feedback
High-Stakes Certification,Academic,1247,78.5,89.2,12.3,4.2
Compliance Training,Corporate,2156,85.1,94.5,8.7,4.5
Self-Paced Learning,Learning,3421,72.8,96.8,2.1,4.7
University Final Exam,Academic,892,74.2,87.3,15.6,3.9
Skills Assessment,Corporate,1543,69.4,82.1,18.2,3.8
Security Clearance,Security,234,88.7,91.4,3.2,4.1`

    const response = new NextResponse(csvData)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set("Content-Disposition", `attachment; filename="preset-analytics-${range}.csv"`)

    return response
  } catch (error) {
    return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 })
  }
}
