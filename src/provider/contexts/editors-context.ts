import { createContext } from "react";
import { EditorDatas } from "shared-coding-gather";

type EditorsContextType = {
  editor: EditorDatas
}

export const EditorsContext = createContext<EditorsContextType | null>(null);