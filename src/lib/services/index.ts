/**
 * 서비스 레이어 인덱스 파일
 * 모든 서비스 클래스를 중앙에서 관리합니다.
 */

export { UserService } from './userService'
export { ChildService } from './childService'
export { AssessmentService } from './assessmentService'
export { BoardService } from './boardService'
export { VideoService } from './videoService'

// 서비스 관련 타입들도 함께 export
export type {
  CreateUserData,
  UpdateUserData
} from './userService'

export type {
  CreateChildData,
  UpdateChildData
} from './childService'

export type {
  CreateAssessmentData,
  AssessmentResultData,
  UpdateAssessmentData
} from './assessmentService'

export type {
  CreatePostData,
  UpdatePostData,
  PostListQuery
} from './boardService'

export type {
  CreateVideoData,
  UpdateVideoData,
  VideoListQuery
} from './videoService'