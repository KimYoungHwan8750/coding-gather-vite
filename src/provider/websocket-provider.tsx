import { setBase64FromBinary, setBinary } from "@/store/canvas-slice";
import { setLanguage, setText } from "@/store/editors-slice";
import { useState, useEffect, ReactNode } from "react";
import { useDispatch } from "react-redux";
import { AppConstant, ChangeLanguageResponse, InputTextResponse, SearchResponse } from "shared-coding-gather";
import { io } from "socket.io-client";
import { WsContext } from "./contexts/websocket-context";



export const WebSocketProvider = ({children}: {children: ReactNode}) => {
  const socket = io("localhost/ws", {port: 80});
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      console.log("connected");

      socket.on(AppConstant.websocketEvent.INPUT_TEXT, (payload: InputTextResponse) => {
        console.log(payload);
        dispatch(setText(payload));
      });
      socket.on(AppConstant.websocketEvent.CHANGE_LANGUAGE, (payload: ChangeLanguageResponse) => {
        console.log(payload);
        dispatch(setLanguage(payload));
      });
      socket.on(AppConstant.websocketEvent.SEARCH, onResponseData);
    }

    function onResponseData(res: SearchResponse) {
      if(res.code === 404) {
        alert(res.message);
      } else {
        dispatch(setBase64FromBinary(res.binary));
      }
    }

    function onDisconnect() {
      setIsConnected(false);
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


