// API Response Types
export interface TFUResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
  errors?: Array<{ key: string; value: string }>;
}

// Major Types
export interface Major {
  id: number;
  name: string;
  description?: string;
}

export interface CreateUpdateMajorDto {
  id: number;
  name: string;
  description?: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  majorId: number;
  courses?: Course[];
}

export interface CreateUpdateCategoryDto {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  majorId: number;
}

// Course Types
export enum CourseType {
  AS_LEVEL = 1,
  A2_LEVEL = 2,
  BOTH = 3
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  salePrice: number;
  categoryId: number;
  mentorId?: number;
  imageUrl?: string;
  courseType: CourseType;
  difficulty: number; // 1-5 stars
}

export interface CreateUpdateCourseDto {
  id: number;
  title: string;
  description: string;
  price: number;
  salePrice: number;
  categoryId: number;
  mentorId: number;
  imageUrl?: string;
  courseType: CourseType;
  difficulty: number; // 1-5 stars
}

// Topic Types
export interface Topic {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  courseId: number;
}

export interface CreateUpdateTopicDto {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  courseId: number;
}

// Lesson Types
export enum LessonType {
  VIDEO = 1,
  DOCUMENT = 2
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  duration: number;
  orderIndex: number;
  isFree: boolean;
  topicId: number;
  lessonType: LessonType;
  documentUrl?: string;
  documentContent?: string;
}

export interface CreateUpdateLessonDto {
  id: number;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  duration: number;
  orderIndex: number;
  isFree: boolean;
  topicId: number;
  lessonType?: number;
  documentUrl?: string;
  documentContent?: string;
}

// Paging Types
export interface PagingModel {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
}

export interface PagingResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface PagedResult<T> {
  listObjects: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}

// Payment Types
export enum PaymentStatus {
  PENDING = 1,
  SUCCESS = 2,
  CANCELLED = 3,
  EXPIRED = 4
}

export interface Payment {
  id: number;
  code: number;
  item: string;
  amount: number;
  qrCode: string;
  paymentUrl: string;
  paymentType: number;
  paymentStatus: PaymentStatus;
  packageId: number | null;
  package: any | null;
  userId: number;
  user: any | null;
  createdAt: string;
  updatedAt: string;
}

// Package Types
export enum PackageType {
  STARTER = 0,
  PREMIUM = 1
}

export interface Package {
  id: number;
  title: string;
  description: string;
  packageType: PackageType;
  price: number;
  duration: number;
  isActive: boolean;
  features: string;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePackageDto {
  title: string;
  description: string;
  packageType: PackageType;
  price: number;
  duration: number;
  isActive: boolean;
  features: string;
  isPopular: boolean;
}

// Event Types
export interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  videoUrl: string;
  meetingLink: string;
  commissionRate: number;
  imageUrls: string;
  amount: number;
  status: number;
  speakerId: number;
  speaker: any | null;
  createdAt: string;
  updatedAt: string;
}

// Event Ticket Types
export interface EventTicket {
  id: number;
  eventId: number;
  paymentId: number;
  userId: number;
  isActive: boolean;
  amount: number;
  needRefund: boolean;
  isRefunded: boolean;
  refundImageUrl?: string;
  event: Event;
  user: any | null;
  payment: Payment;
  createdAt: string;
  updatedAt: string;
}

// Entry Test Types
export interface EntryTestModel {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  questions?: EntryTestQuestionModel[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EntryTestQuestionModel {
  id: number;
  entryTestId: number;
  questionText: string;
  displayOrder: number;
  options?: EntryTestOptionModel[];
}

export interface EntryTestOptionModel {
  id: number;
  questionId: number;
  optionCode: string;
  optionText: string;
  displayOrder: number;
  subjectMappings?: EntryTestSubjectMappingModel[];
}

export interface EntryTestSubjectMappingModel {
  id: number;
  optionId: number;
  categoryId: number;
  weight: number;
  category?: Category;
}

export interface CreateUpdateEntryTestDto {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  questions: CreateUpdateEntryTestQuestionDto[];
}

export interface CreateUpdateEntryTestQuestionDto {
  id: number;
  questionText: string;
  displayOrder: number;
  options: CreateUpdateEntryTestOptionDto[];
}

export interface CreateUpdateEntryTestOptionDto {
  id: number;
  optionCode: string;
  optionText: string;
  displayOrder: number;
  categoryIds: number[];
  weight: number;
}

export interface SubmitEntryTestDto {
  entryTestId: number;
  answers: Record<number, string>; // questionId -> optionCode
}

export interface EntryTestResultDto {
  recommendedSubjects: SubjectRecommendationDto[];
  recommendedMajors: MajorRecommendationDto[];
}

export interface SubjectRecommendationDto {
  categoryId: number;
  categoryName: string;
  description: string;
  imageUrl: string;
  score: number;
}

export interface MajorRecommendationDto {
  majorId: number;
  majorName: string;
  description: string;
  score: number;
  relatedSubjects: string[];
}

// Blog Post Types
export enum BlogPostTargetAudience {
  AS_LEVEL = 1,
  A2_LEVEL = 2,
  BOTH = 3
}

export interface BlogPost {
  id: number;
  title: string;
  imageUrl?: string;
  targetAudience: BlogPostTargetAudience;
  authorId: number;
  tags?: string;
  isActive: boolean;
  author?: User;
  sections?: BlogPostSection[];
  comments?: BlogPostComment[];
  likes?: BlogPostLike[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostSection {
  id: number;
  title: string;
  content: string;
  orderIndex: number;
  blogPostId: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostComment {
  id: number;
  content: string;
  userId: number;
  blogPostId: number;
  parentCommentId?: number;
  user?: User;
  replies?: BlogPostComment[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostLike {
  id: number;
  userId: number;
  blogPostId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUpdateBlogPostDto {
  id: number;
  title: string;
  imageUrl?: string;
  targetAudience: BlogPostTargetAudience;
  tags: string[];
  sections: BlogPostSectionDto[];
}

export interface BlogPostSectionDto {
  id: number;
  title: string;
  content: string;
  orderIndex: number;
}

export interface CreateBlogPostCommentDto {
  blogPostId: number;
  content: string;
  parentCommentId?: number;
}

export interface BlogPostFilterDto {
  targetAudience?: BlogPostTargetAudience;
  tag?: string;
  keyword?: string;
  page: number;
  pageSize: number;
  isActive?: boolean;
}

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  avatar?: string;
}

// Event Ticket Status Types
export interface UserTicketStatusDto {
  hasTicket: boolean;
  ticketId?: number;
  paymentId?: number;
  paymentStatus?: PaymentStatus;
  paymentUrl?: string;
  amount?: number;
  createdAt?: string;
  isExpired?: boolean;
  minutesRemaining?: number;
}