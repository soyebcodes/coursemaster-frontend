import api from "@/lib/api";
import { Assignment, AssignmentSubmission } from "@/types";

export interface SubmitAssignmentPayload {
  assignmentId: string;
  answer: string;
  fileLink?: string;
}

export const assignmentService = {
  async getAssignmentsByEnrollment(courseId: string): Promise<Assignment[]> {
    const response = await api.get<Assignment[]>(
      `/assignments?courseId=${courseId}`
    );
    return response.data;
  },

  async submitAssignment(
    payload: SubmitAssignmentPayload
  ): Promise<AssignmentSubmission> {
    const response = await api.post<AssignmentSubmission>(
      `/assignments/${payload.assignmentId}/submit`,
      {
        answer: payload.answer,
        fileLink: payload.fileLink,
      }
    );
    return response.data;
  },

  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    const response = await api.get<AssignmentSubmission[]>(
      `/assignments/${assignmentId}/submissions`
    );
    return response.data;
  },
};
