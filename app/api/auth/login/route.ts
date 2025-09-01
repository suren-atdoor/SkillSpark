import { type NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { sign } from "jsonwebtoken"
import type { LoginCredentials, User, AuthResponse } from "@/types/user"

// In-memory storage for demo (replace with actual database)
const users: (User & { password: string })[] = []

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe }: LoginCredentials = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = users.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString()

    // Generate JWT token
    const expiresIn = rememberMe ? "30d" : "7d"
    const token = sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    const response: AuthResponse = {
      user: userWithoutPassword,
      token,
      expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
