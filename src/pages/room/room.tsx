import { WebSocketProvider } from "@/provider/websocket-provider";
import { ReactNode } from "react";
import Canvas from "@/pages/room/canvas";
import TextEditor from "@/pages/room/editor";
import { EditorFeatureProvider } from "@/provider/editor-provider";
import { SharingAreaProvider } from "@/provider/sharing-area-provider";
export default function Room() {
  return (
    <SharingAreaProvider>
      <EditorFeatureProvider>
        <WebSocketProvider>
          <AppContainer>
            <Canvas></Canvas>
            <EditorArea>
              <TextEditor direction="top"></TextEditor>
              <TextEditor direction="bottom"></TextEditor>
            </EditorArea>
          </AppContainer>
        </WebSocketProvider>
      </EditorFeatureProvider>
    </SharingAreaProvider>
  );
}

function AppContainer({children}: {children: ReactNode}) {
  return (
    <div className="w-full h-screen flex">
      {children}
    </div>

  )
}

function EditorArea({children}: {children: ReactNode}) {
  return (
    <div className="w-full h-full flex flex-col">
      {children}
    </div>
  )
}