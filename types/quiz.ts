export interface BaseQuestion {
  id: string
  type: QuestionType
  question: string
  points: number
  required?: boolean
  explanation?: string
  sectionId?: string
  order?: number
  shuffleAnswers?: boolean // New field for answer shuffling
  tags?: string[] // Question tags
  difficulty?: "easy" | "medium" | "hard" // For adaptive timing
  estimatedTime?: number // Estimated time in seconds
  keywords?: string[] // For search and categorization
  // New public/private settings
  isPublic?: boolean
  publicScope?: "organization" | "global" // Organization-only or global contribution
  createdBy?: string
  organizationId?: string
  contributionAllowed?: boolean // Allow others to use this question
}

export type QuestionType =
  | "multiple-choice"
  | "multiple-select"
  | "true-false"
  | "fill-blank"
  | "short-answer"
  | "essay"
  | "matching"
  | "ordering"

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice"
  options: string[]
  correctAnswer: number
}

export interface MultipleSelectQuestion extends BaseQuestion {
  type: "multiple-select"
  options: string[]
  correctAnswers: number[]
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true-false"
  correctAnswer: boolean
}

export interface FillBlankQuestion extends BaseQuestion {
  type: "fill-blank"
  correctAnswers: string[]
  caseSensitive?: boolean
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short-answer"
  maxLength?: number
  keywords?: string[]
}

export interface EssayQuestion extends BaseQuestion {
  type: "essay"
  minWords?: number
  maxWords?: number
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching"
  leftItems: string[]
  rightItems: string[]
  correctMatches: { [key: number]: number }
}

export interface OrderingQuestion extends BaseQuestion {
  type: "ordering"
  items: string[]
  correctOrder: number[]
}

export type Question =
  | MultipleChoiceQuestion
  | MultipleSelectQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | ShortAnswerQuestion
  | EssayQuestion
  | MatchingQuestion
  | OrderingQuestion

export interface CopyPasteSettings {
  allowCopyPaste: boolean
  showCopyStatusInResults: boolean
  maxViolations: number
  violationAction: "warning" | "end-exam"
  warningMessage?: string
  // Screenshot settings
  allowScreenshots: boolean
  screenshotDetection: boolean
  showScreenshotStatusInResults: boolean
  maxScreenshotViolations: number
  screenshotViolationAction: "warning" | "end-exam"
  screenshotWarningMessage?: string
}

export interface SecurityPreset {
  id: string
  name: string
  description: string
  category: string
  icon: string
  settings: CopyPasteSettings
  timeLimit?: number
  passingScore?: number
  shuffleQuestions?: boolean
  isCustom?: boolean
  // New versioning fields
  version: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  changelog?: PresetChangelogEntry[]
  // Analytics fields
  usageCount?: number
  lastUsed?: string
  tags?: string[]
}

export interface PresetChangelogEntry {
  version: string
  date: string
  changes: string[]
  author?: string
}

export interface PresetAnalytics {
  presetId: string
  presetName: string
  category: string
  usageCount: number
  lastUsed: string
  averageQuizScore?: number
  violationRate?: number
  completionRate?: number
  userFeedback?: number // 1-5 rating
}

export interface PresetCollection {
  id: string
  name: string
  description: string
  version: string
  createdAt: string
  presets: SecurityPreset[]
  author?: string
  tags?: string[]
}

// Enhanced tag interfaces for 2-level hierarchy
export interface QuestionTag {
  id: string
  name: string
  color: string
  category?: string
  parentId?: string // For sub-tags
  level: 1 | 2 // Tag level (1 = main, 2 = sub)
  icon?: string
  description?: string
}

export interface TagCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  tags: QuestionTag[]
  subCategories?: TagSubCategory[]
}

export interface TagSubCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  parentCategoryId: string
  tags: QuestionTag[]
}

export interface SectionTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  defaultTimeLimit?: number
  defaultPassingScore?: number
  suggestedQuestionTypes: QuestionType[]
  tags: string[]
  isBuiltIn: boolean
  createdAt: string
  usageCount?: number
}

export interface AdaptiveTimingSettings {
  enabled: boolean
  baseTimePerQuestion: number // seconds
  difficultyMultipliers: {
    easy: number
    medium: number
    hard: number
  }
  performanceAdjustment: boolean
  minTimePerQuestion: number
  maxTimePerQuestion: number
}

export interface SectionDependency {
  sectionId: string
  dependsOn: string[] // Array of section IDs that must be completed first
  minimumScore?: number // Minimum score required in dependency sections
  condition: "all" | "any" // Must complete all dependencies or any one
}

// Add new section interface
export interface QuizSection {
  id: string
  title: string
  description?: string
  timeLimit?: number
  passingScore?: number
  order: number
  questions: string[]
  showResults?: boolean
  allowReview?: boolean
  templateId?: string // Reference to section template
  dependencies?: string[] // Section IDs this section depends on
  minimumDependencyScore?: number
  dependencyCondition?: "all" | "any"
  adaptiveTimingEnabled?: boolean
  tags?: string[]
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  sections?: QuizSection[] // New sections array
  timeLimit?: number
  passingScore?: number
  shuffleQuestions?: boolean
  shuffleAnswers?: boolean // Global answer shuffling setting
  shuffleSections?: boolean // New: randomize section order
  showResults?: boolean
  copyPasteSettings?: CopyPasteSettings
  createdAt: string
  // Section-specific settings
  sectionBasedScoring?: boolean
  sectionBasedTiming?: boolean
  allowSectionNavigation?: boolean
  continuousNumbering?: boolean // New field for question numbering
  // New adaptive timing settings
  adaptiveTimingSettings?: AdaptiveTimingSettings
  // Dependencies
  sectionDependencies?: SectionDependency[]
  // Tags
  availableTags?: QuestionTag[]
}

export interface QuizAttempt {
  id: string
  quizId: string
  answers: { [questionId: string]: any }
  score: number
  totalPoints: number
  completedAt: string
  timeSpent: number
  copyPasteViolations?: number
  copyPasteDetected?: boolean
  screenshotViolations?: number
  screenshotDetected?: boolean
  securityEvents?: SecurityEvent[]
  // Section-specific attempt data
  sectionScores?: { [sectionId: string]: { score: number; totalPoints: number; timeSpent: number } }
  currentSection?: string
  completedSections?: string[]
  sectionTimeSpent?: { [sectionId: string]: number }
}

export interface SecurityEvent {
  type: "copy" | "paste" | "screenshot" | "print-screen" | "context-menu" | "dev-tools"
  timestamp: string
  details?: string
}

// Add bulk operations interface
export interface BulkQuestionOperation {
  type: "assign-section" | "add-tags" | "remove-tags" | "set-difficulty" | "set-points" | "delete" | "set-public" | "set-private"
  questionIds: string[]
  payload: any // Operation-specific data
}

// Public question sharing interfaces
export interface PublicQuestionSettings {
  isPublic: boolean
  publicScope: "organization" | "global"
  contributionAllowed: boolean
  organizationId?: string
  createdBy: string
  approvalRequired?: boolean
}

export interface QuestionContribution {
  id: string
  questionId: string
  contributorId: string
  organizationId?: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
}
