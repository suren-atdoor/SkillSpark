"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Save, X, Trash2, Shield, AlertTriangle, Camera, Eye, Settings, BookOpen, Hash, Tag } from 'lucide-react'
import type {
  Quiz,
  QuestionType,
  CopyPasteSettings,
  SecurityPreset,
  QuestionSection as QuizSection,
  Question,
  BulkQuestionOperation,
  QuestionTag,
} from "@/types/quiz"
import { SecurityPresetSelector } from "./security-preset-selector"
import { SectionManager } from "./section-manager"
import { QuestionReorder } from "./question-reorder"
import { AdaptiveTimingConfig } from "./adaptive-timing-config"
import { SectionDependencyManager } from "./section-dependency-manager"
import { BulkQuestionOperations } from "./bulk-question-operations"
import { QuestionTagManager } from "./question-tag-manager"

interface QuizEditorProps {
  quiz: Quiz
  onSave: (quiz: Quiz) => void
  onCancel: () => void
}

export function QuizEditor({ quiz, onSave, onCancel }: QuizEditorProps) {
  const [editedQuiz, setEditedQuiz] = useState<Quiz>(quiz)
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [securityTab, setSecurityTab] = useState<"presets" | "custom">("presets")
  const [showSectionManager, setShowSectionManager] = useState(false)
  const [showQuestionReorder, setShowQuestionReorder] = useState(false)
  const [showBulkOperations, setShowBulkOperations] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)

  const handleQuizChange = (field: keyof Quiz, value: any) => {
    setEditedQuiz((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCopyPasteSettingsChange = (field: keyof CopyPasteSettings, value: any) => {
    setEditedQuiz((prev) => ({
      ...prev,
      copyPasteSettings: {
        ...prev.copyPasteSettings,
        [field]: value,
      } as CopyPasteSettings,
    }))
  }

  const handlePresetSelect = (preset: SecurityPreset) => {
    setEditedQuiz((prev) => ({
      ...prev,
      copyPasteSettings: preset.settings,
      timeLimit: preset.timeLimit || prev.timeLimit,
      passingScore: preset.passingScore || prev.passingScore,
      shuffleQuestions: preset.shuffleQuestions ?? prev.shuffleQuestions,
    }))
    setSecurityTab("custom") // Switch to custom tab to show applied settings
  }

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: "",
      points: 1,
      ...getDefaultQuestionData(type),
    }

    setEditedQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))
    setSelectedQuestion(editedQuiz.questions.length)
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setEditedQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    }))
  }

  const handleDeleteQuestion = (index: number) => {
    setEditedQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
    setSelectedQuestion(null)
  }

  const getDefaultQuestionData = (type: QuestionType) => {
    switch (type) {
      case "multiple-choice":
        return { options: ["Option 1", "Option 2"], correctAnswer: 0 }
      case "multiple-select":
        return { options: ["Option 1", "Option 2"], correctAnswers: [0] }
      case "true-false":
        return { correctAnswer: true }
      case "fill-blank":
        return { correctAnswers: [""], caseSensitive: false }
      case "short-answer":
        return { maxLength: 500, keywords: [] }
      case "essay":
        return { minWords: 50, maxWords: 1000 }
      case "matching":
        return {
          leftItems: ["Item 1", "Item 2"],
          rightItems: ["Match 1", "Match 2"],
          correctMatches: { 0: 0, 1: 1 },
        }
      case "ordering":
        return { items: ["First", "Second", "Third"], correctOrder: [0, 1, 2] }
      default:
        return {}
    }
  }

  const renderQuestionEditor = (question: Question, index: number) => {
    const updateQuestion = (field: string, value: any) => {
      handleQuestionChange(index, field, value)
    }

    return (
      <Card key={question.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Question {index + 1}</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedQuestion === index ? "default" : "outline"}
                onClick={() => setSelectedQuestion(selectedQuestion === index ? null : index)}
              >
                {selectedQuestion === index ? "Collapse" : "Edit"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDeleteQuestion(index)} className="text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {selectedQuestion === index && (
          <CardContent className="space-y-4">
            <div>
              <Label>Question Text</Label>
              <Textarea
                value={question.question}
                onChange={(e) => updateQuestion("question", e.target.value)}
                placeholder="Enter your question"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Points</Label>
                <Input
                  type="number"
                  value={question.points}
                  onChange={(e) => updateQuestion("points", Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label>Question Type</Label>
                <Select value={question.type} onValueChange={(value) => updateQuestion("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="multiple-select">Multiple Select</SelectItem>
                    <SelectItem value="true-false">True/False</SelectItem>
                    <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="matching">Matching</SelectItem>
                    <SelectItem value="ordering">Ordering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderQuestionTypeEditor(question, updateQuestion)}

            {/* Answer shuffling and mandatory options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              {(question.type === "multiple-choice" || question.type === "multiple-select") && (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={question.shuffleAnswers || false}
                    onCheckedChange={(checked) => updateQuestion("shuffleAnswers", checked)}
                  />
                  <Label>Shuffle Answer Options</Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  checked={question.required || false}
                  onCheckedChange={(checked) => updateQuestion("required", checked)}
                />
                <Label>Mandatory Question</Label>
              </div>
            </div>

            <div>
              <Label>Explanation (Optional)</Label>
              <Textarea
                value={question.explanation || ""}
                onChange={(e) => updateQuestion("explanation", e.target.value)}
                placeholder="Provide an explanation for this question"
              />
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  const renderQuestionTypeEditor = (question: any, updateQuestion: (field: string, value: any) => void) => {
    switch (question.type) {
      case "multiple-choice":
      case "multiple-select":
        return (
          <div className="space-y-2">
            <Label>Options</Label>
            {question.options.map((option: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options]
                    newOptions[index] = e.target.value
                    updateQuestion("options", newOptions)
                  }}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newOptions = question.options.filter((_: any, i: number) => i !== index)
                    updateQuestion("options", newOptions)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateQuestion("options", [...question.options, `Option ${question.options.length + 1}`])}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
            <div>
              <Label>Correct Answer(s)</Label>
              <Input
                value={question.type === "multiple-choice" ? question.correctAnswer : question.correctAnswers.join(",")}
                onChange={(e) => {
                  if (question.type === "multiple-choice") {
                    updateQuestion("correctAnswer", Number.parseInt(e.target.value) || 0)
                  } else {
                    updateQuestion(
                      "correctAnswers",
                      e.target.value
                        .split(",")
                        .map((n) => Number.parseInt(n.trim()))
                        .filter((n) => !isNaN(n)),
                    )
                  }
                }}
                placeholder={question.type === "multiple-choice" ? "0" : "0,1,2"}
              />
            </div>
          </div>
        )

      case "true-false":
        return (
          <div>
            <Label>Correct Answer</Label>
            <Select
              value={question.correctAnswer.toString()}
              onValueChange={(value) => updateQuestion("correctAnswer", value === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case "fill-blank":
        return (
          <div className="space-y-2">
            <Label>Correct Answers (one per line)</Label>
            <Textarea
              value={question.correctAnswers.join("\n")}
              onChange={(e) =>
                updateQuestion(
                  "correctAnswers",
                  e.target.value.split("\n").filter((a) => a.trim()),
                )
              }
              placeholder="Enter possible correct answers"
            />
            <div className="flex items-center space-x-2">
              <Switch
                checked={question.caseSensitive}
                onCheckedChange={(checked) => updateQuestion("caseSensitive", checked)}
              />
              <Label>Case Sensitive</Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const handleSectionsUpdate = (sections: QuizSection[]) => {
    setEditedQuiz((prev) => ({
      ...prev,
      sections,
    }))
  }

  const handleQuestionsReorder = (questions: Question[]) => {
    setEditedQuiz((prev) => ({
      ...prev,
      questions,
    }))
  }

  const handleBulkOperation = (operation: BulkQuestionOperation) => {
    let updatedQuestions = [...editedQuiz.questions]

    switch (operation.type) {
      case "assign-section":
        updatedQuestions = updatedQuestions.map((q) =>
          operation.questionIds.includes(q.id) ? { ...q, sectionId: operation.payload.sectionId } : q,
        )
        break
      case "add-tags":
        updatedQuestions = updatedQuestions.map((q) =>
          operation.questionIds.includes(q.id) ? { ...q, tags: [...(q.tags || []), ...operation.payload.tags] } : q,
        )
        break
      case "remove-tags":
        updatedQuestions = updatedQuestions.map((q) =>
          operation.questionIds.includes(q.id)
            ? { ...q, tags: (q.tags || []).filter((tag) => !operation.payload.tags.includes(tag)) }
            : q,
        )
        break
      case "set-difficulty":
        updatedQuestions = updatedQuestions.map((q) =>
          operation.questionIds.includes(q.id) ? { ...q, difficulty: operation.payload.difficulty } : q,
        )
        break
      case "set-points":
        updatedQuestions = updatedQuestions.map((q) =>
          operation.questionIds.includes(q.id) ? { ...q, points: operation.payload.points } : q,
        )
        break
      case "delete":
        updatedQuestions = updatedQuestions.filter((q) => !operation.questionIds.includes(q.id))
        break
    }

    setEditedQuiz((prev) => ({ ...prev, questions: updatedQuestions }))
  }

  const handleUpdateTags = (tags: QuestionTag[]) => {
    setEditedQuiz((prev) => ({ ...prev, availableTags: tags }))
  }

  // Initialize copy-paste settings if not present
  const copyPasteSettings = editedQuiz.copyPasteSettings || {
    allowCopyPaste: true,
    showCopyStatusInResults: false,
    maxViolations: 3,
    violationAction: "warning",
    warningMessage: "Copy-paste detected. Please answer in your own words.",
    allowScreenshots: true,
    screenshotDetection: false,
    showScreenshotStatusInResults: false,
    maxScreenshotViolations: 2,
    screenshotViolationAction: "warning",
    screenshotWarningMessage: "Screenshot attempt detected. This action is not allowed during the quiz.",
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Quiz Title</Label>
            <Input
              value={editedQuiz.title}
              onChange={(e) => handleQuizChange("title", e.target.value)}
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={editedQuiz.description}
              onChange={(e) => handleQuizChange("description", e.target.value)}
              placeholder="Enter quiz description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Time Limit (minutes)</Label>
              <Input
                type="number"
                value={editedQuiz.timeLimit || ""}
                onChange={(e) =>
                  handleQuizChange("timeLimit", e.target.value ? Number.parseInt(e.target.value) : undefined)
                }
                placeholder="No limit"
              />
            </div>

            <div>
              <Label>Passing Score (%)</Label>
              <Input
                type="number"
                value={editedQuiz.passingScore || ""}
                onChange={(e) =>
                  handleQuizChange("passingScore", e.target.value ? Number.parseInt(e.target.value) : undefined)
                }
                placeholder="No requirement"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={editedQuiz.shuffleQuestions}
                onCheckedChange={(checked) => handleQuizChange("shuffleQuestions", checked)}
              />
              <Label>Shuffle Questions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editedQuiz.shuffleAnswers}
                onCheckedChange={(checked) => handleQuizChange("shuffleAnswers", checked)}
              />
              <Label>Shuffle Answer Options</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={editedQuiz.sectionBasedScoring}
                onCheckedChange={(checked) => handleQuizChange("sectionBasedScoring", checked)}
              />
              <Label>Section-Based Scoring</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={editedQuiz.sectionBasedTiming}
                onCheckedChange={(checked) => handleQuizChange("sectionBasedTiming", checked)}
              />
              <Label>Section-Based Timing</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={editedQuiz.allowSectionNavigation}
                onCheckedChange={(checked) => handleQuizChange("allowSectionNavigation", checked)}
              />
              <Label>Allow Section Navigation</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={editedQuiz.continuousNumbering !== false}
                onCheckedChange={(checked) => handleQuizChange("continuousNumbering", checked)}
              />
              <Label>Continuous Question Numbering</Label>
            </div>
          </div>
          <AdaptiveTimingConfig
            settings={
              editedQuiz.adaptiveTimingSettings || {
                enabled: false,
                baseTimePerQuestion: 120,
                difficultyMultipliers: { easy: 0.8, medium: 1.0, hard: 1.5 },
                performanceAdjustment: false,
                minTimePerQuestion: 30,
                maxTimePerQuestion: 600,
              }
            }
            onUpdate={(settings) => handleQuizChange("adaptiveTimingSettings", settings)}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setShowSectionManager(true)} className="flex-1">
          <BookOpen className="h-4 w-4 mr-2" />
          Manage Sections ({editedQuiz.sections?.length || 0})
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowQuestionReorder(true)} 
          className="flex-1"
          disabled={editedQuiz.questions.length === 0}
        >
          <Hash className="h-4 w-4 mr-2" />
          Reorder Questions
        </Button>
        <Button variant="outline" onClick={() => setShowBulkOperations(true)} className="flex-1">
          <Settings className="h-4 w-4 mr-2" />
          Bulk Operations
        </Button>
        <Button variant="outline" onClick={() => setShowTagManager(true)} className="flex-1">
          <Tag className="h-4 w-4 mr-2" />
          Manage Tags
        </Button>
      </div>

      <SectionDependencyManager
        sections={editedQuiz.sections || []}
        dependencies={editedQuiz.sectionDependencies || []}
        onUpdateDependencies={(deps) => handleQuizChange("sectionDependencies", deps)}
      />

      {/* Security Settings with Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security & Anti-Cheating Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={securityTab} onValueChange={(value) => setSecurityTab(value as "presets" | "custom")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Presets
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Custom Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="mt-6">
              <SecurityPresetSelector
                onSelectPreset={handlePresetSelect}
                currentSettings={copyPasteSettings}
                timeLimit={editedQuiz.timeLimit}
                passingScore={editedQuiz.passingScore}
                shuffleQuestions={editedQuiz.shuffleQuestions}
              />
            </TabsContent>

            <TabsContent value="custom" className="mt-6">
              <div className="space-y-6">
                {/* Copy-Paste Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <h3 className="text-lg font-semibold">Copy-Paste Control</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={copyPasteSettings.allowCopyPaste}
                      onCheckedChange={(checked) => {
                        handleCopyPasteSettingsChange("allowCopyPaste", checked)
                        if (!checked) {
                          handleCopyPasteSettingsChange("showCopyStatusInResults", true)
                        }
                      }}
                    />
                    <Label>Allow Copy-Paste</Label>
                  </div>

                  {copyPasteSettings.allowCopyPaste && (
                    <div className="ml-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">Copy-Paste Allowed</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Students can copy and paste content. This will be noted if tracking is enabled.
                      </p>
                    </div>
                  )}

                  {!copyPasteSettings.allowCopyPaste && (
                    <div className="ml-6 space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Copy-Paste Restricted</span>
                        </div>
                        <p className="text-sm text-red-700">
                          Copy-paste operations will be detected and restricted during the quiz.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Maximum Violations</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={copyPasteSettings.maxViolations}
                            onChange={(e) =>
                              handleCopyPasteSettingsChange("maxViolations", Number.parseInt(e.target.value) || 3)
                            }
                          />
                        </div>

                        <div>
                          <Label>Violation Action</Label>
                          <Select
                            value={copyPasteSettings.violationAction}
                            onValueChange={(value) => handleCopyPasteSettingsChange("violationAction", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="warning">Show Warning Only</SelectItem>
                              <SelectItem value="end-exam">End Exam</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Warning Message</Label>
                        <Textarea
                          value={copyPasteSettings.warningMessage || ""}
                          onChange={(e) => handleCopyPasteSettingsChange("warningMessage", e.target.value)}
                          placeholder="Custom warning message for copy-paste violations"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={copyPasteSettings.showCopyStatusInResults}
                      onCheckedChange={(checked) => handleCopyPasteSettingsChange("showCopyStatusInResults", checked)}
                    />
                    <Label>Show Copy-Paste Status in Results</Label>
                  </div>
                </div>

                {/* Screenshot Settings */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-purple-600" />
                    <h3 className="text-lg font-semibold">Screenshot Control</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={copyPasteSettings.allowScreenshots}
                      onCheckedChange={(checked) => {
                        handleCopyPasteSettingsChange("allowScreenshots", checked)
                        if (!checked) {
                          handleCopyPasteSettingsChange("screenshotDetection", true)
                          handleCopyPasteSettingsChange("showScreenshotStatusInResults", true)
                        }
                      }}
                    />
                    <Label>Allow Screenshots</Label>
                  </div>

                  {copyPasteSettings.allowScreenshots && (
                    <div className="ml-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">Screenshots Allowed</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Students can take screenshots. This will be noted if detection is enabled.
                      </p>
                    </div>
                  )}

                  {!copyPasteSettings.allowScreenshots && (
                    <div className="ml-6 space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Screenshots Restricted</span>
                        </div>
                        <p className="text-sm text-red-700">
                          Screenshot attempts will be detected and prevented during the quiz.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Maximum Screenshot Violations</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={copyPasteSettings.maxScreenshotViolations}
                            onChange={(e) =>
                              handleCopyPasteSettingsChange(
                                "maxScreenshotViolations",
                                Number.parseInt(e.target.value) || 2,
                              )
                            }
                          />
                        </div>

                        <div>
                          <Label>Screenshot Violation Action</Label>
                          <Select
                            value={copyPasteSettings.screenshotViolationAction}
                            onValueChange={(value) => handleCopyPasteSettingsChange("screenshotViolationAction", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="warning">Show Warning Only</SelectItem>
                              <SelectItem value="end-exam">End Exam</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Screenshot Warning Message</Label>
                        <Textarea
                          value={copyPasteSettings.screenshotWarningMessage || ""}
                          onChange={(e) => handleCopyPasteSettingsChange("screenshotWarningMessage", e.target.value)}
                          placeholder="Custom warning message for screenshot violations"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={copyPasteSettings.screenshotDetection}
                      onCheckedChange={(checked) => handleCopyPasteSettingsChange("screenshotDetection", checked)}
                    />
                    <Label>Enable Screenshot Detection</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={copyPasteSettings.showScreenshotStatusInResults}
                      onCheckedChange={(checked) =>
                        handleCopyPasteSettingsChange("showScreenshotStatusInResults", checked)
                      }
                    />
                    <Label>Show Screenshot Status in Results</Label>
                  </div>

                  {copyPasteSettings.screenshotDetection && (
                    <div className="ml-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Detection Methods:</strong> Print Screen key, Snipping Tool, browser shortcuts
                        (Ctrl+Shift+S), and system screenshot APIs will be monitored.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Questions ({editedQuiz.questions.length})</CardTitle>
            <Select onValueChange={(value) => handleAddQuestion(value as QuestionType)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Add Question" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="multiple-select">Multiple Select</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
                <SelectItem value="matching">Matching</SelectItem>
                <SelectItem value="ordering">Ordering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {editedQuiz.questions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No questions added yet. Use the dropdown above to add questions.
            </p>
          ) : (
            editedQuiz.questions.map((question, index) => renderQuestionEditor(question, index))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            onSave({
              ...editedQuiz,
              copyPasteSettings,
            })
          }
        >
          <Save className="h-4 w-4 mr-2" />
          Save Quiz
        </Button>
      </div>
      {showSectionManager && (
        <Dialog open={showSectionManager} onOpenChange={setShowSectionManager}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Section & Reorder Management</DialogTitle>
            </DialogHeader>
            <SectionManager
              sections={editedQuiz.sections || []}
              questions={editedQuiz.questions}
              onUpdateSections={handleSectionsUpdate}
              onUpdateQuestions={handleQuestionsReorder}
            />
          </DialogContent>
        </Dialog>
      )}

      {showQuestionReorder && (
        <Dialog open={showQuestionReorder} onOpenChange={setShowQuestionReorder}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reorder Questions & Sections</DialogTitle>
            </DialogHeader>
            <QuestionReorder
              questions={editedQuiz.questions}
              sections={editedQuiz.sections}
              onReorderQuestions={handleQuestionsReorder}
              onReorderSections={handleSectionsUpdate}
            />
          </DialogContent>
        </Dialog>
      )}

      {showBulkOperations && (
        <Dialog open={showBulkOperations} onOpenChange={setShowBulkOperations}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Question Operations</DialogTitle>
            </DialogHeader>
            <BulkQuestionOperations
              questions={editedQuiz.questions}
              sections={editedQuiz.sections || []}
              availableTags={editedQuiz.availableTags || []}
              onBulkOperation={handleBulkOperation}
            />
          </DialogContent>
        </Dialog>
      )}

      {showTagManager && (
        <Dialog open={showTagManager} onOpenChange={setShowTagManager}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Question Tag Manager</DialogTitle>
            </DialogHeader>
            <QuestionTagManager customTags={editedQuiz.availableTags || []} onUpdateTags={handleUpdateTags} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
