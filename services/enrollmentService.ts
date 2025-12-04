import api from "@/lib/api";
import { Enrollment } from "@/types";

export const enrollmentService = {
  async getEnrollmentById(enrollmentId: string): Promise<Enrollment> {
    const response = await api.get<Enrollment>(
      `/students/enrollments/${enrollmentId}`
    );
    return response.data;
  },

  async markLessonComplete(
    enrollmentId: string,
    lessonId: string
  ): Promise<Enrollment> {
    const response = await api.put<Enrollment>(
      `/students/enrollments/${enrollmentId}/lessons/${lessonId}`
    );
    return response.data;
  },

  async enrollCourse(courseId: string): Promise<Enrollment> {
    const response = await api.post<Enrollment>(
      `/students/enrollments/${courseId}`
    );
    return response.data;
  },
};
