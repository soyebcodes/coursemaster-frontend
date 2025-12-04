import { useAppSelector } from "./useAuth";
import type { RootState } from "@/store";

export const useCourses = () => {
  return useAppSelector((state: RootState) => ({
    courses: state.courses.courses || [],
    loading: state.courses.loading || false,
    error: state.courses.error || null,
    pagination: state.courses.pagination || { page: 1, limit: 12, total: 0, pages: 1 },
    filters: state.courses.filters || {
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      sort: 'newest',
    },
  }));
};
