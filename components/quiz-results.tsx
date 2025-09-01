"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Trophy, RotateCcw, AlertTriangle, Shield, Camera, Eye } from "lucide-react"
import type { Quiz, QuizAttempt } from "@/types/quiz"

interface QuizResultsProps {
  quiz: Quiz
  attempt: QuizAttempt
}

export function QuizResults({ quiz, attempt }: QuizResultsProps) {
  const percentage = Math.round((attempt.score / attempt.totalPoints) * 100)
  const passed = quiz.passingScore ? percentage >= quiz.passingScore : true

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A", color: "bg-green-500" }
    if (percentage >= 80) return { grade: "B", color: "bg-blue-500" }
    if (percentage >= 70) return { grade: "C", color: "bg-yellow-500" }
    if (percentage >= 60) return { grade: "D", color: "bg-orange-500" }
    return { grade: "F", color: "bg-red-500" }
  }

  const { grade, color } = getGrade(percentage)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Copy-Paste and Screenshot Status Alert */}
      {quiz.copyPasteSettings?.showCopyStatusInResults && (attempt.copyPasteDetected || attempt.screenshotDetected) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">Security Violations Detected</p>
                <div className="text-sm text-orange-700 space-y-1">
                  {attempt.copyPasteDetected && <p>Copy-paste violations: {attempt.copyPasteViolations}</p>}
                  {attempt.screenshotDetected && <p>Screenshot violations: {attempt.screenshotViolations}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {passed ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">{passed ? "Congratulations!" : "Quiz Completed"}</CardTitle>
          <p className="text-gray-600">{quiz.title}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div
                className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2`}
              >
                {grade}
              </div>
              <p className="text-sm text-gray-600">Grade</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{percentage}%</div>
              <p className="text-sm text-gray-600">Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {attempt.score}/{attempt.totalPoints}
              </div>
              <p className="text-sm text-gray-600">Points</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{formatTime(attempt.timeSpent)}</div>
              <p className="text-sm text-gray-600">Time</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          <div className="flex justify-center gap-2 mb-4">
            {quiz.passingScore && (
              <Badge variant={passed ? "default" : "destructive"}>
                {passed ? "Passed" : "Failed"} (Required: {quiz.passingScore}%)
              </Badge>
            )}

            {quiz.copyPasteSettings?.showCopyStatusInResults && (
              <>
                <Badge variant={attempt.copyPasteDetected ? "destructive" : "default"}>
                  <Shield className="h-3 w-3 mr-1" />
                  {attempt.copyPasteDetected ? "Copy-Paste Detected" : "No Copy-Paste"}
                </Badge>

                {quiz.copyPasteSettings.screenshotDetection && (
                  <Badge variant={attempt.screenshotDetected ? "destructive" : "default"}>
                    <Camera className="h-3 w-3 mr-1" />
                    {attempt.screenshotDetected ? "Screenshots Detected" : "No Screenshots"}
                  </Badge>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Summary */}
      {quiz.copyPasteSettings?.showCopyStatusInResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Copy-Paste Section */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  Copy-Paste Control
                </h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {quiz.copyPasteSettings.allowCopyPaste ? "Allowed" : "Restricted"}
                    </div>
                    <p className="text-xs text-gray-600">Policy</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{attempt.copyPasteViolations || 0}</div>
                    <p className="text-xs text-gray-600">Violations</p>
                  </div>
                </div>
              </div>

              {/* Screenshot Section */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Camera className="h-4 w-4 text-purple-600" />
                  Screenshot Control
                </h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {quiz.copyPasteSettings.allowScreenshots ? "Allowed" : "Restricted"}
                    </div>
                    <p className="text-xs text-gray-600">Policy</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{attempt.screenshotViolations || 0}</div>
                    <p className="text-xs text-gray-600">Violations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Events Timeline */}
            {attempt.securityEvents && attempt.securityEvents.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-3">Security Events Timeline</h4>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {attempt.securityEvents.map((event, index) => (
                    <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{event.type.replace("-", " ")}</span>
                        <span className="text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {event.details && <p className="text-gray-600 mt-1">{event.details}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = attempt.answers[question.id]
              const isCorrect = checkAnswer(question, userAnswer)

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Question {index + 1}</span>
                        {isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <Badge variant="outline">{question.points} pts</Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{question.question}</p>
                      <div className="text-sm">
                        <p className="text-gray-600">
                          <strong>Your answer:</strong> {formatUserAnswer(question, userAnswer)}
                        </p>
                        {!isCorrect && (
                          <p className="text-green-600">
                            <strong>Correct answer:</strong> {formatCorrectAnswer(question)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Retake Quiz
        </Button>
        <Button onClick={() => window.print()}>Print Results</Button>
      </div>
    </div>
  )
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

function formatUserAnswer(question: any, userAnswer: any): string {
  if (!userAnswer) return "No answer"

  switch (question.type) {
    case "multiple-choice":
      return question.options[userAnswer] || "Invalid selection"
    case "multiple-select":
      if (!Array.isArray(userAnswer)) return "No answer"
      return userAnswer.map((index: number) => question.options[index]).join(", ")
    case "true-false":
      return userAnswer ? "True" : "False"
    case "matching":
      if (typeof userAnswer !== "object") return "No answer"
      const matchPairs = Object.entries(userAnswer).map(([leftIndex, rightIndex]) => {
        const leftItem = question.leftItems[Number.parseInt(leftIndex)]
        const rightItem = question.rightItems[rightIndex as number]
        return `${leftItem} → ${rightItem}`
      })
      return matchPairs.length > 0 ? matchPairs.join(", ") : "No matches made"
    case "ordering":
      if (!Array.isArray(userAnswer)) return "No answer"
      return userAnswer.map((index: number) => question.items[index]).join(" → ")
    default:
      return userAnswer.toString()
  }
}

function formatCorrectAnswer(question: any): string {
  switch (question.type) {
    case "multiple-choice":
      return question.options[question.correctAnswer]
    case "multiple-select":
      return question.correctAnswers.map((index: number) => question.options[index]).join(", ")
    case "true-false":
      return question.correctAnswer ? "True" : "False"
    case "fill-blank":
      return question.correctAnswers.join(" or ")
    case "matching":
      const correctPairs = Object.entries(question.correctMatches).map(([leftIndex, rightIndex]) => {
        const leftItem = question.leftItems[Number.parseInt(leftIndex)]
        const rightItem = question.rightItems[rightIndex as number]
        return `${leftItem} → ${rightItem}`
      })
      return correctPairs.join(", ")
    case "ordering":
      return question.correctOrder.map((index: number) => question.items[index]).join(" → ")
    default:
      return "See explanation"
  }
}
