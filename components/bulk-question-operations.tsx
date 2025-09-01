"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckSquare, Square, Tag, FolderOpen, Settings, Search } from "lucide-react"
import type { Question, QuizSection, QuestionTag, BulkQuestionOperation } from "@/types/quiz"
import { DEFAULT_QUESTION_TAGS } from "@/data/question-tags"

interface BulkQuestionOperationsProps {
  questions: Question[]
  sections: QuizSection[]
  availableTags: QuestionTag[]
  onBulkOperation: (operation: BulkQuestionOperation) => void
}

export function BulkQuestionOperations({
  questions,
  sections,
  availableTags,
  onBulkOperation,
}: BulkQuestionOperationsProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [showOperationsDialog, setShowOperationsDialog] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterSection, setFilterSection] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Operation states
  const [operationType, setOperationType] = useState<BulkQuestionOperation["type"]>("assign-section")
  const [targetSection, setTargetSection] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<string>("")
  const [points, setPoints] = useState<string>("")

  const filteredQuestions = questions.filter((question) => {
    const matchesType = filterType === "all" || question.type === filterType
    const matchesSection = filterSection === "all" || question.sectionId === filterSection
    const matchesSearch =
      searchTerm === "" ||
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesType && matchesSection && matchesSearch
  })

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(filteredQuestions.map((q) => q.id))
    }
  }

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }

  const handleBulkOperation = () => {
    if (selectedQuestions.length === 0) return

    let payload: any = {}

    switch (operationType) {
      case "assign-section":
        payload = { sectionId: targetSection || undefined }
        break
      case "add-tags":
        payload = { tags: selectedTags }
        break
      case "remove-tags":
        payload = { tags: selectedTags }
        break
      case "set-difficulty":
        payload = { difficulty }
        break
      case "set-points":
        payload = { points: Number(points) }
        break
      case "delete":
        payload = {}
        break
    }

    onBulkOperation({
      type: operationType,
      questionIds: selectedQuestions,
      payload,
    })

    setSelectedQuestions([])
    setShowOperationsDialog(false)
  }

  const getSectionName = (sectionId?: string) => {
    if (!sectionId) return "No Section"
    return sections.find((s) => s.id === sectionId)?.title || "Unknown Section"
  }

  const getTagName = (tagId: string) => {
    return (
      availableTags.find((t) => t.id === tagId)?.name ||
      DEFAULT_QUESTION_TAGS.find((t) => t.id === tagId)?.name ||
      tagId
    )
  }

  const getTagColor = (tagId: string) => {
    return (
      availableTags.find((t) => t.id === tagId)?.color ||
      DEFAULT_QUESTION_TAGS.find((t) => t.id === tagId)?.color ||
      "#6B7280"
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Bulk Question Operations
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{selectedQuestions.length} selected</span>
            <Dialog open={showOperationsDialog} onOpenChange={setShowOperationsDialog}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={selectedQuestions.length === 0}>
                  Bulk Actions
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Operations ({selectedQuestions.length} questions)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Operation Type</Label>
                    <Select value={operationType} onValueChange={(value: any) => setOperationType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assign-section">Assign to Section</SelectItem>
                        <SelectItem value="add-tags">Add Tags</SelectItem>
                        <SelectItem value="remove-tags">Remove Tags</SelectItem>
                        <SelectItem value="set-difficulty">Set Difficulty</SelectItem>
                        <SelectItem value="set-points">Set Points</SelectItem>
                        <SelectItem value="delete">Delete Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {operationType === "assign-section" && (
                    <div>
                      <Label>Target Section</Label>
                      <Select value={targetSection} onValueChange={setTargetSection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-section">No Section</SelectItem>
                          {sections.map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(operationType === "add-tags" || operationType === "remove-tags") && (
                    <div>
                      <Label>Tags</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {[...availableTags, ...DEFAULT_QUESTION_TAGS].map((tag) => (
                          <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={tag.id}
                              checked={selectedTags.includes(tag.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTags([...selectedTags, tag.id])
                                } else {
                                  setSelectedTags(selectedTags.filter((t) => t !== tag.id))
                                }
                              }}
                            />
                            <Label htmlFor={tag.id} className="text-sm">
                              {tag.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {operationType === "set-difficulty" && (
                    <div>
                      <Label>Difficulty Level</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {operationType === "set-points" && (
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                        placeholder="Enter points"
                      />
                    </div>
                  )}

                  {operationType === "delete" && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Warning:</strong> This will permanently delete {selectedQuestions.length} questions.
                        This action cannot be undone.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowOperationsDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBulkOperation}
                      variant={operationType === "delete" ? "destructive" : "default"}
                    >
                      Apply Operation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              <SelectItem value="multiple-select">Multiple Select</SelectItem>
              <SelectItem value="true-false">True/False</SelectItem>
              <SelectItem value="fill-blank">Fill Blank</SelectItem>
              <SelectItem value="short-answer">Short Answer</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="matching">Matching</SelectItem>
              <SelectItem value="ordering">Ordering</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              <SelectItem value="no-section">No Section</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select All */}
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleSelectAll} className="flex items-center gap-2">
            {selectedQuestions.length === filteredQuestions.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedQuestions.length === filteredQuestions.length ? "Deselect All" : "Select All"}
          </Button>
          <span className="text-sm text-gray-600">{filteredQuestions.length} questions shown</span>
        </div>

        <Separator className="mb-4" />

        {/* Question List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredQuestions.map((question, index) => (
            <div
              key={question.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedQuestions.includes(question.id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
              }`}
              onClick={() => handleSelectQuestion(question.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedQuestions.includes(question.id)}
                  onChange={() => handleSelectQuestion(question.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">Q{index + 1}</span>
                    <Badge variant="outline" className="text-xs">
                      {question.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {question.points} pts
                    </Badge>
                    {question.difficulty && (
                      <Badge
                        variant={
                          question.difficulty === "easy"
                            ? "secondary"
                            : question.difficulty === "medium"
                              ? "default"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {question.difficulty}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 line-clamp-2 mb-2">{question.question || "Untitled Question"}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" />
                      {getSectionName(question.sectionId)}
                    </div>
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <div className="flex gap-1">
                          {question.tags.slice(0, 3).map((tagId) => (
                            <span
                              key={tagId}
                              className="px-1 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: getTagColor(tagId) + "20",
                                color: getTagColor(tagId),
                              }}
                            >
                              {getTagName(tagId)}
                            </span>
                          ))}
                          {question.tags.length > 3 && (
                            <span className="text-gray-400">+{question.tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No questions found matching your filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
