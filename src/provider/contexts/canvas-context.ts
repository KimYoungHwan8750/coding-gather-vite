import { createContext } from "react";
import { CanvasData } from "shared-coding-gather";

type CanvasContextType = {
  canvas: CanvasData
}
export const CanvasContext = createContext<CanvasContextType | null>(null);