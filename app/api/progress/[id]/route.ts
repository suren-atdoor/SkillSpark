import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import type { QuizProgress } from "@/types/user"

// In-memory storage for demo
const progressData: QuizProgress[] = []

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided")
  }

  const token = authHeader.substring(7)
  const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as any
  return decoded.userId
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromToken(request)
    const progress = progressData.find((p) => p.id === params.id && p.userId === userId)

    if (!progress) {
      return NextResponse.json({ error: "Progress not found" }, { status: 404 })
    }

    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromToken(request)
    const progressIndex = progressData.findIndex((p) => p.id === params.id && p.userId === userId)

    if (progressIndex === -1) {
      return NextResponse.json({ error: "Progress not found" }, { status: 404 })
    }

    progressData.splice(progressIndex, 1)
    return NextResponse.json({ message: "Progress deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
