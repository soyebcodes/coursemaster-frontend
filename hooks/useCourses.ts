import { useAppSelector } from "./useAuth";
import type { RootState } from "@/store";

export const useCourses = () => {
  return useAppSelector((state: RootState) => state.courses);
};
