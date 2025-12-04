import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { courseService, FetchCoursesParams } from "@/services/courseService";
import { Course } from "@/types";

export interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    search: string;
    category: string;
    minPrice: number | null;
    maxPrice: number | null;
    sort: "price_asc" | "price_desc" | "newest";
  };
}

export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (params: FetchCoursesParams, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourses(params);
      return response;
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch courses"
      );
    }
  }
);

const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
  filters: {
    search: "",
    category: "",
    minPrice: null,
    maxPrice: null,
    sort: "newest",
  },
};

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    // ... existing reducers ...
    resetState: () => initialState,
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.page = 1; // Reset to first page when search changes
    },
    setCategory: (state, action) => {
      state.filters.category = action.payload;
      state.pagination.page = 1;
    },
    setPriceRange: (state, action) => {
      state.filters.minPrice = action.payload.minPrice;
      state.filters.maxPrice = action.payload.maxPrice;
      state.pagination.page = 1;
    },
    setSort: (state, action) => {
      state.filters.sort = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCourses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCourses.fulfilled, (state, action) => {
      state.loading = false;
      state.courses = action.payload.data || [];
      state.pagination = {
        page: action.payload.pagination?.page || 1,
        limit: action.payload.pagination?.limit || 12,
        total: action.payload.pagination?.total || 0,
        pages: action.payload.pagination?.pages || 1,
      };
      state.error = null;
    });
    builder.addCase(fetchCourses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setSearch,
  setCategory,
  setPriceRange,
  setSort,
  setPage,
  clearError,
} = courseSlice.actions;
export default courseSlice.reducer;
