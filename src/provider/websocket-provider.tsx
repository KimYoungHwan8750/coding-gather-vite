import { useState, useEffect, createContext, ReactNode, useContext } from "react";
import { useEditorFeature } from "./editor-provider";
import { ParsedSearchPayload } from "shared-coding-gather";
import { useSharingArea } from "./sharing-area-provider";
import { io, Socket } from "socket.io-client";

type wsContextType = {
  socket: Socket;
}

const WsContext = createContext<wsContextType | null>(null);

export const WebSocketProvider = ({children}: {children: ReactNode}) => {
  const socket = io("localhost/ws", {port: 80});
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const EditorFeature = useEditorFeature();
  const SharingArea = useSharingArea();
  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      console.log("connected");

      socket.io.engine.on("upgrade", (transport: any) => {
        setTransport(transport.name);
      });
      console.log("T_T")
      socket.on("inputText", (data) => {
        EditorFeature.onInputText.setPayload(data);
      });
      socket.on("changeLanguage", EditorFeature.onChangeLanguage.setLanguage);
      socket.on("search", onResponseData);
    }

    function onResponseData(res: string) {
      const parsedPayload: ParsedSearchPayload = JSON.parse(res);
      if(parsedPayload.code === 404) {
        alert("404 Not Found");
      } else {
        const byteArray = Uint8Array.from(atob(parsedPayload.data), c => c.charCodeAt(0));
        const blob = new Blob([byteArray], {type: "image/png"});
        createImageBitmap(blob).then((bitMap) => {
          SharingArea.setBitmap(bitMap);
          SharingArea.setIsPending(false);
        })
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  return <WsContext.Provider value={{socket}}>{children}</WsContext.Provider>;
}

export function useWs() {
  const context = useContext(WsContext);
  if (!context) {
    throw new Error("useWs는 반드시 wsContext 하위에서 사용되어야 합니다.");
  }
  return context;
}
