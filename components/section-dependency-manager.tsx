"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { GitBranch, Plus, Trash2, Target, AlertTriangle } from "lucide-react"
import type { QuizSection, SectionDependency } from "@/types/quiz"

interface SectionDependencyManagerProps {
  sections: QuizSection[]
  dependencies: SectionDependency[]
  onUpdateDependencies: (dependencies: SectionDependency[]) => void
}

export function SectionDependencyManager({
  sections,
  dependencies,
  onUpdateDependencies,
}: SectionDependencyManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newDependency, setNewDependency] = useState<Partial<SectionDependency>>({
    sectionId: "",
    dependsOn: [],
    condition: "all",
    minimumScore: undefined,
  })

  const handleAddDependency = () => {
    if (!newDependency.sectionId || !newDependency.dependsOn?.length) return

    const dependency: SectionDependency = {
      sectionId: newDependency.sectionId,
      dependsOn: newDependency.dependsOn,
      condition: newDependency.condition || "all",
      minimumScore: newDependency.minimumScore,
    }

    onUpdateDependencies([...dependencies, dependency])
    setNewDependency({
      sectionId: "",
      dependsOn: [],
      condition: "all",
      minimumScore: undefined,
    })
    setShowAddDialog(false)
  }

  const handleRemoveDependency = (sectionId: string) => {
    onUpdateDependencies(dependencies.filter((dep) => dep.sectionId !== sectionId))
  }

  const getSectionName = (sectionId: string) => {
    return sections.find((s) => s.id === sectionId)?.title || "Unknown Section"
  }

  const getAvailableSections = (excludeSectionId?: string) => {
    return sections.filter((s) => s.id !== excludeSectionId)
  }

  const getDependencyChain = (sectionId: string, visited: Set<string> = new Set()): string[] => {
    if (visited.has(sectionId)) return [] // Circular dependency

    visited.add(sectionId)
    const dependency = dependencies.find((dep) => dep.sectionId === sectionId)

    if (!dependency) return []

    const chain = [...dependency.dependsOn]
    dependency.dependsOn.forEach((depId) => {
      chain.push(...getDependencyChain(depId, new Set(visited)))
    })

    return [...new Set(chain)]
  }

  const hasCircularDependency = (sectionId: string, dependsOn: string[]): boolean => {
    return dependsOn.some((depId) => {
      const chain = getDependencyChain(depId)
      return chain.includes(sectionId)
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-orange-600" />
            Section Dependencies
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Dependency
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Section Dependency</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Section</Label>
                  <Select
                    value={newDependency.sectionId}
                    onValueChange={(value) => setNewDependency({ ...newDependency, sectionId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
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

                <div>
                  <Label>Depends On</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      const currentDeps = newDependency.dependsOn || []
                      if (!currentDeps.includes(value)) {
                        setNewDependency({
                          ...newDependency,
                          dependsOn: [...currentDeps, value],
                        })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add dependency" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSections(newDependency.sectionId).map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {newDependency.dependsOn && newDependency.dependsOn.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newDependency.dependsOn.map((depId) => (
                        <Badge key={depId} variant="secondary" className="flex items-center gap-1">
                          {getSectionName(depId)}
                          <button
                            onClick={() =>
                              setNewDependency({
                                ...newDependency,
                                dependsOn: newDependency.dependsOn?.filter((id) => id !== depId),
                              })
                            }
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Condition</Label>
                  <Select
                    value={newDependency.condition}
                    onValueChange={(value: "all" | "any") => setNewDependency({ ...newDependency, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Complete ALL dependencies</SelectItem>
                      <SelectItem value="any">Complete ANY dependency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Minimum Score (%) - Optional</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newDependency.minimumScore || ""}
                    onChange={(e) =>
                      setNewDependency({
                        ...newDependency,
                        minimumScore: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="No minimum score required"
                  />
                </div>

                {newDependency.sectionId &&
                  newDependency.dependsOn &&
                  hasCircularDependency(newDependency.sectionId, newDependency.dependsOn) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Circular Dependency Detected</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">
                        This dependency would create a circular reference. Please choose different dependencies.
                      </p>
                    </div>
                  )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddDependency}
                    disabled={
                      !newDependency.sectionId ||
                      !newDependency.dependsOn?.length ||
                      (newDependency.sectionId &&
                        newDependency.dependsOn &&
                        hasCircularDependency(newDependency.sectionId, newDependency.dependsOn))
                    }
                  >
                    Add Dependency
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {dependencies.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No section dependencies configured. Sections can be accessed in any order.
          </p>
        ) : (
          <div className="space-y-4">
            {dependencies.map((dependency) => (
              <div key={dependency.sectionId} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        {getSectionName(dependency.sectionId)}
                      </Badge>
                      <span className="text-sm text-gray-600">depends on</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {dependency.dependsOn.map((depId) => (
                        <Badge key={depId} variant="secondary">
                          {getSectionName(depId)}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Condition: {dependency.condition === "all" ? "Complete ALL" : "Complete ANY"}</span>
                      {dependency.minimumScore && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Min Score: {dependency.minimumScore}%
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveDependency(dependency.sectionId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
