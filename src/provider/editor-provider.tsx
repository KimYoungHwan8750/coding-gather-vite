import { createContext, ReactNode, useContext, useState } from "react";

type OnInputTextEvent = {
  payload: string
  setPayload: (payload: string) => void
}

type OnChangeLanguageEvent = {
  payload: string
  setLanguage: (language: string) => void
}

type EditorContextType = {
  onInputText: OnInputTextEvent
  onChangeLanguage: OnChangeLanguageEvent
} | null

const EditorFeatureContext = createContext<EditorContextType>(null);

export function EditorFeatureProvider({children}: {children: ReactNode}) {
  const [payload, setPayload] = useState<string>("");
  const [language, setLanguage] = useState<string>("");

  const onInputText: OnInputTextEvent = {
    payload,
    setPayload
  };
  const onChangeLanguage: OnChangeLanguageEvent = {
    payload: language,
    setLanguage
  }

  const editorContextValue = {onInputText, onChangeLanguage};
  return (
    <EditorFeatureContext.Provider value={editorContextValue}>
      {children}
    </EditorFeatureContext.Provider>
  )
}

export function useEditorFeature() {
  const context = useContext(EditorFeatureContext)
  if (!context) {
    throw new Error("useEditor는 반드시 EditorProvider 하위에서 사용되어야 합니다.");
  }
  return context;
}