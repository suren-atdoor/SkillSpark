import type { TagCategory, QuestionTag } from "@/types/quiz"

/**
 * Level-1 and level-2 tag hierarchy used by the QuestionTagManager.
 * Feel free to extend this structure with more categories, sub-categories, or tags.
 */
export const TAG_HIERARCHY: TagCategory[] = [
  {
    id: "difficulty",
    name: "Difficulty",
    description: "Overall question difficulty",
    icon: "🧩",
    color: "#6366F1",
    tags: [
      { id: "easy", name: "Easy", color: "#22C55E", level: 1 },
      { id: "medium", name: "Medium", color: "#EAB308", level: 1 },
      { id: "hard", name: "Hard", color: "#EF4444", level: 1 },
    ],
    subCategories: [],
  },
  {
    id: "subject",
    name: "Subject Areas",
    description: "High-level academic subjects",
    icon: "📚",
    color: "#0EA5E9",
    tags: [],
    subCategories: [
      {
        id: "math",
        name: "Mathematics",
        parentCategoryId: "subject",
        icon: "➗",
        color: "#8B5CF6",
        tags: [
          { id: "algebra", name: "Algebra", color: "#8B5CF6", level: 2, parentId: "math" },
          { id: "geometry", name: "Geometry", color: "#6366F1", level: 2, parentId: "math" },
          { id: "calculus", name: "Calculus", color: "#4F46E5", level: 2, parentId: "math" },
        ],
      },
      {
        id: "science",
        name: "Science",
        parentCategoryId: "subject",
        icon: "🔬",
        color: "#06B6D4",
        tags: [
          { id: "physics", name: "Physics", color: "#06B6D4", level: 2, parentId: "science" },
          { id: "chemistry", name: "Chemistry", color: "#0EA5E9", level: 2, parentId: "science" },
          { id: "biology", name: "Biology", color: "#14B8A6", level: 2, parentId: "science" },
        ],
      },
    ],
  },
  {
    id: "cognitive",
    name: "Cognitive Level",
    description: "Bloom’s taxonomy levels",
    icon: "🧠",
    color: "#F59E0B",
    tags: [
      { id: "remember", name: "Remember", color: "#FDE047", level: 1 },
      { id: "understand", name: "Understand", color: "#FACC15", level: 1 },
      { id: "apply", name: "Apply", color: "#F59E0B", level: 1 },
      { id: "analyze", name: "Analyze", color: "#F97316", level: 1 },
      { id: "evaluate", name: "Evaluate", color: "#EF4444", level: 1 },
      { id: "create", name: "Create", color: "#EC4899", level: 1 },
    ],
    subCategories: [],
  },
]

/**
 * Utility that flattens TAG_HIERARCHY into a simple array of QuestionTag.
 * This is handy when you need to list or search tags quickly.
 */
export function getAllTags(): QuestionTag[] {
  const tags: QuestionTag[] = []

  TAG_HIERARCHY.forEach((category) => {
    tags.push(...category.tags)
    category.subCategories?.forEach((subCat) => {
      tags.push(...subCat.tags)
    })
  })

  return tags
}
