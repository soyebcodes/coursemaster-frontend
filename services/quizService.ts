import api from "@/lib/api";
import { Quiz, QuizAttempt } from "@/types";

export interface SubmitQuizPayload {
  quizId: string;
  answers: string[];
}

export const quizService = {
  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    const response = await api.get<Quiz[]>(`/quizzes?courseId=${courseId}`);
    return response.data;
  },

  async getQuizById(quizId: string): Promise<Quiz> {
    const response = await api.get<Quiz>(`/quizzes/${quizId}`);
    return response.data;
  },

  async submitQuiz(payload: SubmitQuizPayload): Promise<QuizAttempt> {
    const response = await api.post<QuizAttempt>(
      `/quizzes/${payload.quizId}/submit`,
      {
        answers: payload.answers,
      }
    );
    return response.data;
  },

  async getMyAttempt(quizId: string): Promise<QuizAttempt | null> {
    try {
      const response = await api.get<QuizAttempt>(
        `/quizzes/${quizId}/myattempt`
      );
      return response.data;
    } catch {
      return null;
    }
  },

  async getAttempts(quizId: string): Promise<QuizAttempt[]> {
    const response = await api.get<QuizAttempt[]>(
      `/quizzes/${quizId}/attempts`
    );
    return response.data;
  },
};
