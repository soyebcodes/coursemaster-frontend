import api from "@/lib/api";
import { Assignment, AssignmentSubmission } from "@/types";

export interface SubmitAssignmentPayload {
  assignmentId: string;
  submissionText: string;
  submissionLink?: string;
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
        submissionText: payload.submissionText,
        submissionLink: payload.submissionLink,
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
