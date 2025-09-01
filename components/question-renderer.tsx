"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { Question } from "@/types/quiz"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { AlertCircle } from "lucide-react"

interface QuestionRendererProps {
  question: Question
  answer: any
  onAnswerChange: (answer: any) => void
  copyPasteRestricted?: boolean
  screenshotRestricted?: boolean
}

const shuffleArray = (array: any[], seed?: string) => {
  if (!seed) return array

  // Simple seeded shuffle to ensure consistent order for same user
  const shuffled = [...array]
  let currentIndex = shuffled.length
  let randomIndex

  // Use seed to generate consistent random numbers
  let seedNum = 0
  for (let i = 0; i < seed.length; i++) {
    seedNum += seed.charCodeAt(i)
  }

  const seededRandom = () => {
    seedNum = (seedNum * 9301 + 49297) % 233280
    return seedNum / 233280
  }

  while (currentIndex !== 0) {
    randomIndex = Math.floor(seededRandom() * currentIndex)
    currentIndex--
    ;[shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]]
  }

  return shuffled
}

export function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
  copyPasteRestricted = false,
  screenshotRestricted = false,
}: QuestionRendererProps) {
  const q = question as any
  const initialItems = answer || q.items.map((_: any, index: number) => index)
  const [items, setItems] = useState(initialItems)

  const renderMultipleChoice = () => {
    const q = question as any
    let options = q.options
    let correctAnswerIndex = q.correctAnswer

    // Shuffle answers if enabled
    if (question.shuffleAnswers) {
      const originalIndices = options.map((_: any, index: number) => index)
      const shuffledIndices = shuffleArray(originalIndices, `${question.id}-shuffle`)
      options = shuffledIndices.map((index: number) => q.options[index])

      // Update correct answer index to match shuffled position
      correctAnswerIndex = shuffledIndices.indexOf(q.correctAnswer)
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        {question.shuffleAnswers && (
          <div className="text-xs text-blue-600 mb-2">ℹ️ Answer options are shuffled for this question</div>
        )}
        <RadioGroup value={answer?.toString()} onValueChange={(value) => onAnswerChange(Number.parseInt(value))}>
          {options.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    )
  }

  const renderMultipleSelect = () => {
    const q = question as any
    let options = q.options
    let correctAnswers = q.correctAnswers

    // Shuffle answers if enabled
    if (question.shuffleAnswers) {
      const originalIndices = options.map((_: any, index: number) => index)
      const shuffledIndices = shuffleArray(originalIndices, `${question.id}-shuffle`)
      options = shuffledIndices.map((index: number) => q.options[index])

      // Update correct answer indices to match shuffled positions
      correctAnswers = q.correctAnswers.map((originalIndex: number) => shuffledIndices.indexOf(originalIndex))
    }

    const selectedAnswers = answer || []

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        {question.shuffleAnswers && (
          <div className="text-xs text-blue-600 mb-2">ℹ️ Answer options are shuffled for this question</div>
        )}
        <div className="space-y-2">
          {options.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${index}`}
                checked={selectedAnswers.includes(index)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onAnswerChange([...selectedAnswers, index])
                  } else {
                    onAnswerChange(selectedAnswers.filter((i: number) => i !== index))
                  }
                }}
              />
              <Label htmlFor={`option-${index}`} className="cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTrueFalse = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        <RadioGroup value={answer?.toString()} onValueChange={(value) => onAnswerChange(value === "true")}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="true" />
            <Label htmlFor="true" className="cursor-pointer">
              True
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="false" />
            <Label htmlFor="false" className="cursor-pointer">
              False
            </Label>
          </div>
        </RadioGroup>
      </div>
    )
  }

  const renderFillBlank = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        <Input
          placeholder="Enter your answer"
          value={answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          onPaste={copyPasteRestricted ? (e) => e.preventDefault() : undefined}
        />
        {(copyPasteRestricted || screenshotRestricted) && (
          <div className="text-xs space-y-1">
            {copyPasteRestricted && <p className="text-red-600">Copy-paste is disabled for this quiz</p>}
            {screenshotRestricted && <p className="text-orange-600">Screenshots are not allowed during this quiz</p>}
          </div>
        )}
      </div>
    )
  }

  const renderShortAnswer = () => {
    const q = question as any
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        <Textarea
          placeholder="Enter your answer"
          value={answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          maxLength={q.maxLength}
          onPaste={copyPasteRestricted ? (e) => e.preventDefault() : undefined}
        />
        {q.maxLength && (
          <div className="text-sm text-gray-500">
            {(answer || "").length} / {q.maxLength} characters
          </div>
        )}
        {(copyPasteRestricted || screenshotRestricted) && (
          <div className="text-xs space-y-1">
            {copyPasteRestricted && <p className="text-red-600">Copy-paste is disabled for this quiz</p>}
            {screenshotRestricted && <p className="text-orange-600">Screenshots are not allowed during this quiz</p>}
          </div>
        )}
      </div>
    )
  }

  const renderEssay = () => {
    const q = question as any
    const wordCount = (answer || "").split(/\s+/).filter((word: string) => word.length > 0).length

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        <Textarea
          placeholder="Write your essay here..."
          value={answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="min-h-[200px]"
          onPaste={copyPasteRestricted ? (e) => e.preventDefault() : undefined}
        />
        <div className="text-sm text-gray-500">
          Word count: {wordCount}
          {q.minWords && ` (minimum: ${q.minWords})`}
          {q.maxWords && ` (maximum: ${q.maxWords})`}
        </div>
        {(copyPasteRestricted || screenshotRestricted) && (
          <div className="text-xs space-y-1">
            {copyPasteRestricted && <p className="text-red-600">Copy-paste is disabled for this quiz</p>}
            {screenshotRestricted && <p className="text-orange-600">Screenshots are not allowed during this quiz</p>}
          </div>
        )}
      </div>
    )
  }

  const renderMatching = () => {
    const q = question as any
    const matches = answer || {}

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Items to Match</h4>
            <div className="space-y-2">
              {q.leftItems.map((item: string, index: number) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <span>{item}</span>
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Match With</h4>
            <div className="space-y-2">
              {q.rightItems.map((item: string, rightIndex: number) => (
                <Card key={rightIndex} className="p-3">
                  <div className="flex items-center justify-between">
                    <span>{item}</span>
                    <Input
                      type="number"
                      placeholder="#"
                      className="w-16 h-8"
                      min="1"
                      max={q.leftItems.length}
                      value={
                        Object.keys(matches).find((leftIndex) => matches[leftIndex] === rightIndex)
                          ? (
                              Number.parseInt(
                                Object.keys(matches).find((leftIndex) => matches[leftIndex] === rightIndex)!,
                              ) + 1
                            ).toString()
                          : ""
                      }
                      onChange={(e) => {
                        const newMatches = { ...matches }

                        // Remove any existing match for this right item
                        Object.keys(newMatches).forEach((leftIndex) => {
                          if (newMatches[leftIndex] === rightIndex) {
                            delete newMatches[leftIndex]
                          }
                        })

                        // Add new match if value is provided and valid
                        if (
                          e.target.value &&
                          Number.parseInt(e.target.value) >= 1 &&
                          Number.parseInt(e.target.value) <= q.leftItems.length
                        ) {
                          const leftIndex = Number.parseInt(e.target.value) - 1 // Convert to 0-based index

                          // Remove any existing match for this left item
                          Object.keys(newMatches).forEach((existingLeftIndex) => {
                            if (Number.parseInt(existingLeftIndex) === leftIndex) {
                              delete newMatches[existingLeftIndex]
                            }
                          })

                          newMatches[leftIndex] = rightIndex
                        }

                        onAnswerChange(newMatches)
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Enter the number (1-{q.leftItems.length}) of the item you want to match with each option.
        </div>
      </div>
    )
  }

  const renderOrdering = () => {
    const handleDragEnd = (result: any) => {
      if (!result.destination) return

      const newItems = Array.from(items)
      const [reorderedItem] = newItems.splice(result.source.index, 1)
      newItems.splice(result.destination.index, 0, reorderedItem)

      setItems(newItems)
      onAnswerChange(newItems)
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        <p className="text-sm text-gray-600 mb-4">Drag and drop to reorder the items</p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="ordering">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {items.map((itemIndex: number, index: number) => (
                  <Draggable key={itemIndex} draggableId={itemIndex.toString()} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 cursor-move ${snapshot.isDragging ? "shadow-lg" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{q.items[itemIndex]}</span>
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    )
  }

  const renderQuestion = () => {
    switch (question.type) {
      case "multiple-choice":
        return renderMultipleChoice()
      case "multiple-select":
        return renderMultipleSelect()
      case "true-false":
        return renderTrueFalse()
      case "fill-blank":
        return renderFillBlank()
      case "short-answer":
        return renderShortAnswer()
      case "essay":
        return renderEssay()
      case "matching":
        return renderMatching()
      case "ordering":
        return renderOrdering()
      default:
        return <div>Unsupported question type</div>
    }
  }

  return (
    <div className="space-y-4">
      {renderQuestion()}
      <div className="text-sm text-gray-500 mt-4 flex items-center justify-between">
        <span>Points: {question.points}</span>
        <div className="flex items-center gap-2">
          {question.required && (
            <span className="text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              *Required
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
