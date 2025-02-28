import { setDataFromEditorData, setLanguage, setText } from "@/store/editors-slice";
import { useState, useEffect, ReactNode, useRef, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppConstant, ChangeLanguageResponse, FirstJoinResponse, InputTextResponse, SearchResponse } from "shared-coding-gather";
import { io, Socket } from "socket.io-client";
import { WsContext } from "./contexts/websocket-context";
import { setDataFromCanvasData, setPending } from "@/store/canvas-slice";

export const WebSocketProvider = ({children}: {children: ReactNode}) => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    if(!socket) {
      setSocket(io("localhost/ws", {port: 80}));
      return;
    }
    function onConnect() {
      console.log("connected");
    }

    function onDisconnect() {
    }

    function onInputText(payload: InputTextResponse) {
      console.log("INPUT_TEXT received:", payload);
      dispatch(setText(payload));
    }

    function onChangeLanguage(payload: ChangeLanguageResponse) {
      console.log("CHANGE_LANGUAGE received:", payload);
      dispatch(setLanguage(payload));
    }

    function onSearch(res: SearchResponse) {
      dispatch(setPending(res.pending));
    }

    function onFirstJoin(res: FirstJoinResponse) {
      dispatch(setDataFromEditorData(res.topEditorData));
      dispatch(setDataFromEditorData(res.bottomEditorData));
      dispatch(setDataFromCanvasData(res.canvasData));
    }
    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(AppConstant.websocketEvent.INPUT_TEXT, onInputText);
    socket.on(AppConstant.websocketEvent.CHANGE_LANGUAGE, onChangeLanguage);
    socket.on(AppConstant.websocketEvent.SEARCH, onSearch);
    socket.on(AppConstant.websocketEvent.FIRST_JOIN, onFirstJoin);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(AppConstant.websocketEvent.INPUT_TEXT, onInputText);
      socket.off(AppConstant.websocketEvent.CHANGE_LANGUAGE, onChangeLanguage);
      socket.off(AppConstant.websocketEvent.SEARCH, onSearch);
      socket.off(AppConstant.websocketEvent.FIRST_JOIN, onFirstJoin);
  };
  }, [socket]);
  return <WsContext.Provider value={{socket}}>{children}</WsContext.Provider>;
}



