import { type NextRequest, NextResponse } from "next/server"
import type { QuizAttempt } from "@/types/quiz"

export async function POST(request: NextRequest) {
  try {
    const {
      quizId,
      answers,
      timeSpent,
      copyPasteViolations,
      copyPasteDetected,
      screenshotViolations,
      screenshotDetected,
      securityEvents,
    } = await request.json()

    // Load the sample quiz for scoring
    const sampleQuizResponse = await fetch(`${request.nextUrl.origin}/api/quiz/sample`)
    const quiz = await sampleQuizResponse.json()

    let score = 0
    let totalPoints = 0

    // Calculate score based on question types
    quiz.questions.forEach((question: any) => {
      totalPoints += question.points
      const userAnswer = answers[question.id]

      if (checkAnswer(question, userAnswer)) {
        score += question.points
      }
    })

    const attempt: QuizAttempt = {
      id: Date.now().toString(),
      quizId,
      answers,
      score,
      totalPoints,
      completedAt: new Date().toISOString(),
      timeSpent,
      copyPasteViolations: copyPasteViolations || 0,
      copyPasteDetected: copyPasteDetected || false,
      screenshotViolations: screenshotViolations || 0,
      screenshotDetected: screenshotDetected || false,
      securityEvents: securityEvents || [],
    }

    return NextResponse.json(attempt)
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}

function checkAnswer(question: any, userAnswer: any): boolean {
  switch (question.type) {
    case "multiple-choice":
      return userAnswer === question.correctAnswer
    case "multiple-select":
      if (!userAnswer || !Array.isArray(userAnswer)) return false
      return JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correctAnswers.sort())
    case "true-false":
      return userAnswer === question.correctAnswer
    case "fill-blank":
      if (!userAnswer) return false
      return question.correctAnswers.some((correct: string) =>
        question.caseSensitive ? userAnswer === correct : userAnswer.toLowerCase() === correct.toLowerCase(),
      )
    case "short-answer":
      // For demo purposes, we'll check if any keywords are present
      if (!userAnswer || !question.keywords) return false
      const lowerAnswer = userAnswer.toLowerCase()
      return question.keywords.some((keyword: string) => lowerAnswer.includes(keyword.toLowerCase()))
    case "essay":
      // Essays are typically manually graded, so we'll give partial credit
      if (!userAnswer) return false
      const wordCount = userAnswer.split(/\s+/).filter((word: string) => word.length > 0).length
      return wordCount >= (question.minWords || 0)
    case "matching":
      if (!userAnswer) return false
      return JSON.stringify(userAnswer) === JSON.stringify(question.correctMatches)
    case "ordering":
      if (!userAnswer) return false
      return JSON.stringify(userAnswer) === JSON.stringify(question.correctOrder)
    default:
      return false
  }
}
