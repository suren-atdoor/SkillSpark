"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUp, ArrowDown, GripVertical, Hash, BookOpen, AlertCircle } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import type { Question, QuizSection } from "@/types/quiz"

interface QuestionReorderProps {
  questions: Question[]
  sections?: QuizSection[]
  continuousNumbering?: boolean
  onReorderQuestions: (questions: Question[]) => void
  onReorderSections?: (sections: QuizSection[]) => void
}

export function QuestionReorder({
  questions,
  sections = [],
  continuousNumbering = true,
  onReorderQuestions,
  onReorderSections,
}: QuestionReorderProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "sections">("questions")

  const handleQuestionDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order property
    const reorderedQuestions = items.map((question, index) => ({
      ...question,
      order: index,
    }))

    onReorderQuestions(reorderedQuestions)
  }

  const handleSectionDragEnd = (result: any) => {
    if (!result.destination || !onReorderSections) return

    const items = Array.from(sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order property
    const reorderedSections = items.map((section, index) => ({
      ...section,
      order: index,
    }))

    onReorderSections(reorderedSections)
  }

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= questions.length) return

    const items = Array.from(questions)
    const [item] = items.splice(index, 1)
    items.splice(newIndex, 0, item)

    const reorderedQuestions = items.map((question, idx) => ({
      ...question,
      order: idx,
    }))

    onReorderQuestions(reorderedQuestions)
  }

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!onReorderSections) return

    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    const items = Array.from(sections)
    const [item] = items.splice(index, 1)
    items.splice(newIndex, 0, item)

    const reorderedSections = items.map((section, idx) => ({
      ...section,
      order: idx,
    }))

    onReorderSections(reorderedSections)
  }

  const getSectionName = (sectionId?: string) => {
    if (!sectionId) return "No Section"
    return sections.find((s) => s.id === sectionId)?.title || "Unknown Section"
  }

  const getQuestionsBySection = (sectionId?: string) => {
    return questions.filter((q) => q.sectionId === sectionId)
  }

  const getQuestionNumber = (question: Question, globalIndex: number) => {
    if (continuousNumbering) {
      return globalIndex + 1
    }

    // Section-based numbering
    if (question.sectionId) {
      const sectionQuestions = getQuestionsBySection(question.sectionId)
      const sectionIndex = sectionQuestions.findIndex((q) => q.id === question.id)
      return sectionIndex + 1
    }

    // Unassigned questions
    const unassignedQuestions = getQuestionsBySection(undefined)
    const unassignedIndex = unassignedQuestions.findIndex((q) => q.id === question.id)
    return unassignedIndex + 1
  }

  const renderQuestionCard = (question: Question, index: number, isDragging: boolean) => (
    <div className="flex items-center gap-3">
      <div className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => moveQuestion(index, "up")} disabled={index === 0}>
          <ArrowUp className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => moveQuestion(index, "down")}
          disabled={index === questions.length - 1}
        >
          <ArrowDown className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">Q{getQuestionNumber(question, index)}</span>
          <Badge variant="outline" className="text-xs">
            {question.type}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {question.points} pts
          </Badge>
          {question.required && (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Mandatory
            </Badge>
          )}
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
          {question.tags && question.tags.length > 0 && (
            <div className="flex gap-1">
              {question.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {question.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{question.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-900 line-clamp-1 mb-1">{question.question || "Untitled Question"}</p>
        <p className="text-xs text-gray-500">Section: {getSectionName(question.sectionId)}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "questions" | "sections")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Sections ({sections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          {/* Numbering Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Question Numbering:</strong>{" "}
              {continuousNumbering
                ? "Questions are numbered continuously across all sections (1, 2, 3...)"
                : "Questions are numbered within each section (Section 1: 1, 2, 3... Section 2: 1, 2, 3...)"}
            </p>
          </div>

          {sections.length > 0 ? (
            // Group questions by section
            <div className="space-y-6">
              {sections.map((section) => {
                const sectionQuestions = getQuestionsBySection(section.id)
                if (sectionQuestions.length === 0) return null

                return (
                  <Card key={section.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {sectionQuestions.length} questions
                        </Badge>
                      </div>
                      {section.description && <p className="text-sm text-gray-600">{section.description}</p>}
                    </CardHeader>
                    <CardContent>
                      <DragDropContext onDragEnd={handleQuestionDragEnd}>
                        <Droppable droppableId={`section-${section.id}`}>
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                              {sectionQuestions.map((question) => {
                                const globalIndex = questions.findIndex((q) => q.id === question.id)
                                return (
                                  <Draggable key={question.id} draggableId={question.id} index={globalIndex}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`p-4 border rounded-lg ${
                                          snapshot.isDragging ? "shadow-lg bg-blue-50" : "bg-white"
                                        }`}
                                      >
                                        {renderQuestionCard(question, globalIndex, snapshot.isDragging)}
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              })}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Unassigned Questions */}
              {getQuestionsBySection(undefined).length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-lg">Unassigned Questions</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {getQuestionsBySection(undefined).length} questions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DragDropContext onDragEnd={handleQuestionDragEnd}>
                      <Droppable droppableId="unassigned">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {getQuestionsBySection(undefined).map((question) => {
                              const globalIndex = questions.findIndex((q) => q.id === question.id)
                              return (
                                <Draggable key={question.id} draggableId={question.id} index={globalIndex}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-4 border rounded-lg ${
                                        snapshot.isDragging ? "shadow-lg bg-blue-50" : "bg-white"
                                      }`}
                                    >
                                      {renderQuestionCard(question, globalIndex, snapshot.isDragging)}
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // All questions in one list if no sections
            <Card>
              <CardHeader>
                <CardTitle>All Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleQuestionDragEnd}>
                  <Droppable droppableId="questions">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {questions.map((question, index) => (
                          <Draggable key={question.id} draggableId={question.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 border rounded-lg ${
                                  snapshot.isDragging ? "shadow-lg bg-blue-50" : "bg-white"
                                }`}
                              >
                                {renderQuestionCard(question, index, snapshot.isDragging)}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {questions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No questions to reorder.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reorder Sections</CardTitle>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sections to reorder.</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleSectionDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {sections.map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-4 border rounded-lg ${
                                  snapshot.isDragging ? "shadow-lg bg-blue-50" : "bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                    <GripVertical className="h-5 w-5 text-gray-400" />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => moveSection(index, "up")}
                                      disabled={index === 0}
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => moveSection(index, "down")}
                                      disabled={index === sections.length - 1}
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <BookOpen className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium">{section.title}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {getQuestionsBySection(section.id).length} questions
                                      </Badge>
                                      {section.timeLimit && (
                                        <Badge variant="outline" className="text-xs">
                                          {section.timeLimit}m
                                        </Badge>
                                      )}
                                      {section.passingScore && (
                                        <Badge variant="outline" className="text-xs">
                                          {section.passingScore}%
                                        </Badge>
                                      )}
                                    </div>
                                    {section.description && (
                                      <p className="text-sm text-gray-600 line-clamp-1">{section.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
