"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, AlertTriangle, Shield, Camera, Eye } from "lucide-react"
import type { Quiz, QuizAttempt, SecurityEvent } from "@/types/quiz"
import type { User, QuizProgress } from "@/types/user"
import { QuestionRenderer } from "./question-renderer"
import { QuizResults } from "./quiz-results"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QuizTakerProps {
  user?: User | null
  resumeProgress?: QuizProgress | null
  onProgressSaved?: () => void
}

export function QuizTaker({ user, resumeProgress, onProgressSaved }: QuizTakerProps = {}) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null)
  const [startTime] = useState(Date.now())
  const [copyPasteViolations, setCopyPasteViolations] = useState(0)
  const [screenshotViolations, setScreenshotViolations] = useState(0)
  const [showViolationWarning, setShowViolationWarning] = useState(false)
  const [showScreenshotWarning, setShowScreenshotWarning] = useState(false)
  const [isExamEnded, setIsExamEnded] = useState(false)
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const violationTimeoutRef = useRef<NodeJS.Timeout>()
  const screenshotTimeoutRef = useRef<NodeJS.Timeout>()

  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [sectionTimeLeft, setSectionTimeLeft] = useState<{ [sectionId: string]: number }>({})
  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [sectionScores, setSectionScores] = useState<{ [sectionId: string]: { score: number; totalPoints: number } }>(
    {},
  )

  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  // Auto-save progress every 30 seconds if user is logged in
  useEffect(() => {
    if (!user || !quiz || isCompleted) return

    const autoSaveInterval = setInterval(() => {
      saveProgress()
    }, 30000) // 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [user, quiz, answers, currentQuestionIndex, timeLeft, isCompleted])

  // Load resume progress if provided
  useEffect(() => {
    if (resumeProgress && quiz) {
      setAnswers(resumeProgress.answers || {})
      setCurrentQuestionIndex(resumeProgress.currentQuestionIndex || 0)
      setCurrentSection(resumeProgress.currentSection || null)
      setCompletedSections(resumeProgress.completedSections || [])
      setSectionTimeLeft(resumeProgress.sectionTimeSpent || {})

      // Adjust time left if quiz has time limit
      if (quiz.timeLimit && resumeProgress.timeSpent) {
        const remainingTime = quiz.timeLimit * 60 - resumeProgress.timeSpent
        setTimeLeft(Math.max(0, remainingTime))
      }

      onProgressSaved?.()
    }
  }, [resumeProgress, quiz])

  const saveProgress = async () => {
    if (!user || !quiz || isCompleted || isAutoSaving) return

    setIsAutoSaving(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const progressData: Partial<QuizProgress> = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        currentQuestionIndex,
        answers,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        currentSection,
        completedSections,
        sectionTimeSpent: Object.fromEntries(
          Object.entries(sectionTimeLeft).map(([sectionId, timeLeft]) => [
            sectionId,
            (quiz.sections?.find((s) => s.id === sectionId)?.timeLimit || 0) * 60 - timeLeft,
          ]),
        ),
        isCompleted: false,
      }

      await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(progressData),
      })

      setLastSavedAt(new Date().toISOString())
    } catch (error) {
      console.error("Error saving progress:", error)
    } finally {
      setIsAutoSaving(false)
    }
  }

  useEffect(() => {
    // Load sample quiz
    loadSampleQuiz()
  }, [])

  useEffect(() => {
    if (quiz?.timeLimit && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleSubmitQuiz()
    }
  }, [timeLeft, quiz])

  useEffect(() => {
    if (quiz?.sections && quiz.sections.length > 0) {
      // Initialize section timers
      const sectionTimers: { [sectionId: string]: number } = {}
      quiz.sections.forEach((section) => {
        if (section.timeLimit) {
          sectionTimers[section.id] = section.timeLimit * 60 // Convert to seconds
        }
      })
      setSectionTimeLeft(sectionTimers)

      // Set current section to first section
      const firstSection = quiz.sections.sort((a, b) => a.order - b.order)[0]
      setCurrentSection(firstSection.id)
    }
  }, [quiz])

  useEffect(() => {
    if (currentSection && sectionTimeLeft[currentSection] > 0) {
      const timer = setTimeout(() => {
        setSectionTimeLeft((prev) => ({
          ...prev,
          [currentSection]: prev[currentSection] - 1,
        }))
      }, 1000)
      return () => clearTimeout(timer)
    } else if (currentSection && sectionTimeLeft[currentSection] === 0) {
      handleCompleteSection()
    }
  }, [sectionTimeLeft, currentSection])

  useEffect(() => {
    if (quiz && quiz.copyPasteSettings) {
      const settings = quiz.copyPasteSettings

      // Copy-paste detection
      if (!settings.allowCopyPaste) {
        const handleCopy = (e: ClipboardEvent) => {
          e.preventDefault()
          handleCopyPasteViolation("copy")
        }

        const handlePaste = (e: ClipboardEvent) => {
          e.preventDefault()
          handleCopyPasteViolation("paste")
        }

        const handleKeyDown = (e: KeyboardEvent) => {
          // Prevent Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X
          if (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "a" || e.key === "x")) {
            e.preventDefault()
            handleCopyPasteViolation(e.key === "c" ? "copy" : e.key === "v" ? "paste" : "select")
          }
        }

        const handleContextMenu = (e: MouseEvent) => {
          e.preventDefault()
          addSecurityEvent("context-menu", "Right-click context menu blocked")
        }

        document.addEventListener("copy", handleCopy)
        document.addEventListener("paste", handlePaste)
        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("contextmenu", handleContextMenu)

        return () => {
          document.removeEventListener("copy", handleCopy)
          document.removeEventListener("paste", handlePaste)
          document.removeEventListener("keydown", handleKeyDown)
          document.removeEventListener("contextmenu", handleContextMenu)
        }
      }

      // Screenshot detection
      if (!settings.allowScreenshots && settings.screenshotDetection) {
        const handleScreenshotAttempt = (type: string, details?: string) => {
          handleScreenshotViolation(type, details)
        }

        // Print Screen key detection
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "PrintScreen") {
            e.preventDefault()
            handleScreenshotAttempt("print-screen", "Print Screen key pressed")
          }

          // Windows Snipping Tool shortcuts
          if (e.key === "s" && e.shiftKey && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            handleScreenshotAttempt("screenshot", "Screenshot shortcut detected (Ctrl+Shift+S)")
          }

          // Mac screenshot shortcuts
          if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
            e.preventDefault()
            handleScreenshotAttempt("screenshot", `Mac screenshot shortcut detected (Cmd+Shift+${e.key})`)
          }

          // F12 Developer Tools
          if (e.key === "F12") {
            e.preventDefault()
            addSecurityEvent("dev-tools", "Developer tools access attempt blocked")
          }
        }

        // Visibility change detection (potential screenshot tools)
        const handleVisibilityChange = () => {
          if (document.hidden) {
            addSecurityEvent("screenshot", "Page visibility changed - potential screenshot tool usage")
          }
        }

        // Focus change detection
        const handleBlur = () => {
          addSecurityEvent("screenshot", "Window focus lost - potential screenshot tool usage")
        }

        // Disable drag and drop (prevents dragging images)
        const handleDragStart = (e: DragEvent) => {
          e.preventDefault()
        }

        // Disable image saving
        const handleImageContextMenu = (e: MouseEvent) => {
          const target = e.target as HTMLElement
          if (target.tagName === "IMG") {
            e.preventDefault()
          }
        }

        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("visibilitychange", handleVisibilityChange)
        window.addEventListener("blur", handleBlur)
        document.addEventListener("dragstart", handleDragStart)
        document.addEventListener("contextmenu", handleImageContextMenu)

        // Disable text selection to prevent screenshot of selected text
        document.body.style.userSelect = "none"
        document.body.style.webkitUserSelect = "none"

        // Try to detect screenshot API usage (limited browser support)
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia
          navigator.mediaDevices.getDisplayMedia = (...args) => {
            handleScreenshotAttempt("screenshot", "Screen capture API accessed")
            return Promise.reject(new Error("Screen capture is not allowed during the quiz"))
          }
        }

        return () => {
          document.removeEventListener("keydown", handleKeyDown)
          document.removeEventListener("visibilitychange", handleVisibilityChange)
          window.removeEventListener("blur", handleBlur)
          document.removeEventListener("dragstart", handleDragStart)
          document.removeEventListener("contextmenu", handleImageContextMenu)
          document.body.style.userSelect = ""
          document.body.style.webkitUserSelect = ""
        }
      }
    }
  }, [quiz, copyPasteViolations, screenshotViolations])

  const loadSampleQuiz = async () => {
    try {
      const response = await fetch("/api/quiz/sample")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const sampleQuiz = await response.json()

      // Validate quiz structure
      if (!sampleQuiz || !sampleQuiz.questions || !Array.isArray(sampleQuiz.questions)) {
        throw new Error("Invalid quiz data structure")
      }

      setQuiz(sampleQuiz)
      if (sampleQuiz.timeLimit) {
        setTimeLeft(sampleQuiz.timeLimit * 60) // Convert minutes to seconds
      }
    } catch (error) {
      console.error("Error loading quiz:", error)
      // Set a fallback quiz or show error state
      setQuiz({
        id: "error-quiz",
        title: "Quiz Loading Error",
        questions: [],
        timeLimit: null,
      })
    }
  }

  const addSecurityEvent = (type: SecurityEvent["type"], details?: string) => {
    const event: SecurityEvent = {
      type,
      timestamp: new Date().toISOString(),
      details,
    }
    setSecurityEvents((prev) => [...prev, event])
  }

  const handleCopyPasteViolation = (type: string) => {
    if (!quiz?.copyPasteSettings || quiz.copyPasteSettings.allowCopyPaste) return

    const newViolationCount = copyPasteViolations + 1
    setCopyPasteViolations(newViolationCount)
    setShowViolationWarning(true)
    addSecurityEvent(type as SecurityEvent["type"], `Copy-paste violation: ${type}`)

    // Clear previous timeout
    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current)
    }

    // Hide warning after 5 seconds
    violationTimeoutRef.current = setTimeout(() => {
      setShowViolationWarning(false)
    }, 5000)

    // Check if max violations reached
    if (newViolationCount >= quiz.copyPasteSettings.maxViolations) {
      if (quiz.copyPasteSettings.violationAction === "end-exam") {
        setIsExamEnded(true)
        handleSubmitQuiz()
      }
    }
  }

  const handleScreenshotViolation = (type: string, details?: string) => {
    if (!quiz?.copyPasteSettings || quiz.copyPasteSettings.allowScreenshots) return

    const newViolationCount = screenshotViolations + 1
    setScreenshotViolations(newViolationCount)
    setShowScreenshotWarning(true)
    addSecurityEvent("screenshot", details || `Screenshot violation: ${type}`)

    // Clear previous timeout
    if (screenshotTimeoutRef.current) {
      clearTimeout(screenshotTimeoutRef.current)
    }

    // Hide warning after 5 seconds
    screenshotTimeoutRef.current = setTimeout(() => {
      setShowScreenshotWarning(false)
    }, 5000)

    // Check if max violations reached
    if (newViolationCount >= quiz.copyPasteSettings.maxScreenshotViolations) {
      if (quiz.copyPasteSettings.screenshotViolationAction === "end-exam") {
        setIsExamEnded(true)
        handleSubmitQuiz()
      }
    }
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!quiz) return

    const timeSpentTotal = Math.floor((Date.now() - startTime) / 1000)

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers,
          timeSpent: timeSpentTotal,
          copyPasteViolations,
          copyPasteDetected: copyPasteViolations > 0,
          screenshotViolations,
          screenshotDetected: screenshotViolations > 0,
          securityEvents,
        }),
      })

      const result = await response.json()
      setQuizAttempt(result)
      setIsCompleted(true)

      // Mark progress as completed if user is logged in
      if (user) {
        const token = localStorage.getItem("auth_token")
        if (token) {
          await fetch("/api/progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              quizId: quiz.id,
              quizTitle: quiz.title,
              currentQuestionIndex,
              answers,
              timeSpent: timeSpentTotal,
              currentSection,
              completedSections,
              sectionTimeSpent: Object.fromEntries(
                Object.entries(sectionTimeLeft).map(([sectionId, timeLeft]) => [
                  sectionId,
                  (quiz.sections?.find((s) => s.id === sectionId)?.timeLimit || 0) * 60 - timeLeft,
                ]),
              ),
              isCompleted: true,
              score: result.score,
              totalPoints: result.totalPoints,
              completedAt: new Date().toISOString(),
            }),
          })
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleCompleteSection = () => {
    if (!quiz || !currentSection) return

    const section = quiz.sections?.find((s) => s.id === currentSection)
    if (!section) return

    // Calculate section score
    const sectionQuestions = quiz.questions.filter((q) => q.sectionId === currentSection)
    let sectionScore = 0
    let sectionTotalPoints = 0

    sectionQuestions.forEach((question) => {
      sectionTotalPoints += question.points
      const userAnswer = answers[question.id]
      if (checkAnswer(question, userAnswer)) {
        sectionScore += question.points
      }
    })

    setSectionScores((prev) => ({
      ...prev,
      [currentSection]: { score: sectionScore, totalPoints: sectionTotalPoints },
    }))

    setCompletedSections((prev) => [...prev, currentSection])

    // Move to next section or complete quiz
    const nextSection = getNextSection(currentSection)
    if (nextSection) {
      setCurrentSection(nextSection.id)
      // Reset to first question of next section
      const firstQuestionIndex = quiz.questions.findIndex((q) => q.sectionId === nextSection.id)
      if (firstQuestionIndex !== -1) {
        setCurrentQuestionIndex(firstQuestionIndex)
      }
    } else {
      handleSubmitQuiz()
    }
  }

  const getNextSection = (currentSectionId: string) => {
    if (!quiz?.sections) return null

    const currentSectionIndex = quiz.sections.findIndex((s) => s.id === currentSectionId)
    const nextSectionIndex = currentSectionIndex + 1

    if (nextSectionIndex < quiz.sections.length) {
      return quiz.sections[nextSectionIndex]
    }

    return null
  }

  const checkAnswer = (question: any, userAnswer: any) => {
    if (!question || !userAnswer) return false

    if (question.type === "multiple-choice") {
      return question.correctAnswer === userAnswer
    } else if (question.type === "true-false") {
      return question.correctAnswer === userAnswer
    } else if (question.type === "short-answer") {
      return question.correctAnswer.toLowerCase() === userAnswer.toLowerCase()
    }

    return false
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading quiz...</div>
      </div>
    )
  }

  // Add safety check for questions
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">No questions available in this quiz.</div>
      </div>
    )
  }

  if (isExamEnded && !isCompleted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Exam Terminated</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">The exam has been terminated due to security violations:</p>
            <div className="space-y-2">
              {copyPasteViolations > 0 && (
                <p className="text-sm text-red-600">
                  Copy-paste violations: {copyPasteViolations}/{quiz.copyPasteSettings?.maxViolations}
                </p>
              )}
              {screenshotViolations > 0 && (
                <p className="text-sm text-red-600">
                  Screenshot violations: {screenshotViolations}/{quiz.copyPasteSettings?.maxScreenshotViolations}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500">Your answers have been automatically submitted.</p>
            <div className="text-lg font-semibold">Please wait for results...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCompleted && quizAttempt) {
    return <QuizResults quiz={quiz} attempt={quizAttempt} />
  }

  const currentQuestion = quiz.questions?.[currentQuestionIndex]
  const progress = quiz.questions?.length ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0

  // Add this check before the main render
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Current question not found.</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Saving Indicator */}
      {user && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isAutoSaving ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`}
                />
                <span className="text-sm text-green-800">
                  {isAutoSaving
                    ? "Saving..."
                    : lastSavedAt
                      ? `Last saved: ${new Date(lastSavedAt).toLocaleTimeString()}`
                      : "Auto-save enabled"}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={saveProgress} disabled={isAutoSaving}>
                Save Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Warnings */}
      {showViolationWarning && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> {quiz.copyPasteSettings?.warningMessage || "Copy-paste detected!"} (
            {copyPasteViolations}/{quiz.copyPasteSettings?.maxViolations} violations)
          </AlertDescription>
        </Alert>
      )}

      {showScreenshotWarning && (
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <Camera className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Screenshot Warning:</strong>{" "}
            {quiz.copyPasteSettings?.screenshotWarningMessage || "Screenshot attempt detected!"} ({screenshotViolations}
            /{quiz.copyPasteSettings?.maxScreenshotViolations} violations)
          </AlertDescription>
        </Alert>
      )}

      {/* Security Status Indicators */}
      {quiz.copyPasteSettings && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Security Protection Active</span>
                </div>

                {!quiz.copyPasteSettings.allowCopyPaste && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">
                      Copy-Paste: {copyPasteViolations}/{quiz.copyPasteSettings.maxViolations}
                    </span>
                  </div>
                )}

                {!quiz.copyPasteSettings.allowScreenshots && quiz.copyPasteSettings.screenshotDetection && (
                  <div className="flex items-center gap-2">
                    <Camera className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">
                      Screenshots: {screenshotViolations}/{quiz.copyPasteSettings.maxScreenshotViolations}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-xs text-blue-600">Security Events: {securityEvents.length}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {quiz?.sections && quiz.sections.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-medium">
                  Section: {quiz.sections.find((s) => s.id === currentSection)?.title || "Unknown"}
                </h3>
                {currentSection && sectionTimeLeft[currentSection] !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className={sectionTimeLeft[currentSection] < 300 ? "text-red-600 font-bold" : ""}>
                      {formatTime(sectionTimeLeft[currentSection])}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {quiz.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      section.id === currentSection
                        ? "bg-blue-500 text-white"
                        : completedSections.includes(section.id)
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Section Progress */}
            {currentSection && (
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Section Progress</span>
                  <span>
                    {quiz.questions.filter((q) => q.sectionId === currentSection && answers[q.id]).length} /{" "}
                    {quiz.questions.filter((q) => q.sectionId === currentSection).length} answered
                  </span>
                </div>
                <Progress
                  value={
                    (quiz.questions.filter((q) => q.sectionId === currentSection && answers[q.id]).length /
                      quiz.questions.filter((q) => q.sectionId === currentSection).length) *
                    100
                  }
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{quiz.title}</CardTitle>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeLeft < 300 ? "text-red-600 font-bold" : ""}>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <QuestionRenderer
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
            copyPasteRestricted={!quiz.copyPasteSettings?.allowCopyPaste}
            screenshotRestricted={!quiz.copyPasteSettings?.allowScreenshots}
          />
        </CardContent>
      </Card>

      {currentSection && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>

          <div className="flex gap-2">
            {/* Check if this is the last question in current section */}
            {quiz?.questions.filter((q) => q.sectionId === currentSection).indexOf(currentQuestion) ===
            quiz?.questions.filter((q) => q.sectionId === currentSection).length - 1 ? (
              <Button onClick={handleCompleteSection} className="bg-orange-600 hover:bg-orange-700">
                Complete Section
              </Button>
            ) : currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmitQuiz} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>Next</Button>
            )}
          </div>
        </div>
      )}

      {/* Question Navigation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Question Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {quiz.questions?.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 ${answers[quiz.questions[index]?.id] ? "bg-green-100 border-green-300" : ""}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            )) || []}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
