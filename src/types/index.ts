// Authentication Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Course Types
export interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  content: string;
  order: number;
}

export interface Batch {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  instructor: string;
  tags: string[];
  lessons: Lesson[];
  batches: Batch[];
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  success: boolean;
  data: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Enrollment Types
export interface Enrollment {
  _id: string;
  studentId: string;
  courseId: string;
  batchId: string;
  status: "active" | "completed" | "dropped";
  progress: number;
  completedLessons: string[];
  enrollmentDate: string;
  completionDate?: string;
}

// Assignment Types
export interface Assignment {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  _id: string;
  assignmentId: string;
  studentId: string;
  answer: string;
  fileLink?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
}

// Quiz Types
export interface QuizOption {
  _id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  _id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
}

export interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  createdAt: string;
}

export interface QuizAttempt {
  _id: string;
  quizId: string;
  studentId: string;
  answers: string[];
  score: number;
  passed: boolean;
  attemptedAt: string;
}

// Auth State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
