import { ReactNode } from "react";
import "./App.css"
import Canvas from "./pages/canvas";
import TextEditor from "./pages/editor";
import { WebSocketProvider } from "./provider/websocket-provider";
import { Provider } from 'react-redux'
import { store } from "./store/store";
export function App() {
  return (
      <Provider store={store}>
        <WebSocketProvider>
          <AppContainer>
            <Canvas></Canvas>
            <EditorArea>
              <TextEditor direction="top"></TextEditor>
              <TextEditor direction="bottom"></TextEditor>
            </EditorArea>
          </AppContainer>
        </WebSocketProvider>
      </Provider>
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
    <div className="w-1/2 h-full flex flex-col">
      {children}
    </div>
  )
}