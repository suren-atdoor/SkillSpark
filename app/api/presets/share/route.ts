import { type NextRequest, NextResponse } from "next/server"
import type { SecurityPreset } from "@/types/quiz"

// In-memory storage for demo - in real app, use database
const sharedPresets = new Map<string, SecurityPreset>()

export async function POST(request: NextRequest) {
  try {
    const preset: SecurityPreset = await request.json()

    // Generate unique share ID
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Store preset with share ID
    sharedPresets.set(shareId, {
      ...preset,
      id: shareId,
      isCustom: true,
    })

    return NextResponse.json({ shareId })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get("id")

    if (!shareId) {
      return NextResponse.json({ error: "Share ID required" }, { status: 400 })
    }

    const preset = sharedPresets.get(shareId)

    if (!preset) {
      return NextResponse.json({ error: "Shared preset not found" }, { status: 404 })
    }

    return NextResponse.json(preset)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shared preset" }, { status: 500 })
  }
}
