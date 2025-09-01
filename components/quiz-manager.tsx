"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Download, Upload } from "lucide-react"
import type { Quiz } from "@/types/quiz"
import { QuizEditor } from "./quiz-editor"

export function QuizManager() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      const response = await fetch("/api/quiz")
      const data = await response.json()
      setQuizzes(data)
    } catch (error) {
      console.error("Error loading quizzes:", error)
    }
  }

  const handleCreateQuiz = () => {
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: "New Quiz",
      description: "",
      questions: [],
      createdAt: new Date().toISOString(),
    }
    setSelectedQuiz(newQuiz)
    setIsEditing(true)
  }

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setIsEditing(true)
  }

  const handleSaveQuiz = async (quiz: Quiz) => {
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      })

      if (response.ok) {
        await loadQuizzes()
        setIsEditing(false)
        setSelectedQuiz(null)
      }
    } catch (error) {
      console.error("Error saving quiz:", error)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return

    try {
      const response = await fetch(`/api/quiz/${quizId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadQuizzes()
      }
    } catch (error) {
      console.error("Error deleting quiz:", error)
    }
  }

  const handleExportQuiz = (quiz: Quiz) => {
    const dataStr = JSON.stringify(quiz, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${quiz.title.replace(/\s+/g, "_")}.json`
    link.click()
  }

  const handleImportQuiz = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const quiz = JSON.parse(e.target?.result as string)
        quiz.id = Date.now().toString()
        quiz.createdAt = new Date().toISOString()
        setSelectedQuiz(quiz)
        setIsEditing(true)
        setShowImport(false)
      } catch (error) {
        alert("Invalid JSON file")
      }
    }
    reader.readAsText(file)
  }

  if (isEditing && selectedQuiz) {
    return (
      <QuizEditor
        quiz={selectedQuiz}
        onSave={handleSaveQuiz}
        onCancel={() => {
          setIsEditing(false)
          setSelectedQuiz(null)
        }}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz Management</h2>
        <div className="flex gap-2">
          <Button onClick={handleCreateQuiz}>
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import JSON
          </Button>
        </div>
      </div>

      {showImport && (
        <Card>
          <CardHeader>
            <CardTitle>Import Quiz from JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input type="file" accept=".json" onChange={handleImportQuiz} />
              <Button variant="outline" onClick={() => setShowImport(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{quiz.title}</CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Questions:</span>
                  <Badge variant="outline">{quiz.questions.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time Limit:</span>
                  <span>{quiz.timeLimit ? `${quiz.timeLimit} min` : "No limit"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Passing Score:</span>
                  <span>{quiz.passingScore ? `${quiz.passingScore}%` : "No requirement"}</span>
                </div>
                <div className="text-xs text-gray-500">Created: {new Date(quiz.createdAt).toLocaleDateString()}</div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditQuiz(quiz)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExportQuiz(quiz)}>
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No quizzes created yet</p>
            <Button onClick={handleCreateQuiz}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Quiz
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
