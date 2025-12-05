import api from "@/lib/api";
import { Quiz, QuizAttempt, QuizQuestion } from "@/types";

export interface CreateQuizPayload {
  courseId: string;
  title: string;
  description: string;
  passingScore: number;
  questions: Array<{
    question: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export interface SubmitQuizPayload {
  quizId: string;
  answers: string[];
}

export const quizService = {
  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    const response = await api.get<Quiz[]>(`/courses/${courseId}/quizzes`);
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

  async createQuiz(payload: CreateQuizPayload): Promise<Quiz> {
    const { courseId, ...quizData } = payload;
    const response = await api.post<Quiz>(`/courses/${courseId}/quizzes`, quizData);
    return response.data;
  },
};
