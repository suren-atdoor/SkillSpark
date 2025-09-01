export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  preferences?: UserPreferences
  stats?: UserStats
}

export interface UserPreferences {
  theme: "light" | "dark"
  notifications: boolean
  emailUpdates: boolean
  language: string
}

export interface UserStats {
  totalQuizzes: number
  averageScore: number
  totalTimeSpent: number
  streak: number
  level: number
  xp: number
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface QuizProgress {
  id: string
  userId: string
  quizId: string
  quizTitle: string
  currentQuestionIndex: number
  answers: { [questionId: string]: any }
  timeSpent: number
  currentSection?: string | null
  completedSections: string[]
  sectionTimeSpent: { [sectionId: string]: number }
  isCompleted: boolean
  score?: number
  totalPoints?: number
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}
