import { createContext } from "react";
import { Socket } from "socket.io-client";

type wsContextType = {
  socket: Socket;
}

export const WsContext = createContext<wsContextType | null>(null);