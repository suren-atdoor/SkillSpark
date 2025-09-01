import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
// In a real MERN app, this would connect to MongoDB
const tasks = [
  {
    _id: "1",
    title: "Learn MERN Stack",
    description: "Study MongoDB, Express, React, and Node.js",
    status: "in-progress" as const,
    priority: "high" as const,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "Build Todo App",
    description: "Create a full-stack todo application",
    status: "pending" as const,
    priority: "medium" as const,
    createdAt: new Date().toISOString(),
  },
]

// GET /api/tasks - Fetch all tasks
export async function GET() {
  try {
    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newTask = {
      _id: Date.now().toString(),
      title: body.title,
      description: body.description || "",
      status: body.status || "pending",
      priority: body.priority || "medium",
      createdAt: new Date().toISOString(),
    }

    tasks.unshift(newTask)

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
