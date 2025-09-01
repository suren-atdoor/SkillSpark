"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitBranch, Clock, User, FileText, Plus, ArrowRight, Download, Eye, RedoIcon as Revert } from "lucide-react"
import type { SecurityPreset, PresetChangelogEntry } from "@/types/quiz"

interface PresetVersionManagerProps {
  preset: SecurityPreset
  onUpdatePreset: (preset: SecurityPreset) => void
  onRevertToVersion: (version: string) => void
}

export function PresetVersionManager({ preset, onUpdatePreset, onRevertToVersion }: PresetVersionManagerProps) {
  const [showVersionDialog, setShowVersionDialog] = useState(false)
  const [newVersion, setNewVersion] = useState("")
  const [changeDescription, setChangeDescription] = useState("")
  const [changesList, setChangesList] = useState<string[]>([""])

  const addChange = () => {
    setChangesList([...changesList, ""])
  }

  const updateChange = (index: number, value: string) => {
    const updated = [...changesList]
    updated[index] = value
    setChangesList(updated)
  }

  const removeChange = (index: number) => {
    setChangesList(changesList.filter((_, i) => i !== index))
  }

  const createNewVersion = () => {
    if (!newVersion || changesList.filter((c) => c.trim()).length === 0) return

    const newChangelogEntry: PresetChangelogEntry = {
      version: newVersion,
      date: new Date().toISOString(),
      changes: changesList.filter((c) => c.trim()),
      author: "Current User", // In real app, get from auth
    }

    const updatedPreset: SecurityPreset = {
      ...preset,
      version: newVersion,
      updatedAt: new Date().toISOString(),
      changelog: [newChangelogEntry, ...(preset.changelog || [])],
    }

    onUpdatePreset(updatedPreset)
    setShowVersionDialog(false)
    setNewVersion("")
    setChangeDescription("")
    setChangesList([""])
  }

  const getVersionType = (version: string) => {
    const parts = version.split(".")
    const major = Number.parseInt(parts[0] || "0")
    const minor = Number.parseInt(parts[1] || "0")
    const patch = Number.parseInt(parts[2] || "0")

    if (major > 1) return { type: "Major", color: "bg-red-100 text-red-800" }
    if (minor > 0) return { type: "Minor", color: "bg-blue-100 text-blue-800" }
    return { type: "Patch", color: "bg-green-100 text-green-800" }
  }

  const getVersionComparison = (v1: string, v2: string) => {
    const parse = (v: string) => v.split(".").map((n) => Number.parseInt(n) || 0)
    const [a1, a2, a3] = parse(v1)
    const [b1, b2, b3] = parse(v2)

    if (a1 !== b1) return a1 > b1 ? 1 : -1
    if (a2 !== b2) return a2 > b2 ? 1 : -1
    if (a3 !== b3) return a3 > b3 ? 1 : -1
    return 0
  }

  const sortedChangelog = (preset.changelog || []).sort((a, b) => getVersionComparison(b.version, a.version))

  return (
    <div className="space-y-6">
      {/* Current Version Info */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Version Management
            </CardTitle>
            <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Version
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Version</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Current Version</label>
                      <Input value={preset.version} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">New Version</label>
                      <Input placeholder="1.1.0" value={newVersion} onChange={(e) => setNewVersion(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Changes Made</label>
                    <div className="space-y-2">
                      {changesList.map((change, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Describe what changed..."
                            value={change}
                            onChange={(e) => updateChange(index, e.target.value)}
                          />
                          {changesList.length > 1 && (
                            <Button size="sm" variant="outline" onClick={() => removeChange(index)}>
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={addChange}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Change
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowVersionDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createNewVersion}>Create Version</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{preset.version}</div>
              <p className="text-sm text-gray-600">Current Version</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{preset.changelog?.length || 0}</div>
              <p className="text-sm text-gray-600">Total Versions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Date(preset.updatedAt).toLocaleDateString()}
              </div>
              <p className="text-sm text-gray-600">Last Updated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      <Tabs defaultValue="changelog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="changelog">Version History</TabsTrigger>
          <TabsTrigger value="compare">Compare Versions</TabsTrigger>
          <TabsTrigger value="analytics">Version Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="changelog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Changelog</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedChangelog.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No version history available</p>
                  <p className="text-sm">Create a new version to start tracking changes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedChangelog.map((entry, index) => {
                    const versionType = getVersionType(entry.version)
                    const isLatest = index === 0

                    return (
                      <div key={entry.version} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={versionType.color}>
                              v{entry.version}
                            </Badge>
                            {isLatest && <Badge variant="default">Latest</Badge>}
                            <Badge variant="secondary" className={versionType.color}>
                              {versionType.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {!isLatest && (
                              <Button size="sm" variant="outline" onClick={() => onRevertToVersion(entry.version)}>
                                <Revert className="h-3 w-3 mr-1" />
                                Revert
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {new Date(entry.date).toLocaleString()}
                          </div>
                          {entry.author && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              {entry.author}
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            {entry.changes.length} change{entry.changes.length !== 1 ? "s" : ""}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Changes:</h4>
                          <ul className="space-y-1">
                            {entry.changes.map((change, changeIndex) => (
                              <li key={changeIndex} className="flex items-start gap-2 text-sm">
                                <ArrowRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compare Versions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Version A</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option value={preset.version}>v{preset.version} (Current)</option>
                    {sortedChangelog.slice(1).map((entry) => (
                      <option key={entry.version} value={entry.version}>
                        v{entry.version}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Version B</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    {sortedChangelog.map((entry) => (
                      <option key={entry.version} value={entry.version}>
                        v{entry.version}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  Select two versions to see a detailed comparison of changes
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Version Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {sortedChangelog.filter((v) => getVersionType(v.version).type === "Major").length}
                  </div>
                  <p className="text-sm text-gray-600">Major Releases</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {sortedChangelog.filter((v) => getVersionType(v.version).type === "Minor").length}
                  </div>
                  <p className="text-sm text-gray-600">Minor Updates</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {sortedChangelog.filter((v) => getVersionType(v.version).type === "Patch").length}
                  </div>
                  <p className="text-sm text-gray-600">Patches</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Version Timeline</h4>
                <div className="space-y-2">
                  {sortedChangelog.slice(0, 5).map((entry, index) => (
                    <div key={entry.version} className="flex items-center gap-3 p-2 border rounded">
                      <Badge variant="outline" className={getVersionType(entry.version).color}>
                        v{entry.version}
                      </Badge>
                      <span className="text-sm text-gray-600">{new Date(entry.date).toLocaleDateString()}</span>
                      <span className="text-sm">
                        {entry.changes.length} change{entry.changes.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
