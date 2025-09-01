import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return a properly structured sample quiz
    const sampleQuiz = {
      id: "sample-quiz-1",
      title: "Sample Security Quiz",
      description: "A sample quiz to test the system",
      timeLimit: 30, // 30 minutes
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          question: "What is the most common type of cyber attack?",
          options: ["Phishing", "Malware", "DDoS", "SQL Injection"],
          correctAnswer: 0,
          points: 10,
          required: true,
          shuffleAnswers: false,
        },
        {
          id: "q2",
          type: "true-false",
          question: "Two-factor authentication provides an additional layer of security.",
          correctAnswer: true,
          points: 5,
          required: true,
        },
        {
          id: "q3",
          type: "multiple-select",
          question: "Which of the following are considered strong password practices?",
          options: [
            "Using at least 12 characters",
            "Including special characters",
            "Using personal information",
            "Using unique passwords for each account",
          ],
          correctAnswers: [0, 1, 3],
          points: 15,
          required: true,
          shuffleAnswers: false,
        },
        {
          id: "q4",
          type: "short-answer",
          question: "What does 'HTTPS' stand for?",
          correctAnswer: "HyperText Transfer Protocol Secure",
          points: 10,
          required: true,
          maxLength: 100,
        },
        {
          id: "q5",
          type: "fill-blank",
          question:
            "Complete this sentence: A _____ is a type of malicious software designed to block access to a computer system until money is paid.",
          correctAnswer: "ransomware",
          points: 10,
          required: true,
        },
      ],
      copyPasteSettings: {
        allowCopyPaste: false,
        allowScreenshots: false,
        screenshotDetection: true,
        maxViolations: 3,
        maxScreenshotViolations: 2,
        violationAction: "warn",
        screenshotViolationAction: "warn",
        warningMessage: "Copy-paste is not allowed during this quiz!",
        screenshotWarningMessage: "Screenshots are not allowed during this quiz!",
      },
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(sampleQuiz)
  } catch (error) {
    console.error("Error creating sample quiz:", error)
    return NextResponse.json({ error: "Failed to load sample quiz" }, { status: 500 })
  }
}
