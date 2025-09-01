"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Settings,
  Eye,
  Camera,
  Shield,
  Clock,
  Target,
  TrendingUp,
  Upload,
  GitBranch,
  Share2,
} from "lucide-react"
import { SECURITY_PRESETS, PRESET_CATEGORIES } from "@/data/security-presets"
import type { SecurityPreset, CopyPasteSettings } from "@/types/quiz"
import { PresetAnalyticsDashboard } from "./preset-analytics-dashboard"
import { PresetImportExport } from "./preset-import-export"
import { PresetVersionManager } from "./preset-version-manager"

interface SecurityPresetSelectorProps {
  onSelectPreset: (preset: SecurityPreset) => void
  currentSettings?: CopyPasteSettings
  timeLimit?: number
  passingScore?: number
  shuffleQuestions?: boolean
}

export function SecurityPresetSelector({
  onSelectPreset,
  currentSettings,
  timeLimit,
  passingScore,
  shuffleQuestions,
}: SecurityPresetSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [customPreset, setCustomPreset] = useState<Partial<SecurityPreset>>({
    name: "",
    description: "",
    category: "Custom",
    icon: "⚙️",
    settings: {
      allowCopyPaste: true,
      allowScreenshots: true,
      screenshotDetection: false,
      maxViolations: 3,
      maxScreenshotViolations: 2,
      violationAction: "warning",
      screenshotViolationAction: "warning",
      showCopyStatusInResults: false,
      showScreenshotStatusInResults: false,
      warningMessage: "",
      screenshotWarningMessage: "",
    },
  })

  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [showVersionManager, setShowVersionManager] = useState(false)
  const [selectedPresetForVersioning, setSelectedPresetForVersioning] = useState<SecurityPreset | null>(null)

  const filteredPresets = SECURITY_PRESETS.filter((preset) => {
    const matchesSearch =
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || preset.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCustomPresetSave = () => {
    if (customPreset.name && customPreset.description && customPreset.settings) {
      const newPreset: SecurityPreset = {
        id: `custom-${Date.now()}`,
        name: customPreset.name,
        description: customPreset.description,
        category: "Custom",
        icon: "⚙️",
        settings: customPreset.settings,
        timeLimit: customPreset.timeLimit,
        passingScore: customPreset.passingScore,
        shuffleQuestions: customPreset.shuffleQuestions,
        isCustom: true,
      }
      onSelectPreset(newPreset)
      setShowCustomDialog(false)
    }
  }

  const getSecurityLevel = (settings: CopyPasteSettings) => {
    let score = 0
    if (!settings.allowCopyPaste) score += 2
    if (!settings.allowScreenshots) score += 2
    if (settings.screenshotDetection) score += 1
    if (settings.violationAction === "end-exam") score += 2
    if (settings.screenshotViolationAction === "end-exam") score += 2
    if (settings.maxViolations <= 1) score += 1
    if (settings.maxScreenshotViolations <= 1) score += 1

    if (score >= 8) return { level: "Maximum", color: "bg-red-100 text-red-800" }
    if (score >= 5) return { level: "High", color: "bg-orange-100 text-orange-800" }
    if (score >= 3) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" }
    return { level: "Low", color: "bg-green-100 text-green-800" }
  }

  const handleImportPreset = (preset: SecurityPreset) => {
    onSelectPreset(preset)
  }

  const handleImportCollection = (collection: any) => {
    // In real app, would handle collection import
    console.log("Importing collection:", collection)
  }

  const handleUpdatePreset = (preset: SecurityPreset) => {
    // In real app, would update preset in database
    console.log("Updating preset:", preset)
  }

  const handleRevertToVersion = (version: string) => {
    // In real app, would revert preset to specific version
    console.log("Reverting to version:", version)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Security Presets</h3>
          <p className="text-sm text-gray-600">Choose a preset configuration or create your own</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(true)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" onClick={() => setShowImportExport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
          <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Custom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Custom Security Preset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Preset Name</label>
                    <Input
                      value={customPreset.name || ""}
                      onChange={(e) => setCustomPreset({ ...customPreset, name: e.target.value })}
                      placeholder="My Custom Preset"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time Limit (minutes)</label>
                    <Input
                      type="number"
                      value={customPreset.timeLimit || ""}
                      onChange={(e) =>
                        setCustomPreset({
                          ...customPreset,
                          timeLimit: e.target.value ? Number.parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="No limit"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={customPreset.description || ""}
                    onChange={(e) => setCustomPreset({ ...customPreset, description: e.target.value })}
                    placeholder="Describe when to use this preset..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Passing Score (%)</label>
                    <Input
                      type="number"
                      value={customPreset.passingScore || ""}
                      onChange={(e) =>
                        setCustomPreset({
                          ...customPreset,
                          passingScore: e.target.value ? Number.parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="No requirement"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Copy-Paste Policy</label>
                    <Select
                      value={customPreset.settings?.allowCopyPaste ? "allow" : "restrict"}
                      onValueChange={(value) =>
                        setCustomPreset({
                          ...customPreset,
                          settings: {
                            ...customPreset.settings!,
                            allowCopyPaste: value === "allow",
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="allow">Allow</SelectItem>
                        <SelectItem value="restrict">Restrict</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCustomPresetSave}>Save Preset</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search presets..."
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
            {PRESET_CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
          <TabsTrigger value="all">All</TabsTrigger>
          {PRESET_CATEGORIES.slice(0, 8).map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              <span className="hidden sm:inline">{category.icon}</span>
              <span className="sm:ml-1">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresets.map((preset) => {
              const securityLevel = getSecurityLevel(preset.settings)
              return (
                <Card
                  key={preset.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200"
                  onClick={() => onSelectPreset(preset)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{preset.icon}</span>
                        <div>
                          <CardTitle className="text-base">{preset.name}</CardTitle>
                          <Badge
                            variant="outline"
                            className={PRESET_CATEGORIES.find((c) => c.id === preset.category)?.color}
                          >
                            {preset.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className={securityLevel.color}>
                        {securityLevel.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{preset.description}</p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {preset.timeLimit && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span>{preset.timeLimit}min</span>
                        </div>
                      )}
                      {preset.passingScore && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-gray-400" />
                          <span>{preset.passingScore}%</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-gray-400" />
                        <span>{preset.settings.allowCopyPaste ? "Copy OK" : "No Copy"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Camera className="h-3 w-3 text-gray-400" />
                        <span>{preset.settings.allowScreenshots ? "Screen OK" : "No Screen"}</span>
                      </div>
                    </div>

                    {/* Security Features */}
                    <div className="flex flex-wrap gap-1">
                      {!preset.settings.allowCopyPaste && (
                        <Badge variant="secondary" className="text-xs">
                          Copy Protection
                        </Badge>
                      )}
                      {!preset.settings.allowScreenshots && (
                        <Badge variant="secondary" className="text-xs">
                          Screenshot Block
                        </Badge>
                      )}
                      {preset.settings.screenshotDetection && (
                        <Badge variant="secondary" className="text-xs">
                          Detection
                        </Badge>
                      )}
                      {preset.settings.violationAction === "end-exam" && (
                        <Badge variant="destructive" className="text-xs">
                          Auto-End
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <div className="flex justify-end p-2">
                    <div className="flex gap-1">
                      {preset.isCustom && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPresetForVersioning(preset)
                            setShowVersionManager(true)
                          }}
                        >
                          <GitBranch className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle preset sharing
                        }}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {filteredPresets.length === 0 && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No presets found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or create a custom preset</p>
              <Button onClick={() => setShowCustomDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Preset
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Current Settings Preview */}
      {currentSettings && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Current Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Copy-Paste:</span>
                <span className={currentSettings.allowCopyPaste ? "text-green-600" : "text-red-600"}>
                  {currentSettings.allowCopyPaste ? " Allowed" : " Blocked"}
                </span>
              </div>
              <div>
                <span className="font-medium">Screenshots:</span>
                <span className={currentSettings.allowScreenshots ? "text-green-600" : "text-red-600"}>
                  {currentSettings.allowScreenshots ? " Allowed" : " Blocked"}
                </span>
              </div>
              <div>
                <span className="font-medium">Max Violations:</span>
                <span> {currentSettings.maxViolations}</span>
              </div>
              <div>
                <span className="font-medium">Action:</span>
                <span className={currentSettings.violationAction === "end-exam" ? "text-red-600" : "text-yellow-600"}>
                  {currentSettings.violationAction === "end-exam" ? " End Exam" : " Warning"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <PresetAnalyticsDashboard onClose={() => setShowAnalytics(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Import/Export Dialog */}
      {showImportExport && (
        <Dialog open={showImportExport} onOpenChange={setShowImportExport}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import & Export Presets</DialogTitle>
            </DialogHeader>
            <PresetImportExport
              presets={SECURITY_PRESETS}
              onImportPreset={handleImportPreset}
              onImportCollection={handleImportCollection}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Version Manager Dialog */}
      {showVersionManager && selectedPresetForVersioning && (
        <Dialog open={showVersionManager} onOpenChange={setShowVersionManager}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Version Management - {selectedPresetForVersioning.name}</DialogTitle>
            </DialogHeader>
            <PresetVersionManager
              preset={selectedPresetForVersioning}
              onUpdatePreset={handleUpdatePreset}
              onRevertToVersion={handleRevertToVersion}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
