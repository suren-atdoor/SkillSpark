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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    const userProgress = progressData.filter((p) => p.userId === userId && !p.isCompleted)

    return NextResponse.json(userProgress)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    const progressUpdate = await request.json()

    // Find existing progress or create new
    let existingProgress = progressData.find(
      (p) => p.userId === userId && p.quizId === progressUpdate.quizId && !p.isCompleted,
    )

    if (existingProgress) {
      // Update existing progress
      Object.assign(existingProgress, {
        ...progressUpdate,
        userId,
        lastSavedAt: new Date().toISOString(),
      })
    } else {
      // Create new progress entry
      const newProgress: QuizProgress = {
        id: Date.now().toString(),
        userId,
        ...progressUpdate,
        startedAt: progressUpdate.startedAt || new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
      }
      progressData.push(newProgress)
      existingProgress = newProgress
    }

    return NextResponse.json(existingProgress)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
