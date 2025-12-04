import api from "@/lib/api";
import { Enrollment } from "@/types";

export const enrollmentService = {
  async getUserEnrollments(): Promise<Enrollment[]> {
    const response = await api.get<{
      data: Array<{
        _id: string;
        student: string;
        course: { _id: string; title: string; description: string };
        status: "active" | "completed" | "dropped";
        progress: any; // backend uses an array; we only care about percentageCompleted
        percentageCompleted: number;
        enrolledAt: string;
        // other fields omitted
      }>;
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/students/enrollments");

    // Normalize backend shape into our Enrollment interface
    return response.data.data.map((item) => ({
      _id: item._id,
      studentId: item.student,
      courseId: item.course._id,
      batchId: "", // not provided by this endpoint
      status: item.status,
      progress: item.percentageCompleted ?? 0,
      completedLessons: [], // not provided; can be filled by another endpoint if needed
      enrollmentDate: item.enrolledAt,
      completionDate: undefined,
      courseTitle: item.course.title,
      courseDescription: item.course.description,
    }));
  },

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
