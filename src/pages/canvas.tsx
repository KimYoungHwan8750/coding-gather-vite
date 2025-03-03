import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { ChatBubbleIcon, EraserIcon, HandIcon, MagnifyingGlassIcon, Pencil1Icon, ReloadIcon, ResetIcon, ScissorsIcon, ZoomInIcon, ZoomOutIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils";
import { AppConstant, SearchPayload } from "shared-coding-gather";
import { useWs } from "@/hooks/use-websocket";
import { canvasSelector, setPending, setStrokeColor, setStrokeWidth, setTools, setUrl, zoomIn, zoomOut } from "@/store/canvas-slice";
import { useDispatch, useSelector } from "react-redux";
import { CanvasLogic } from "@/lib/canvas-logic";
import { CanvasController } from "@/lib/canvas-controller";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasData = useSelector(canvasSelector)
  const dispatch = useDispatch();
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap | null>(null);
  const canvasController = useRef<CanvasController|null>(null);
  canvasController.current?.setState(canvasData.canvasData.tool);
  console.log(canvasData.canvasData.tool);

  useEffect(() => {
    const canvas = canvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const container = containerRef.current;
    if(canvas && drawingCanvas && container && imageBitmap) {
      canvasController.current = new CanvasController(container, canvas, drawingCanvas, imageBitmap);
      canvasController.current.zoom(canvasData.zoomLevel);
    }
    return () => {
      canvasController.current?.cleanup();
    }
  }, [imageBitmap, canvasData.zoomLevel])

  useEffect(() => {
    const drawImage = async () => {
      const canvas = canvasRef.current;
      console.log("/imagebitmap")
      if(canvas && imageBitmap) {
        const ctx = canvas.getContext('2d');
        const scale = 1;
        canvas.width = imageBitmap.width * scale;
        canvas.height = imageBitmap.height * scale;
          if(ctx) {
          ctx.drawImage(imageBitmap, 0, 0, imageBitmap.width * scale, imageBitmap.height * scale);
        }
      }
    }
    dispatch(setPending(false));
    drawImage();
  }, [imageBitmap]);

  useEffect(() => {
    canvasController.current?.setStrokeWidth(canvasData.strokeWidth)

  }, [canvasData.strokeWidth])

  useEffect(() => {
    canvasController.current?.setStrokeColor(canvasData.strokeColor);
  }, [canvasData.strokeColor])

  useEffect(() => {
    const fetchData = async () => {
      const imageBitmap = await CanvasLogic.mockFetchData();
      setImageBitmap(imageBitmap);
    }
    fetchData();
  }, [])

  return (
    <div
      className="flex flex-col w-1/2 h-full"
    >
      <SearchBarContainer setImageBitmap={setImageBitmap}/>
      { canvasData.canvasData.pending && <div className="w-full h-full flex items-center justify-center">Loading...</div> }
      <div
        ref={containerRef}
        className={"w-full h-full relative overflow-auto bg-black/20"}
      >
        <canvas
          className={cn("", canvasData.canvasData.pending ? "hidden" : "")}
          ref={canvasRef}
        >
        </canvas>
        <canvas
          ref={drawingCanvasRef}
          className={"absolute top-0 left-0"}
        >
        </canvas>
      </div>
    </div>
  )
}

type SearchBarContainerProps = {
  setImageBitmap: (imageBitmap: ImageBitmap) => void
}
function SearchBarContainer(props: SearchBarContainerProps) {
  const canvasData = useSelector(canvasSelector);
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
    <div className="sticky top-0 w-full">
      <div className="w-full h-20 bg-indigo-200 shadow flex items-center p-5 gap-2">
        <SearchBar/>
        <MagnifyingGlassIcon
          onClick={() => fetchImage(canvasData.canvasData.url)}
          className="h-8 bg-white px-2 rounded-full box-content cursor-pointer shadow-lg outline outline-1 outline-black/10 hover:outline-1 hover:outline hover:outline-black/20"
        />
      </div>
      <CanvasToolbar></CanvasToolbar>
    </div>
  )
}

function SearchBar() {
  const searchBarRef = useRef<HTMLTextAreaElement>(null);
  const canvasData = useSelector(canvasSelector);
  const dispatch = useDispatch();
  const ws = useWs();
  useEffect(() => {
    const searchBarNode = searchBarRef.current;
    if(!searchBarNode) return;
    const handleKeydown = (evt: KeyboardEvent) => {
      if(evt.key === "Enter") {
        evt.preventDefault();
        ws.socket?.emit(AppConstant.websocketEvent.SEARCH, searchBarNode.value);
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
      className="text-sm bg-white w-full h-8 shadow outline outline-1 outline-black/10 rounded-full resize-none leading-8 px-4 focus:shadow-around"
    />
  )
}

function CanvasToolbar() {
  const dispatch = useDispatch();

  const tools = [
      <CanvasTool key={"hand"} icon={<HandIcon/>} action={() => dispatch(setTools("hand"))}/>,
      <CanvasTool key={"pencil"} icon={<PencilPopover/>} action={() => dispatch(setTools("pencil"))}/>,
      <CanvasTool key={"eraser"} icon={<EraserIcon/>} action={() => dispatch(setTools("eraser"))}/>,
      <CanvasTool key={"zoomIn"} icon={<ZoomInIcon/>} action={() => dispatch(zoomIn())}/>,
      <CanvasTool key={"zoomOut"} icon={<ZoomOutIcon/>} action={() => dispatch(zoomOut())}/>,
      // <CanvasTool key={"scissors"} icon={<ScissorsIcon/>} action={() => dispatch(setTools("scissors"))}/>,
      <CanvasTool key={"reload"} icon={<ReloadIcon/>} action={() => dispatch(setTools("reload"))}/>,
      // <CanvasTool key={"popStack"} icon={<ResetIcon/>} action={() => dispatch(setTools("popStack"))}/>,
      <CanvasTool key={"chatBubble"} icon={<ChatBubbleIcon/>} action={() => dispatch(setTools("chatBubble"))}/>,
  ]
  return (
    <div className="w-full flex flex-wrap items-center gap-3 px-2 border-b-2 justify-center bg-white p-2">
      {tools}
    </div>
  )
}

function PencilPopover() {
  const dispatch = useDispatch();
  const canvasData = useSelector(canvasSelector);
  return (
    <Popover onOpenChange={(open) => console.log(open)}>
      <PopoverTrigger>
        <Pencil1Icon/>
      </PopoverTrigger>
      <PopoverContent>
        <div>
          <PencilPopoverRow>
            <label htmlFor="stroke-width">width</label>
            <input
              id="stroke-width"
              type="range"
              min={1}
              max={24}
              value={canvasData.strokeWidth}
              onChange={(e) => dispatch(setStrokeWidth(e.target.valueAsNumber))}
            >
            </input>
            <span>{canvasData.strokeWidth}</span>
          </PencilPopoverRow>
          <PencilPopoverRow>
            <label htmlFor="stroke-color">color</label>
            <input
              className="rounded-4xl"
              id="stroke-color"
              type="color"
              value={canvasData.strokeColor}
              onChange={(e) => {
                dispatch(setStrokeColor(e.target.value));
              }}
            >
            </input>
          </PencilPopoverRow>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PencilPopoverRow({children}: {children: ReactNode}) {
  return (
    <div className="flex items-center gap-2">
      {children}
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