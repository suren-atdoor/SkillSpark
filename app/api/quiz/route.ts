import { type NextRequest, NextResponse } from "next/server"
import type { Quiz } from "@/types/quiz"

// In-memory storage for demo purposes
const quizzes: Quiz[] = []

export async function GET() {
  return NextResponse.json(quizzes)
}

export async function POST(request: NextRequest) {
  try {
    const quiz: Quiz = await request.json()

    const existingIndex = quizzes.findIndex((q) => q.id === quiz.id)
    if (existingIndex >= 0) {
      quizzes[existingIndex] = quiz
    } else {
      quizzes.push(quiz)
    }

    return NextResponse.json(quiz)
  } catch (error) {
    return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 })
  }
}
