/**
 * 타입 정의 인덱스 파일
 * 모든 타입 정의들을 중앙에서 관리합니다.
 */

// API 관련 타입들
export type {
  ApiResponse,
  PaginationParams,
  PaginationResponse,
  UserWithCounts,
  CreateUserRequest,
  UpdateUserRequest,
  ChildWithAge,
  CreateChildRequest,
  UpdateChildRequest,
  AssessmentResult,
  AssessmentWithResults,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  BoardWithCounts,
  PostWithDetails,
  CommentWithReplies,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  NewsWithDetails,
  CreateNewsRequest,
  UpdateNewsRequest,
  VideoWithDetails,
  CreateVideoRequest,
  UpdateVideoRequest,
  VideoRecommendationResponse,
  PostListQuery,
  NewsListQuery,
  VideoListQuery,
  AssessmentListQuery,
  ApiError
} from './api'

// 발달 체크 관련 타입들
export type {
  AssessmentQuestion,
  AssessmentAnalysis,
  DevelopmentProgress
} from './assessment'

// 발달 체크 상수들
export {
  DEVELOPMENT_CATEGORIES,
  DEVELOPMENT_LEVELS,
  DEVELOPMENT_MILESTONES
} from './assessment'

// NextAuth 관련 타입들 (이미 선언됨)
// export type {} from './next-auth'