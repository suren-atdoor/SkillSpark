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

// PUT /api/tasks/[id] - Update task
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    const taskIndex = tasks.findIndex((task) => task._id === id)

    if (taskIndex === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...body,
      _id: id, // Ensure ID doesn't change
    }

    return NextResponse.json(tasks[taskIndex])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const taskIndex = tasks.findIndex((task) => task._id === id)

    if (taskIndex === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    tasks.splice(taskIndex, 1)

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
