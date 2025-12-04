import api from "@/lib/api";
import { Course, Enrollment, AssignmentSubmission } from "@/types";

export interface AdminStats {
  totalCourses: number;
  totalUsers: number;
  studentCount: number;
  instructorCount: number;
  adminCount: number;
  totalEnrollments: number;
  completedEnrollments: number;
  activeEnrollments: number;
  avgProgress: number;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  instructor: string;
  lessons?: any[];
  batches?: any[];
}

export interface UpdateCoursePayload extends CreateCoursePayload {
  _id: string;
}

export interface CreateLessonPayload {
  courseId: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  order: number;
}

export interface CreateBatchPayload {
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  maxStudents?: number;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await api.get<{ stats: AdminStats }>("/admin/stats");
    return response.data.stats;
  },

  async getEnrollmentStats(): Promise<any> {
    const response = await api.get<any>("/admin/enrollments/stats");
    return response.data;
  },

  async getAllEnrollments(filters?: {
    courseId?: string;
    studentId?: string;
    status?: string;
  }): Promise<Enrollment[]> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append("courseId", filters.courseId);
    if (filters?.studentId) params.append("studentId", filters.studentId);
    if (filters?.status) params.append("status", filters.status);

    const response = await api.get<{ data: Enrollment[] }>(
      `/admin/enrollments?${params.toString()}`
    );
    return response.data.data;
  },

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    const response = await api.get<{ data: Enrollment[] }>(
      `/admin/enrollments?courseId=${courseId}`
    );
    return response.data.data;
  },

  async createCourse(payload: CreateCoursePayload): Promise<Course> {
    const response = await api.post<Course>("/admin/courses", payload);
    return response.data;
  },

  async updateCourse(payload: UpdateCoursePayload): Promise<Course> {
    const response = await api.put<Course>(
      `/admin/courses/${payload._id}`,
      payload
    );
    return response.data;
  },

  async deleteCourse(courseId: string): Promise<void> {
    await api.delete(`/admin/courses/${courseId}`);
  },

  async createLesson(payload: CreateLessonPayload): Promise<any> {
    const response = await api.post(`/admin/lessons`, payload);
    return response.data;
  },

  async updateLesson(
    lessonId: string,
    payload: Partial<CreateLessonPayload>
  ): Promise<any> {
    const response = await api.put(`/admin/lessons/${lessonId}`, payload);
    return response.data;
  },

  async deleteLesson(lessonId: string): Promise<void> {
    await api.delete(`/admin/lessons/${lessonId}`);
  },

  async createBatch(payload: CreateBatchPayload): Promise<any> {
    const response = await api.post(`/admin/batches`, payload);
    return response.data;
  },

  async updateBatch(
    batchId: string,
    payload: Partial<CreateBatchPayload>
  ): Promise<any> {
    const response = await api.put(`/admin/batches/${batchId}`, payload);
    return response.data;
  },

  async deleteBatch(batchId: string): Promise<void> {
    await api.delete(`/admin/batches/${batchId}`);
  },

  async getAssignmentSubmissions(
    assignmentId: string
  ): Promise<AssignmentSubmission[]> {
    const response = await api.get<AssignmentSubmission[]>(
      `/admin/submissions?assignmentId=${assignmentId}`
    );
    return response.data;
  },

  async gradeAssignment(
    submissionId: string,
    grade: number,
    feedback: string
  ): Promise<AssignmentSubmission> {
    const response = await api.post<AssignmentSubmission>(
      `/admin/submissions/${submissionId}/grade`,
      { grade, feedback }
    );
    return response.data;
  },
};
