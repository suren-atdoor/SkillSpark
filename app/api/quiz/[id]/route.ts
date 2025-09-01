import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
const quizzes: any[] = []

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const index = quizzes.findIndex((quiz) => quiz.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    quizzes.splice(index, 1)
    return NextResponse.json({ message: "Quiz deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 })
  }
}
