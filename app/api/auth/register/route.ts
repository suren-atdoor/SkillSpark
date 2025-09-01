import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { sign } from "jsonwebtoken"
import type { RegisterData, User, AuthResponse } from "@/types/user"

// In-memory storage for demo (replace with actual database)
const users: (User & { password: string })[] = []

export async function POST(request: NextRequest) {
  try {
    const { email, username, password, confirmPassword, firstName, lastName }: RegisterData = await request.json()

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json({ error: "Email, username, and password are required" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email || u.username === username)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email or username already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      email,
      username,
      firstName,
      lastName,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      preferences: {
        theme: "system",
        language: "en",
        emailNotifications: true,
        soundEffects: true,
        autoSave: true,
        defaultQuizSettings: {
          showExplanations: true,
          shuffleQuestions: false,
        },
      },
    }

    users.push(newUser)

    // Generate JWT token
    const token = sign({ userId: newUser.id, email: newUser.email }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    const response: AuthResponse = {
      user: userWithoutPassword,
      token,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
