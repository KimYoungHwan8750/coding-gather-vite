import { WsContext } from "@/provider/contexts/websocket-context";
import { useContext } from "react";

export function useWs() {
  const context = useContext(WsContext);
  if (!context) {
    throw new Error("useWs는 반드시 wsContext 하위에서 사용되어야 합니다.");
  }
  return context;
}