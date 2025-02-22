import { ReactNode, useEffect, useRef, useState } from "react"
import { useWs } from "@/provider/websocket-provider";
import { SearchMessage } from "@/lib/ws-frame-generator";
import { useSharingArea } from "@/provider/sharing-area-provider";
import { ChatBubbleIcon, CursorArrowIcon, EraserIcon, HandIcon, MagnifyingGlassIcon, MoveIcon, Pencil1Icon, ReloadIcon, ResetIcon, ScissorsIcon, ZoomInIcon, ZoomOutIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils";

export default function Canvas() {
  const nodeRef = useRef<HTMLCanvasElement>(null);
  const SharingArea = useSharingArea();
  const ws = useWs();

  useEffect(() => {
    const canvas = nodeRef.current;
    if(canvas) {
      const ctx = canvas.getContext('2d');
      if(SharingArea.bitmap) {
        canvas.width = SharingArea.bitmap.width;
        canvas.height = SharingArea.bitmap.height;
        if(ctx) {
          ctx.drawImage(SharingArea.bitmap, 0, 0);
        }
      }
    }
}, [SharingArea.bitmap])

  return (
    <div
      className="outline outline-1 w-full h-full flex flex-col overflow-y-auto"
    >
      <SearchBarContainer/>
      { SharingArea.isPending ? (
        <div className="w-full h-full flex items-center justify-center">Loading...</div>
      ) : (
        <canvas ref={nodeRef}></canvas>
      )}
    </div>
  )
}


function SearchBarContainer() {
  const SharingArea = useSharingArea();
  const ws = useWs();
  const getPage = async (url: string) => {
    SharingArea.setIsPending(true);
    ws.socket.emit("search", SearchMessage(url));
  }
  return (
    <div>
      <div className="w-full h-20 bg-indigo-200 shadow flex items-center p-5 gap-2">
        <SearchBar getPage={getPage}/>
        <MagnifyingGlassIcon
          onClick={() => getPage(SharingArea.url)}
          className="h-8 bg-white px-2 rounded-lg box-content cursor-pointer shadow-lg outline outline-1 outline-black/10 hover:outline-1 hover:outline hover:outline-black/20"
        />
      </div>
      <CanvasToolbar></CanvasToolbar>
    </div>
  )
}

function SearchBar({getPage}: {getPage: (url: string) => void}) {
  const searchBarRef = useRef<HTMLTextAreaElement>(null);
  const SharingArea = useSharingArea();
  useEffect(() => {
    if(searchBarRef.current) {
      searchBarRef.current.addEventListener("keydown", (evt) => {
        if(evt.key === "Enter") {
          evt.preventDefault();
          if(searchBarRef.current){
            getPage(searchBarRef.current.value);
          }
        }
      })
    }
  }, [searchBarRef.current])
  return(
    <textarea ref={searchBarRef}
      onChange={(evt) => SharingArea.setUrl(evt.target.value)}
      className="w-full h-8 shadow outline outline-1 outline-black/10 rounded-lg resize-none leading-8 px-2 focus:shadow-around"
    />
  )
}

function CanvasToolbar() {
  const [selected, setSelected] = useState(1);
  const tools = [
      <CanvasTool key={"cursor"} icon={<CursorArrowIcon/>} action={() => {}}/>,
      <CanvasTool key={"hand"} icon={<HandIcon/>} action={() => {}}/>,
      <CanvasTool key={"pencil"} icon={<Pencil1Icon/>} action={() => {}}/>,
      <CanvasTool key={"eraser"} icon={<EraserIcon/>} action={() => {}}/>,
      <CanvasTool key={"zoomIn"} icon={<ZoomInIcon/>} action={() => {}}/>,
      <CanvasTool key={"zoomOut"} icon={<ZoomOutIcon/>} action={() => {}}/>,
      <CanvasTool key={"scissors"} icon={<ScissorsIcon/>} action={() => {}}/>,
      <CanvasTool key={"reload"} icon={<ReloadIcon/>} action={() => {}}/>,
      <CanvasTool key={"popStack"} icon={<ResetIcon/>} action={() => {}}/>,
      <CanvasTool key={"chatBubble"} icon={<ChatBubbleIcon/>} action={() => {}}/>,
  ]
  return (
    <div className="w-full h-12 flex items-center gap-5 px-2 border-b-2 justify-center">
      {tools}
    </div>
  )
}


type CanvasToolProps = {
  icon: ReactNode
  action: () => void
  selected?: boolean
}
function CanvasTool({icon, action, selected}: CanvasToolProps) {
  let style = cn("w-5 h-5 flex justify-center items-center hover:bg-black/10 shadow p-1 box-content rounded-md cursor-pointer outline outline-1 outline-black/20");
  if (selected) {
    style = cn(style, "bg-accent");
  }
  const actionProxy = () => {
    action();
  }
  return (
    <div
      className={style}
      onClick={actionProxy}>
        <div className="w-full h-full flex justify-center items-center p-1 box-content hover:scale-110 transition-transform">
          {icon}
        </div>
    </div>
  )

}