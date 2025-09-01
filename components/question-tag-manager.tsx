"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Tag, Edit, Trash2, ChevronRight } from 'lucide-react'
import type { QuestionTag, TagCategory } from "@/types/quiz"
import { TAG_HIERARCHY, getAllTags } from "@/data/tag-hierarchy"

interface QuestionTagManagerProps {
  customTags: QuestionTag[]
  onUpdateTags: (tags: QuestionTag[]) => void
}

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
  "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#C026D3", "#EC4899", "#F43F5E", "#6B7280",
]

export function QuestionTagManager({ customTags, onUpdateTags }: QuestionTagManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTag, setEditingTag] = useState<QuestionTag | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("difficulty")
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [newTag, setNewTag] = useState<Partial<QuestionTag>>({
    name: "",
    color: PRESET_COLORS[0],
    category: "Custom",
    level: 1,
  })

  const handleCreateTag = () => {
    if (!newTag.name) return

    const tag: QuestionTag = {
      id: `custom-${Date.now()}`,
      name: newTag.name,
      color: newTag.color || PRESET_COLORS[0],
      category: newTag.category || "Custom",
      level: newTag.level || 1,
      parentId: newTag.parentId,
    }

    onUpdateTags([...customTags, tag])
    setNewTag({ name: "", color: PRESET_COLORS[0], category: "Custom", level: 1 })
    setShowCreateDialog(false)
  }

  const handleUpdateTag = () => {
    if (!editingTag || !editingTag.name) return

    const updatedTags = customTags.map((tag) => (tag.id === editingTag.id ? editingTag : tag))
    onUpdateTags(updatedTags)
    setEditingTag(null)
  }

  const handleDeleteTag = (tagId: string) => {
    if (confirm("Are you sure you want to delete this tag? It will be removed from all questions.")) {
      onUpdateTags(customTags.filter((tag) => tag.id !== tagId))
    }
  }

  const getCurrentCategory = (): TagCategory | undefined => {
    return TAG_HIERARCHY.find(c => c.id === selectedCategory)
  }

  const getCurrentSubCategory = () => {
    const category = getCurrentCategory()
    return category?.subCategories?.find(sc => sc.id === selectedSubCategory)
  }

  const renderTagBadge = (tag: QuestionTag) => (
    <Badge
      key={tag.id}
      variant="outline"
      className="flex items-center gap-1 mb-2 mr-2"
      style={{ borderColor: tag.color, color: tag.color }}
    >
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
      {tag.name}
      {tag.level === 2 && <span className="text-xs opacity-70">(Sub)</span>}
    </Badge>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-green-600" />
            Question Tags
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tag Name</Label>
                  <Input
                    value={newTag.name || ""}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    placeholder="Enter tag name"
                  />
                </div>
                <div>
                  <Label>Tag Level</Label>
                  <Select 
                    value={newTag.level?.toString() || "1"} 
                    onValueChange={(value) => setNewTag({ ...newTag, level: parseInt(value) as 1 | 2 })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Main Tag (Level 1)</SelectItem>
                      <SelectItem value="2">Sub Tag (Level 2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newTag.level === 2 && (
                  <div>
                    <Label>Parent Category</Label>
                    <Select 
                      value={newTag.parentId || ""} 
                      onValueChange={(value) => setNewTag({ ...newTag, parentId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TAG_HIERARCHY.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Category</Label>
                  <Input
                    value={newTag.category || "Custom"}
                    onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
                    placeholder="Tag category"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-9 gap-2 mt-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newTag.color === color ? "border-gray-900" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTag({ ...newTag, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTag} disabled={!newTag.name}>
                    Create Tag
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hierarchy" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hierarchy">Tag Hierarchy</TabsTrigger>
            <TabsTrigger value="built-in">Built-in Tags</TabsTrigger>
            <TabsTrigger value="custom">Custom Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="hierarchy" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <h4 className="font-medium text-sm">Categories</h4>
                </CardHeader>
                <CardContent className="space-y-2">
                  {TAG_HIERARCHY.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setSelectedSubCategory(null)
                      }}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Sub-Category Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <h4 className="font-medium text-sm">
                    {getCurrentCategory()?.name} Sub-Categories
                  </h4>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getCurrentCategory()?.subCategories?.map((subCategory) => (
                    <Button
                      key={subCategory.id}
                      variant={selectedSubCategory === subCategory.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedSubCategory(subCategory.id)}
                    >
                      <ChevronRight className="h-3 w-3 mr-2" />
                      {subCategory.name}
                    </Button>
                  )) || (
                    <p className="text-sm text-gray-500 italic">No sub-categories</p>
                  )}
                </CardContent>
              </Card>

              {/* Tags Display */}
              <Card>
                <CardHeader className="pb-3">
                  <h4 className="font-medium text-sm">
                    {selectedSubCategory 
                      ? getCurrentSubCategory()?.name + " Tags"
                      : getCurrentCategory()?.name + " Tags"
                    }
                  </h4>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap">
                    {selectedSubCategory 
                      ? getCurrentSubCategory()?.tags.map(renderTagBadge)
                      : getCurrentCategory()?.tags.map(renderTagBadge)
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="built-in" className="space-y-4">
            {TAG_HIERARCHY.map((category) => (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{category.icon}</span>
                  <h4 className="font-medium text-sm">{category.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {category.tags.length + (category.subCategories?.reduce((acc, sc) => acc + sc.tags.length, 0) || 0)} tags
                  </Badge>
                </div>
                
                {/* Main category tags */}
                <div className="mb-4">
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Main Tags</h5>
                  <div className="flex flex-wrap">
                    {category.tags.map(renderTagBadge)}
                  </div>
                </div>

                {/* Sub-category tags */}
                {category.subCategories?.map((subCategory) => (
                  <div key={subCategory.id} className="mb-4 ml-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ChevronRight className="h-3 w-3" />
                      <h5 className="text-xs font-medium text-gray-600">{subCategory.name}</h5>
                    </div>
                    <div className="flex flex-wrap ml-4">
                      {subCategory.tags.map(renderTagBadge)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            {customTags.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No custom tags created yet. Click "Create Tag" to add your first custom tag.
              </p>
            ) : (
              <div className="space-y-2">
                {customTags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {renderTagBadge(tag)}
                      <span className="text-xs text-gray-500">
                        Level {tag.level} {tag.parentId && `• Parent: ${tag.parentId}`}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditingTag(tag)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Tag Dialog */}
        {editingTag && (
          <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Tag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tag Name</Label>
                  <Input
                    value={editingTag.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={editingTag.category || ""}
                    onChange={(e) => setEditingTag({ ...editingTag, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-9 gap-2 mt-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          editingTag.color === color ? "border-gray-900" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingTag({ ...editingTag, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingTag(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateTag}>Save Changes</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
