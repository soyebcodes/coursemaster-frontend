import api from "@/lib/api";

export interface PaymentSessionResponse {
  url: string;
  sessionId: string;
}

export interface Order {
  id: string;
  courseId: string;
  courseName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

export const paymentService = {
  async createPaymentSession(courseId: string): Promise<PaymentSessionResponse> {
    const response = await api.post<PaymentSessionResponse>('/payments/create-session', { courseId });
    return response.data;
  },

  async validatePayment(transactionId: string): Promise<{ success: boolean; order: Order }> {
    const response = await api.get(`/payments/validate?tran_id=${transactionId}`);
    return response.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/payments/orders');
    return response.data;
  },
};
