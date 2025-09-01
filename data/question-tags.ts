import type { QuestionTag } from "@/types/quiz"

export const DEFAULT_QUESTION_TAGS: QuestionTag[] = [
  // Difficulty Tags
  { id: "easy", name: "Easy", color: "#10B981", category: "Difficulty" },
  { id: "medium", name: "Medium", color: "#F59E0B", category: "Difficulty" },
  { id: "hard", name: "Hard", color: "#EF4444", category: "Difficulty" },

  // Subject Tags
  { id: "math", name: "Mathematics", color: "#3B82F6", category: "Subject" },
  { id: "science", name: "Science", color: "#8B5CF6", category: "Subject" },
  { id: "language", name: "Language Arts", color: "#EC4899", category: "Subject" },
  { id: "history", name: "History", color: "#F97316", category: "Subject" },
  { id: "programming", name: "Programming", color: "#06B6D4", category: "Subject" },
  { id: "business", name: "Business", color: "#84CC16", category: "Subject" },

  // Cognitive Level Tags (Bloom's Taxonomy)
  { id: "remember", name: "Remember", color: "#6B7280", category: "Cognitive Level" },
  { id: "understand", name: "Understand", color: "#10B981", category: "Cognitive Level" },
  { id: "apply", name: "Apply", color: "#F59E0B", category: "Cognitive Level" },
  { id: "analyze", name: "Analyze", color: "#EF4444", category: "Cognitive Level" },
  { id: "evaluate", name: "Evaluate", color: "#8B5CF6", category: "Cognitive Level" },
  { id: "create", name: "Create", color: "#EC4899", category: "Cognitive Level" },

  // Question Type Tags
  { id: "conceptual", name: "Conceptual", color: "#3B82F6", category: "Question Type" },
  { id: "practical", name: "Practical", color: "#10B981", category: "Question Type" },
  { id: "theoretical", name: "Theoretical", color: "#8B5CF6", category: "Question Type" },
  { id: "problem-solving", name: "Problem Solving", color: "#F59E0B", category: "Question Type" },

  // Time Tags
  { id: "quick", name: "Quick (< 2 min)", color: "#10B981", category: "Time" },
  { id: "standard", name: "Standard (2-5 min)", color: "#F59E0B", category: "Time" },
  { id: "extended", name: "Extended (> 5 min)", color: "#EF4444", category: "Time" },

  // Assessment Tags
  { id: "formative", name: "Formative", color: "#06B6D4", category: "Assessment" },
  { id: "summative", name: "Summative", color: "#8B5CF6", category: "Assessment" },
  { id: "diagnostic", name: "Diagnostic", color: "#EC4899", category: "Assessment" },

  // Special Tags
  { id: "critical-thinking", name: "Critical Thinking", color: "#7C3AED", category: "Skills" },
  { id: "creativity", name: "Creativity", color: "#EC4899", category: "Skills" },
  { id: "collaboration", name: "Collaboration", color: "#10B981", category: "Skills" },
  { id: "communication", name: "Communication", color: "#F59E0B", category: "Skills" },
]

export const TAG_CATEGORIES = [
  "Difficulty",
  "Subject",
  "Cognitive Level",
  "Question Type",
  "Time",
  "Assessment",
  "Skills",
]
