"use client";
import { createContext, ReactNode, useContext, useState } from "react";

export type SharingAreaContextType = {
  url: string
  setUrl: (url: string) => void
  isPending: boolean
  setIsPending: (isPending: boolean) => void
  bitmap: ImageBitmap | null
  setBitmap: (bitmap: ImageBitmap) => void
} | null

export const SharingAreaContext = createContext<SharingAreaContextType>(null);

export function SharingAreaProvider({children}: {children: ReactNode}) {
  const [url, setUrl] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const sharingAreaContextValue = {url, setUrl, isPending, setIsPending, bitmap, setBitmap};
  return (
    <SharingAreaContext.Provider value={sharingAreaContextValue}>
      {children}
    </SharingAreaContext.Provider>
  )
}

export function useSharingArea() {
  const context = useContext(SharingAreaContext)
  if (!context) {
    throw new Error("useShareArea는 반드시 SharingAreaProvider 하위에서 사용되어야 합니다.");
  }
  return context;
}