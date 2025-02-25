import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export function useCanvasSelector() {
  const selector = useSelector((state: RootState) => state.canvas);
  return selector;
}