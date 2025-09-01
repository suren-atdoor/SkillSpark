"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Trophy, Target, Play } from "lucide-react"
import type { User, QuizProgress } from "@/types/user"

interface UserDashboardProps {
  user: User
  onLogout: () => void
  onResumeQuiz: (progress: QuizProgress) => void
  onStartQuiz: () => void
}

export function UserDashboard({ user, onLogout, onResumeQuiz, onStartQuiz }: UserDashboardProps) {
  const [savedProgress, setSavedProgress] = useState<QuizProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserProgress()
  }, [])

  const loadUserProgress = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch("/api/progress", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSavedProgress(data)
      }
    } catch (error) {
      console.error("Error loading progress:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getProgressPercentage = (progress: QuizProgress) => {
    // This is a simplified calculation - you might want to make it more sophisticated
    return Math.round((progress.currentQuestionIndex / 10) * 100) // Assuming 10 questions per quiz
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Quizzes Taken</p>
                <p className="text-2xl font-bold">{user.stats?.totalQuizzes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{user.stats?.averageScore || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Time Spent</p>
                <p className="text-2xl font-bold">{formatTime(user.stats?.totalTimeSpent || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold">{user.stats?.streak || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={onStartQuiz} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start New Quiz
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {savedProgress.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No saved progress yet</p>
              <Button onClick={onStartQuiz}>Start Your First Quiz</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedProgress.map((progress) => (
                <div key={progress.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{progress.quizTitle}</h3>
                      <p className="text-sm text-gray-600">
                        Question {progress.currentQuestionIndex + 1} • {formatTime(progress.timeSpent)} spent
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {progress.isCompleted ? <Badge variant="secondary">Completed</Badge> : <Badge>In Progress</Badge>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{getProgressPercentage(progress)}%</span>
                    </div>
                    <Progress value={getProgressPercentage(progress)} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(progress.updatedAt).toLocaleDateString()}
                    </p>
                    {!progress.isCompleted && (
                      <Button size="sm" onClick={() => onResumeQuiz(progress)}>
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
