import { setLanguage, setText } from "@/store/editors-slice";
import { useState, useEffect, ReactNode, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { AppConstant, ChangeLanguageResponse, InputTextResponse, SearchResponse } from "shared-coding-gather";
import { io, Socket } from "socket.io-client";
import { WsContext } from "./contexts/websocket-context";
import { setPending } from "@/store/canvas-slice";

export const WebSocketProvider = ({children}: {children: ReactNode}) => {
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();
  let socket: Socket = useMemo(() => io("localhost/ws", {port: 80}), []);
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("connected");
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onInputText(payload: InputTextResponse) {
      console.log("INPUT_TEXT received:", payload);
      dispatch(setText(payload));
    }

    function onChangeLanguage(payload: ChangeLanguageResponse) {
      console.log("CHANGE_LANGUAGE received:", payload);
      dispatch(setLanguage(payload));
    }

    function onResponseData(res: SearchResponse) {
      dispatch(setPending(res.pending));
    }

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(AppConstant.websocketEvent.INPUT_TEXT, onInputText);
    socket.on(AppConstant.websocketEvent.CHANGE_LANGUAGE, onChangeLanguage);
    socket.on(AppConstant.websocketEvent.SEARCH, onResponseData);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(AppConstant.websocketEvent.INPUT_TEXT, onInputText);
      socket.off(AppConstant.websocketEvent.CHANGE_LANGUAGE, onChangeLanguage);
      socket.off(AppConstant.websocketEvent.SEARCH, onResponseData);
    };
  }, []);
  return <WsContext.Provider value={{socket}}>{children}</WsContext.Provider>;
}


