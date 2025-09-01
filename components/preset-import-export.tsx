"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  Download,
  FileJson,
  Package,
  Share2,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
} from "lucide-react"
import type { SecurityPreset, PresetCollection } from "@/types/quiz"

interface PresetImportExportProps {
  presets: SecurityPreset[]
  onImportPreset: (preset: SecurityPreset) => void
  onImportCollection: (collection: PresetCollection) => void
}

export function PresetImportExport({ presets, onImportPreset, onImportCollection }: PresetImportExportProps) {
  const [importData, setImportData] = useState("")
  const [importError, setImportError] = useState("")
  const [importSuccess, setImportSuccess] = useState("")
  const [selectedPresets, setSelectedPresets] = useState<string[]>([])
  const [collectionName, setCollectionName] = useState("")
  const [collectionDescription, setCollectionDescription] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportData(content)
      handleImport(content)
    }
    reader.readAsText(file)
  }

  const handleImport = (data: string = importData) => {
    setImportError("")
    setImportSuccess("")

    try {
      const parsed = JSON.parse(data)

      // Check if it's a single preset or collection
      if (parsed.presets && Array.isArray(parsed.presets)) {
        // It's a collection
        const collection: PresetCollection = {
          ...parsed,
          id: `imported-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }

        // Validate collection structure
        if (!collection.name || !collection.presets.length) {
          throw new Error("Invalid collection format: missing name or presets")
        }

        // Validate each preset in the collection
        collection.presets.forEach((preset, index) => {
          validatePreset(preset, `Preset ${index + 1}`)
        })

        onImportCollection(collection)
        setImportSuccess(
          `Successfully imported collection "${collection.name}" with ${collection.presets.length} presets`,
        )
      } else {
        // It's a single preset
        validatePreset(parsed, "Preset")

        const preset: SecurityPreset = {
          ...parsed,
          id: `imported-${Date.now()}`,
          isCustom: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: parsed.version || "1.0.0",
          usageCount: 0,
        }

        onImportPreset(preset)
        setImportSuccess(`Successfully imported preset "${preset.name}"`)
      }

      setImportData("")
    } catch (error) {
      setImportError(`Import failed: ${error instanceof Error ? error.message : "Invalid JSON format"}`)
    }
  }

  const validatePreset = (preset: any, context: string) => {
    const required = ["name", "description", "category", "settings"]
    const missing = required.filter((field) => !preset[field])

    if (missing.length > 0) {
      throw new Error(`${context} missing required fields: ${missing.join(", ")}`)
    }

    if (!preset.settings.hasOwnProperty("allowCopyPaste") || !preset.settings.hasOwnProperty("allowScreenshots")) {
      throw new Error(`${context} has invalid security settings`)
    }
  }

  const exportSinglePreset = (preset: SecurityPreset) => {
    const exportData = {
      ...preset,
      exportedAt: new Date().toISOString(),
      exportedBy: "Quiz Manager v2.0",
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `preset-${preset.name.replace(/\s+/g, "_").toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportCollection = () => {
    if (selectedPresets.length === 0) {
      setImportError("Please select at least one preset to export")
      return
    }

    const selectedPresetData = presets.filter((p) => selectedPresets.includes(p.id))

    const collection: PresetCollection = {
      id: `collection-${Date.now()}`,
      name: collectionName || `Custom Collection ${new Date().toLocaleDateString()}`,
      description: collectionDescription || "Exported preset collection",
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      presets: selectedPresetData,
      author: "Quiz Manager User",
      tags: [...new Set(selectedPresetData.flatMap((p) => p.tags || []))],
    }

    const dataStr = JSON.stringify(collection, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `preset-collection-${collection.name.replace(/\s+/g, "_").toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)

    setImportSuccess(`Exported collection "${collection.name}" with ${selectedPresets.length} presets`)
    setSelectedPresets([])
    setCollectionName("")
    setCollectionDescription("")
  }

  const generateShareUrl = async (preset: SecurityPreset) => {
    try {
      const response = await fetch("/api/presets/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      })

      const { shareId } = await response.json()
      const url = `${window.location.origin}/presets/shared/${shareId}`
      setShareUrl(url)

      // Copy to clipboard
      await navigator.clipboard.writeText(url)
      setImportSuccess("Share URL copied to clipboard!")
    } catch (error) {
      setImportError("Failed to generate share URL")
    }
  }

  const togglePresetSelection = (presetId: string) => {
    setSelectedPresets((prev) => (prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId]))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export Single</TabsTrigger>
          <TabsTrigger value="collection">Export Collection</TabsTrigger>
          <TabsTrigger value="share">Share & Collaborate</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload JSON File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileJson className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Drop a JSON file here or click to browse</p>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Manual JSON Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Paste JSON Data</label>
                  <Textarea
                    placeholder="Paste preset or collection JSON here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="min-h-[200px] font-mono text-xs"
                  />
                  <Button onClick={() => handleImport()} disabled={!importData.trim()} className="w-full">
                    Import JSON
                  </Button>
                </div>
              </div>

              {/* Status Messages */}
              {importError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}

              {importSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{importSuccess}</AlertDescription>
                </Alert>
              )}

              {/* Import Format Help */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Supported Formats:</h4>
                  <ul className="text-sm space-y-1">
                    <li>
                      • <strong>Single Preset:</strong> JSON object with preset configuration
                    </li>
                    <li>
                      • <strong>Preset Collection:</strong> JSON object with "presets" array
                    </li>
                    <li>
                      • <strong>Exported Files:</strong> Files exported from this application
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Individual Presets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset) => (
                  <Card key={preset.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{preset.icon}</span>
                          <div>
                            <h4 className="font-medium text-sm">{preset.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {preset.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          v{preset.version}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{preset.description}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportSinglePreset(preset)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => generateShareUrl(preset)}>
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Export Preset Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Collection Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Collection Name</label>
                  <Input
                    placeholder="My Custom Preset Collection"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Collection description..."
                    value={collectionDescription}
                    onChange={(e) => setCollectionDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Preset Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Select Presets ({selectedPresets.length} selected)</label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedPresets(presets.map((p) => p.id))}>
                      Select All
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedPresets([])}>
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto border rounded-lg p-3">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPresets.includes(preset.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => togglePresetSelection(preset.id)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPresets.includes(preset.id)}
                          onChange={() => togglePresetSelection(preset.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{preset.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{preset.name}</p>
                          <p className="text-xs text-gray-500">{preset.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={exportCollection} disabled={selectedPresets.length === 0} className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Export Collection ({selectedPresets.length} presets)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share & Collaborate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Share */}
                <div className="space-y-4">
                  <h4 className="font-medium">Quick Share</h4>
                  <p className="text-sm text-gray-600">Generate shareable links for individual presets</p>

                  {presets.slice(0, 5).map((preset) => (
                    <div key={preset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span>{preset.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{preset.name}</p>
                          <p className="text-xs text-gray-500">{preset.category}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => generateShareUrl(preset)}>
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Community Hub */}
                <div className="space-y-4">
                  <h4 className="font-medium">Community Hub</h4>
                  <p className="text-sm text-gray-600">Discover and share presets with the community</p>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse Community Presets
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Publish to Community
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      My Published Presets
                    </Button>
                  </div>

                  {shareUrl && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-2">Share URL Generated:</p>
                      <div className="flex items-center gap-2">
                        <Input value={shareUrl} readOnly className="text-xs" />
                        <Button size="sm" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Messages */}
      {importError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      {importSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{importSuccess}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
