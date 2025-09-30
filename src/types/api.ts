import { Role, Gender, DevelopmentCategory, DevelopmentLevel, AssessmentStatus, NewsCategory, VideoPlatform, Difficulty } from '@prisma/client'

// API Response 공통 타입
export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  error?: string
  data?: T
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginationResponse {
  page: number
  limit: number
  total: number
  totalPages: number
}

// User 관련 타입
export interface UserWithCounts {
  id: string
  email: string
  name?: string | null
  role: Role
  avatar?: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    children: number
    posts: number
    comments: number
  }
}

export interface CreateUserRequest {
  email: string
  password: string
  name?: string
  role?: Role
}

export interface UpdateUserRequest {
  name?: string
  avatar?: string
}

// Child 관련 타입
export interface ChildWithAge {
  id: string
  name: string
  birthDate: Date
  gender: Gender
  gestationalWeeks?: number | null
  birthWeight?: number | null
  currentHeight?: number | null
  currentWeight?: number | null
  medicalHistory?: string | null
  familyHistory?: string | null
  treatmentHistory?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  ageInMonths: number
  _count?: {
    assessments: number
  }
}

export interface CreateChildRequest {
  name: string
  birthDate: string
  gender: Gender
  gestationalWeeks?: number
  birthWeight?: number
  currentHeight?: number
  currentWeight?: number
  medicalHistory?: string
  familyHistory?: string
  treatmentHistory?: string
  notes?: string
}

export interface UpdateChildRequest {
  name?: string
  birthDate?: string
  gender?: Gender
  gestationalWeeks?: number
  birthWeight?: number
  currentHeight?: number
  currentWeight?: number
  medicalHistory?: string
  familyHistory?: string
  treatmentHistory?: string
  notes?: string
}

// Assessment 관련 타입
export interface AssessmentResult {
  id: string
  category: DevelopmentCategory
  score: number
  level: DevelopmentLevel
  feedback?: string | null
  recommendations?: string | null
}

export interface AssessmentWithResults {
  id: string
  childId: string
  ageInMonths: number
  status: AssessmentStatus
  completedAt?: Date | null
  createdAt: Date
  child?: {
    id: string
    name: string
    birthDate?: Date
  }
  results: AssessmentResult[]
}

export interface CreateAssessmentRequest {
  childId: string
  ageInMonths: number
}

export interface UpdateAssessmentRequest {
  results?: {
    category: DevelopmentCategory
    score: number
    feedback?: string
    recommendations?: string
  }[]
  status?: AssessmentStatus
}

// Board & Post 관련 타입
export interface BoardWithCounts {
  id: string
  name: string
  description?: string | null
  order: number
  _count: {
    posts: number
  }
}

export interface PostWithDetails {
  id: string
  title: string
  content: string
  views: number
  isSticky: boolean
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name?: string | null
    role?: Role
  }
  board?: {
    id: string
    name: string
  }
  _count?: {
    comments: number
  }
  comments?: CommentWithReplies[]
}

export interface CommentWithReplies {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name?: string | null
    role: Role
  }
  replies?: CommentWithReplies[]
}

export interface CreatePostRequest {
  title: string
  content: string
}

export interface UpdatePostRequest {
  title?: string
  content?: string
}

export interface CreateCommentRequest {
  content: string
  parentId?: string
}

// News 관련 타입
export interface NewsWithDetails {
  id: string
  title: string
  summary: string
  content?: string
  imageUrl?: string | null
  category: NewsCategory
  tags?: string[]
  views: number
  isFeatured: boolean
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateNewsRequest {
  title: string
  summary: string
  content: string
  imageUrl?: string
  category: NewsCategory
  tags?: string[]
  isFeatured?: boolean
  isPublished?: boolean
}

export interface UpdateNewsRequest {
  title?: string
  summary?: string
  content?: string
  imageUrl?: string
  category?: NewsCategory
  tags?: string[]
  isFeatured?: boolean
  isPublished?: boolean
}

// Video 관련 타입
export interface VideoWithDetails {
  id: string
  title: string
  description: string
  videoUrl: string
  videoPlatform: VideoPlatform
  thumbnailUrl?: string | null
  duration?: number | null
  targetAgeMin: number
  targetAgeMax: number
  difficulty: Difficulty
  viewCount: number
  bookmarkCount: number
  priority: number
  createdAt: Date
  recommendationReason?: string
}

export interface CreateVideoRequest {
  title: string
  description: string
  videoUrl: string
  videoPlatform: VideoPlatform
  thumbnailUrl?: string
  duration?: number
  targetAgeMin: number
  targetAgeMax: number
  difficulty: Difficulty
  priority?: number
  isPublished?: boolean
}

export interface UpdateVideoRequest {
  title?: string
  description?: string
  videoUrl?: string
  videoPlatform?: VideoPlatform
  thumbnailUrl?: string
  duration?: number
  targetAgeMin?: number
  targetAgeMax?: number
  difficulty?: Difficulty
  priority?: number
  isPublished?: boolean
}

export interface VideoRecommendationResponse {
  child: {
    id: string
    name: string
    ageInMonths: number
  }
  videos: VideoWithDetails[]
  assessmentBased: boolean
}

// Query Parameters
export interface PostListQuery extends PaginationParams {
  search?: string
  boardId?: string
}

export interface NewsListQuery extends PaginationParams {
  category?: NewsCategory
  featured?: boolean
  search?: string
}

export interface VideoListQuery extends PaginationParams {
  ageInMonths?: number
  difficulty?: Difficulty
  search?: string
  recommended?: boolean
}

export interface AssessmentListQuery {
  childId?: string
}

// Error 타입
export interface ApiError {
  error: string
  code?: string
  details?: any
}