"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Clock, Target, BookOpen, Calculator, Microscope, Code, Briefcase, Shield } from "lucide-react"
import type { SectionTemplate } from "@/types/quiz"
import { BUILT_IN_SECTION_TEMPLATES, SECTION_TEMPLATE_CATEGORIES } from "@/data/section-templates"

interface SectionTemplateSelectorProps {
  onSelectTemplate: (template: SectionTemplate) => void
  customTemplates?: SectionTemplate[]
}

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    BookOpen,
    Calculator,
    Microscope,
    Code,
    Briefcase,
    Shield,
    Target,
    Clock,
  }
  return icons[iconName] || BookOpen
}

export function SectionTemplateSelector({ onSelectTemplate, customTemplates = [] }: SectionTemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showDialog, setShowDialog] = useState(false)

  const allTemplates = [...BUILT_IN_SECTION_TEMPLATES, ...customTemplates]

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = (template: SectionTemplate) => {
    onSelectTemplate(template)
    setShowDialog(false)
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Use Section Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Section Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {SECTION_TEMPLATE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const IconComponent = getIconComponent(template.icon)
              return (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                          <p className="text-xs text-gray-500">{template.category}</p>
                        </div>
                      </div>
                      {template.isBuiltIn && (
                        <Badge variant="secondary" className="text-xs">
                          Built-in
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

                    <div className="space-y-2 mb-3">
                      {template.defaultTimeLimit && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {template.defaultTimeLimit} minutes
                        </div>
                      )}
                      {template.defaultPassingScore && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Target className="h-3 w-3" />
                          {template.defaultPassingScore}% passing score
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      Suggested: {template.suggestedQuestionTypes.slice(0, 2).join(", ")}
                      {template.suggestedQuestionTypes.length > 2 && "..."}
                    </div>

                    <Button size="sm" className="w-full" onClick={() => handleSelectTemplate(template)}>
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No templates found matching your criteria.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
