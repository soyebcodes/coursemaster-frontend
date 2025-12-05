import api from "@/lib/api";
import { Course, CoursesResponse, Enrollment } from "@/types";

export interface FetchCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "newest";
}

export const courseService = {
  async getCourses(params: FetchCoursesParams): Promise<CoursesResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.category) queryParams.append("category", params.category);
    if (params.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.sort) queryParams.append("sort", params.sort);

    const response = await api.get<CoursesResponse>(
      `courses?${queryParams.toString()}`
    );
    return response.data;
  },

  async getCourseById(courseId: string): Promise<Course> {
    const response = await api.get<Course>(`courses/${courseId}`);
    return response.data;
  },

  async enrollCourse(courseId: string): Promise<Enrollment> {
    const response = await api.post<Enrollment>(
      `students/enrollments/${courseId}`
    );
    return response.data;
  },

  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await api.get<Enrollment[]>("/students/enrollments");
    return response.data;
  },

  async markLessonComplete(
    enrollmentId: string,
    lessonId: string
  ): Promise<void> {
    await api.put(`/students/enrollments/${enrollmentId}/lessons/${lessonId}`);
  },
};
