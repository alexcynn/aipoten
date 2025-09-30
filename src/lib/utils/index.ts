/**
 * 유틸리티 함수 인덱스 파일
 * 모든 유틸리티 함수들을 중앙에서 관리합니다.
 */

// 날짜 관련 유틸리티
export {
  calculateAgeInMonths,
  getAgeGroup,
  formatAgeInMonths,
  formatDateToString,
  parseStringToDate,
  formatRelativeTime,
  formatDateToKorean,
  formatDateTimeToKorean,
  calculateNextAssessmentDate,
  isFullTerm,
  getPrematureCategory,
  isAgeInRange,
  getDaysBetweenDates
} from './dateUtils'

// 발달 체크 관련 유틸리티
export {
  calculateDevelopmentLevel,
  getDevelopmentLevelInfo,
  getDevelopmentCategoryInfo,
  calculateOverallScore,
  identifyStrengths,
  identifyAreasForImprovement,
  generateRecommendations,
  calculatePercentile,
  assessDevelopmentRisk,
  recommendNextAssessment,
  analyzeDevelopmentProgress,
  summarizeAssessmentResults,
  getDevelopmentGoals
} from './assessmentUtils'

// 유효성 검사 관련 유틸리티
export {
  isValidEmail,
  isValidPassword,
  isValidKoreanName,
  isValidPhoneNumber,
  isValidBirthDate,
  isValidWeight,
  isValidHeight,
  isValidGestationalWeeks,
  isValidBirthWeight,
  isValidUrl,
  extractYouTubeId,
  isValidScore,
  isValidTextLength,
  isValidFileSize,
  isValidImageFile,
  combineValidationResults
} from './validationUtils'

// 포맷팅 관련 유틸리티
export {
  formatNumber,
  formatWeight,
  formatHeight,
  formatScore,
  formatPercentile,
  formatDuration,
  formatViewCount,
  formatFileSize,
  truncateText,
  stripHtmlTags,
  convertNewlinesToBr,
  formatPhoneNumber,
  formatGender,
  formatUserRole,
  formatNewsCategory,
  formatVideoPlatform,
  formatDifficulty,
  formatDevelopmentCategory,
  formatDevelopmentLevel,
  formatAssessmentStatus,
  formatTags,
  formatPriority,
  formatPrematureStatus,
  formatGrowthPercentile
} from './formatUtils'