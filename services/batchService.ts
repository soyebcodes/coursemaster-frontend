import api from "@/lib/api";

export interface Batch {
  id: string;
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  schedule: string;
  maxStudents: number;
  currentStudents: number;
  isActive: boolean;
  instructorId: string;
  instructorName: string;
}

export interface CreateBatchData {
  name: string;
  startDate: string;
  endDate: string;
  schedule: string;
  maxStudents: number;
}

export const batchService = {
  async createBatch(courseId: string, data: CreateBatchData): Promise<Batch> {
    const response = await api.post<Batch>(`/batches/courses/${courseId}`, data);
    return response.data;
  },

  async getCourseBatches(courseId: string): Promise<Batch[]> {
    const response = await api.get<Batch[]>(`/batches/courses/${courseId}`);
    return response.data;
  },

  async updateBatch(courseId: string, batchId: string, data: Partial<CreateBatchData>): Promise<Batch> {
    const response = await api.put<Batch>(`/batches/courses/${courseId}/${batchId}`, data);
    return response.data;
  },

  async enrollInBatch(courseId: string, batchId: string): Promise<{ success: boolean }> {
    const response = await api.post(`/batches/courses/${courseId}/${batchId}/enroll`);
    return response.data;
  },
};
