import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export function useEditorsSelector() {
  const selector = useSelector((state: RootState) => state.editors);
  return selector;
}