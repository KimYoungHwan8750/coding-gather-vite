import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { ChatBubbleIcon, CursorArrowIcon, EraserIcon, HandIcon, MagnifyingGlassIcon, MoveIcon, Pencil1Icon, ReloadIcon, ResetIcon, ScissorsIcon, ZoomInIcon, ZoomOutIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils";
import { AppConstant, SearchPayload } from "shared-coding-gather";
import { useWs } from "@/hooks/use-websocket";
import { useCanvasSelector } from "@/hooks/use-canvas";
import { setPending, setUrl } from "@/store/canvas-slice";
import { useDispatch } from "react-redux";

export default function Canvas() {
  const nodeRef = useRef<HTMLCanvasElement>(null);
  const canvasSelector = useCanvasSelector();
  const dispatch = useDispatch();
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap | null>(null);
  useEffect(() => {
    const drawImage = async () => {
      const canvas = nodeRef.current;
      if(canvas && imageBitmap) {
        const ctx = canvas.getContext('2d');
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
          if(ctx) {
          ctx.drawImage(imageBitmap, 0, 0);
        }
      }
    }
    dispatch(setPending(false));
    drawImage();
  }, [imageBitmap]);

  return (
    <div
      className="outline outline-1 w-full h-full flex flex-col overflow-y-auto"
    >
      <SearchBarContainer setImageBitmap={setImageBitmap}/>
      { canvasSelector.pending && <div className="w-full h-full flex items-center justify-center">Loading...</div> }
        <canvas className={canvasSelector.pending ? "hidden" : ""}
          ref={nodeRef}
        ></canvas>
      
    </div>
  )
}

type SearchBarContainerProps = {
  setImageBitmap: (imageBitmap: ImageBitmap) => void
}
function SearchBarContainer(props: SearchBarContainerProps) {
  const canvasSelector = useCanvasSelector();
  const dispatch = useDispatch();
  const fetchImage = async (url: string) => {
    dispatch(setPending(true));
    const domain = "http://localhost:3000/search";
    const body: SearchPayload = {
      url
    };
    const response = await fetch(domain, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const blob = await response.arrayBuffer();
    const imageBitmap = await window.createImageBitmap(new Blob([blob], {type: "image/png"}));
    props.setImageBitmap(imageBitmap);
  }
  return (
    <div>
      <div className="w-full h-20 bg-indigo-200 shadow flex items-center p-5 gap-2">
        <SearchBar/>
        <MagnifyingGlassIcon
          onClick={() => fetchImage(canvasSelector.url)}
          className="h-8 bg-white px-2 rounded-lg box-content cursor-pointer shadow-lg outline outline-1 outline-black/10 hover:outline-1 hover:outline hover:outline-black/20"
        />
      </div>
      <CanvasToolbar></CanvasToolbar>
    </div>
  )
}

function SearchBar() {
  const searchBarRef = useRef<HTMLTextAreaElement>(null);
  const canvasSelector = useCanvasSelector();
  const dispatch = useDispatch();
  const ws = useWs();
  useEffect(() => {
    const searchBarNode = searchBarRef.current;
    if(!searchBarNode) return;
    const handleKeydown = (evt: KeyboardEvent) => {
      if(evt.key === "Enter") {
        evt.preventDefault();
        ws.socket.emit(AppConstant.websocketEvent.SEARCH, searchBarNode.value);
      }
    }
    searchBarNode.addEventListener("keydown", handleKeydown);
    return () => {
      searchBarNode.removeEventListener("keydown", handleKeydown);
    }
  }, [])
  return(
    <textarea 
    ref={useCallback((node: HTMLTextAreaElement) => {
      searchBarRef.current = node;
    }, [])}
    onChange={(evt) => {
      dispatch(setUrl(evt.target.value));
    }}
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