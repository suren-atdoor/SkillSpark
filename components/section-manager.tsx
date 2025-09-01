"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Clock, Target, Users, Settings, BookOpen, ArrowUp, ArrowDown, GripVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import type { QuizSection, Question } from "@/types/quiz"
import { SectionTemplateSelector } from "./section-template-selector"

interface SectionManagerProps {
  sections: QuizSection[]
  questions: Question[]
  onUpdateSections: (sections: QuizSection[]) => void
  onUpdateQuestions: (questions: Question[]) => void
}

export function SectionManager({ sections, questions, onUpdateSections, onUpdateQuestions }: SectionManagerProps) {
  const [editingSection, setEditingSection] = useState<QuizSection | null>(null)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"manage" | "reorder">("manage")
  const [newSection, setNewSection] = useState<Partial<QuizSection>>({
    title: "",
    description: "",
    timeLimit: undefined,
    passingScore: undefined,
    showResults: false,
    allowReview: true,
    questions: [],
  })

  const handleCreateSection = () => {
    if (!newSection.title) return

    const section: QuizSection = {
      id: `section-${Date.now()}`,
      title: newSection.title,
      description: newSection.description || "",
      timeLimit: newSection.timeLimit,
      passingScore: newSection.passingScore,
      order: sections.length,
      questions: [],
      showResults: newSection.showResults || false,
      allowReview: newSection.allowReview !== false,
    }

    onUpdateSections([...sections, section])
    setNewSection({
      title: "",
      description: "",
      timeLimit: undefined,
      passingScore: undefined,
      showResults: false,
      allowReview: true,
      questions: [],
    })
    setShowSectionDialog(false)
  }

  const handleUpdateSection = (sectionId: string, updates: Partial<QuizSection>) => {
    const updatedSections = sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section))
    onUpdateSections(updatedSections)
  }

  const handleDeleteSection = (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section? Questions will be moved to 'No Section'.")) return

    // Remove section
    const updatedSections = sections.filter((section) => section.id !== sectionId)

    // Update questions to remove section assignment
    const updatedQuestions = questions.map((question) =>
      question.sectionId === sectionId ? { ...question, sectionId: undefined } : question,
    )

    onUpdateSections(updatedSections)
    onUpdateQuestions(updatedQuestions)
  }

  const handleAssignQuestionToSection = (questionId: string, sectionId: string | undefined) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, sectionId } : question,
    )

    // Update section question lists
    const updatedSections = sections.map((section) => ({
      ...section,
      questions: updatedQuestions.filter((q) => q.sectionId === section.id).map((q) => q.id),
    }))

    onUpdateQuestions(updatedQuestions)
    onUpdateSections(updatedSections)
  }

  // Section reordering functions
  const handleSectionDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const reorderedSections = items.map((section, index) => ({
      ...section,
      order: index,
    }))

    onUpdateSections(reorderedSections)
  }

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    const items = Array.from(sections)
    const [item] = items.splice(index, 1)
    items.splice(newIndex, 0, item)

    const reorderedSections = items.map((section, idx) => ({
      ...section,
      order: idx,
    }))

    onUpdateSections(reorderedSections)
  }

  const getUnassignedQuestions = () => {
    return questions.filter((question) => !question.sectionId)
  }

  const getSectionQuestions = (sectionId: string) => {
    return questions.filter((question) => question.sectionId === sectionId)
  }

  const getSectionStats = (section: QuizSection) => {
    const sectionQuestions = getSectionQuestions(section.id)
    const totalPoints = sectionQuestions.reduce((sum, q) => sum + q.points, 0)
    return {
      questionCount: sectionQuestions.length,
      totalPoints,
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "manage" | "reorder")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage Sections
          </TabsTrigger>
          <TabsTrigger value="reorder" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Reorder Sections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Section Management</h3>
              <p className="text-sm text-gray-600">Organize questions into sections with individual settings</p>
            </div>
            <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Section</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <SectionTemplateSelector
                    onSelectTemplate={(template) => {
                      setNewSection({
                        ...newSection,
                        title: template.name,
                        description: template.description,
                        timeLimit: template.defaultTimeLimit,
                        passingScore: template.defaultPassingScore,
                        tags: template.tags,
                      })
                    }}
                  />
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={newSection.title || ""}
                      onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                      placeholder="e.g., Mathematics, Reading Comprehension"
                    />
                  </div>
                  <div>
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={newSection.description || ""}
                      onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                      placeholder="Describe what this section covers..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Time Limit (minutes)</Label>
                      <Input
                        type="number"
                        value={newSection.timeLimit || ""}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            timeLimit: e.target.value ? Number.parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="No limit"
                      />
                    </div>
                    <div>
                      <Label>Passing Score (%)</Label>
                      <Input
                        type="number"
                        value={newSection.passingScore || ""}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            passingScore: e.target.value ? Number.parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="No requirement"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newSection.showResults || false}
                      onCheckedChange={(checked) => setNewSection({ ...newSection, showResults: checked })}
                    />
                    <Label>Show results after section completion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newSection.allowReview !== false}
                      onCheckedChange={(checked) => setNewSection({ ...newSection, allowReview: checked })}
                    />
                    <Label>Allow reviewing questions in this section</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSection}>Create Section</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            {sections.map((section) => {
              const stats = getSectionStats(section)
              return (
                <Card key={section.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {section.title}
                        </CardTitle>
                        {section.description && <p className="text-sm text-gray-600 mt-1">{section.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingSection(section)
                            setShowSectionDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSection(section.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{stats.questionCount} questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{stats.totalPoints} points</span>
                      </div>
                      {section.timeLimit && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{section.timeLimit} minutes</span>
                        </div>
                      )}
                      {section.passingScore && (
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{section.passingScore}% required</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {section.showResults && <Badge variant="secondary">Show Results</Badge>}
                      {section.allowReview && <Badge variant="secondary">Allow Review</Badge>}
                      {section.timeLimit && <Badge variant="outline">Timed</Badge>}
                      {section.passingScore && <Badge variant="outline">Passing Score Required</Badge>}
                    </div>

                    {/* Section Questions */}
                    <div>
                      <h4 className="font-medium mb-2">Questions in this section:</h4>
                      {getSectionQuestions(section.id).length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No questions assigned to this section</p>
                      ) : (
                        <div className="space-y-2">
                          {getSectionQuestions(section.id).map((question, index) => (
                            <div key={question.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Q{index + 1}.</span>
                                <span className="text-sm">{question.question || "Untitled Question"}</span>
                                <Badge variant="outline" className="text-xs">
                                  {question.type}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {question.points} pts
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAssignQuestionToSection(question.id, undefined)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Unassigned Questions */}
          {getUnassignedQuestions().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Unassigned Questions ({getUnassignedQuestions().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getUnassignedQuestions().map((question, index) => (
                    <div key={question.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Q{index + 1}.</span>
                        <span className="text-sm">{question.question || "Untitled Question"}</span>
                        <Badge variant="outline" className="text-xs">
                          {question.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {question.points} pts
                        </Badge>
                      </div>
                      <Select onValueChange={(sectionId) => handleAssignQuestionToSection(question.id, sectionId)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Assign to section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reorder Sections</CardTitle>
              <p className="text-sm text-gray-600">Drag and drop sections to change their order</p>
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
                                        {getSectionQuestions(section.id).length} questions
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

      {/* Edit Section Dialog */}
      {editingSection && (
        <Dialog
          open={showSectionDialog && editingSection !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSection(null)
              setShowSectionDialog(false)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Section: {editingSection.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Section Title</Label>
                <Input
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingSection.description || ""}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={editingSection.timeLimit || ""}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        timeLimit: e.target.value ? Number.parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    value={editingSection.passingScore || ""}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        passingScore: e.target.value ? Number.parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingSection.showResults || false}
                  onCheckedChange={(checked) => setEditingSection({ ...editingSection, showResults: checked })}
                />
                <Label>Show results after section completion</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingSection.allowReview !== false}
                  onCheckedChange={(checked) => setEditingSection({ ...editingSection, allowReview: checked })}
                />
                <Label>Allow reviewing questions in this section</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingSection(null)
                    setShowSectionDialog(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpdateSection(editingSection.id, editingSection)
                    setEditingSection(null)
                    setShowSectionDialog(false)
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
