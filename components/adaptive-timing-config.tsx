"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, TrendingUp, AlertCircle } from "lucide-react"
import type { AdaptiveTimingSettings } from "@/types/quiz"

interface AdaptiveTimingConfigProps {
  settings: AdaptiveTimingSettings
  onUpdate: (settings: AdaptiveTimingSettings) => void
}

export function AdaptiveTimingConfig({ settings, onUpdate }: AdaptiveTimingConfigProps) {
  const handleSettingChange = (field: keyof AdaptiveTimingSettings, value: any) => {
    onUpdate({
      ...settings,
      [field]: value,
    })
  }

  const handleMultiplierChange = (difficulty: "easy" | "medium" | "hard", value: number) => {
    onUpdate({
      ...settings,
      difficultyMultipliers: {
        ...settings.difficultyMultipliers,
        [difficulty]: value,
      },
    })
  }

  const calculateEstimatedTime = (difficulty: "easy" | "medium" | "hard") => {
    return Math.round(settings.baseTimePerQuestion * settings.difficultyMultipliers[difficulty])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Adaptive Timing Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Adaptive Timing */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Enable Adaptive Timing</Label>
            <p className="text-sm text-gray-600">
              Automatically adjust time limits based on question difficulty and user performance
            </p>
          </div>
          <Switch checked={settings.enabled} onCheckedChange={(checked) => handleSettingChange("enabled", checked)} />
        </div>

        {settings.enabled && (
          <>
            {/* Base Time Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <Label className="text-base font-medium">Base Time Settings</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Base Time per Question (seconds)</Label>
                  <Input
                    type="number"
                    min="30"
                    max="600"
                    value={settings.baseTimePerQuestion}
                    onChange={(e) => handleSettingChange("baseTimePerQuestion", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Minimum Time (seconds)</Label>
                  <Input
                    type="number"
                    min="15"
                    max="300"
                    value={settings.minTimePerQuestion}
                    onChange={(e) => handleSettingChange("minTimePerQuestion", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Maximum Time (seconds)</Label>
                  <Input
                    type="number"
                    min="60"
                    max="1800"
                    value={settings.maxTimePerQuestion}
                    onChange={(e) => handleSettingChange("maxTimePerQuestion", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Difficulty Multipliers */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <Label className="text-base font-medium">Difficulty Multipliers</Label>
              </div>

              <div className="space-y-4">
                {(["easy", "medium", "hard"] as const).map((difficulty) => (
                  <div key={difficulty} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            difficulty === "easy" ? "secondary" : difficulty === "medium" ? "default" : "destructive"
                          }
                          className="capitalize"
                        >
                          {difficulty}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {calculateEstimatedTime(difficulty)}s per question
                        </span>
                      </div>
                      <span className="text-sm font-medium">{settings.difficultyMultipliers[difficulty]}x</span>
                    </div>
                    <Slider
                      value={[settings.difficultyMultipliers[difficulty]]}
                      onValueChange={(value) => handleMultiplierChange(difficulty, value[0])}
                      min={0.5}
                      max={3.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Adjustment */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Performance-Based Adjustment</Label>
                <p className="text-sm text-gray-600">
                  Adjust time allocation based on user's performance during the quiz
                </p>
              </div>
              <Switch
                checked={settings.performanceAdjustment}
                onCheckedChange={(checked) => handleSettingChange("performanceAdjustment", checked)}
              />
            </div>

            {/* Information Panel */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800">How Adaptive Timing Works</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Questions tagged as "easy" get less time allocation</li>
                    <li>• Questions tagged as "hard" get more time allocation</li>
                    <li>• Performance adjustment learns from user speed and accuracy</li>
                    <li>• Time limits are enforced within min/max boundaries</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
