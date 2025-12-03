import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector;

export const useAuth = () => {
  return useAppSelector((state: RootState) => state.auth);
};
