import { CanvasLogic } from "./canvas-logic";
import { ZoomLevelType, CanvasMouseState, AppConstant, ToolsType } from "shared-coding-gather";

type FieldPositionType = {
  x1: number
  x2: number
  y1: number
  y2: number
}

type DestinationPositionType = {
  x1: number
  x2: number
  y1: number
  y2: number
}

export class CanvasController {
  private readonly destination: DestinationPositionType;
  private readonly field: FieldPositionType;
  cursorSVG = `
<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
  <circle cx="5" cy="5" r="5" fill="white" stroke="black" stroke-width="1"/>
</svg>
`;
  canvasLogic: CanvasLogic = new CanvasLogic();
  ctx: CanvasRenderingContext2D | null = null;
  drawingCtx: CanvasRenderingContext2D | null = null;
  mouseState: CanvasMouseState = "up";
  tools: ToolsType = "hand";
  strokeWidth: number = 4;
  strokeColor: string = "white";
  imageData: ImageData | undefined = undefined;

  mousedownCallback: (evt: MouseEvent) => void = () => {};
  mousemoveCallback: (evt: MouseEvent) => void = () => {};
  mouseupCallback: (evt: MouseEvent) => void = () => {};

  constructor(
    private readonly container: HTMLDivElement,
    private readonly canvas: HTMLCanvasElement,
    private readonly drawingCanvas: HTMLCanvasElement,
    private readonly imageBitmap: ImageBitmap,
  ) {
    this.init();
    this.field = { x1: 0, x2: 0, y1: 0, y2: 0 };
    this.destination = { x1: 0, x2: 0, y1: 0, y2: 0 };
  }

  /**
   * grab 기능을 기준으로 컨트롤러를 초기화
   * 어차피 서버로부터 데이터를 받아와 동기화 작업을 함
   */
  init() {
    this.ctx = this.canvas.getContext("2d");
    this.drawingCtx = this.drawingCanvas.getContext("2d");
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    
    if (!this.ctx) {
      throw new Error("2d context가 지원되지 않습니다.");
    }
    if (!this.drawingCtx) {
      throw new Error("그리기 2d context가 지원되지 않습니다.");
    }

    if(!tempCtx) return;
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    tempCtx.drawImage(this.drawingCanvas, 0, 0);
    this.drawingCanvas.width = this.canvas.width
    this.drawingCanvas.height = this.canvas.height
    this.drawingCtx?.drawImage(tempCanvas, 0, 0, this.canvas.width, this.canvas.height);
    
    this.container.addEventListener("pointerdown", this.mousedownCallback);
    this.container.addEventListener("pointermove", this.mousemoveCallback);
    this.container.addEventListener("pointerup", this.mouseupCallback);
    // 드래그중 요소를 벗어났다가 들어왔을 때 드래그 이벤트 유지되는 현상 방지
    this.container.addEventListener("pointerleave", this.mouseupCallback);
    this.hand();
  }

  cleanup() {
    this.container.removeEventListener("pointerdown", this.mousedownCallback);
    this.container.removeEventListener("pointermove", this.mousemoveCallback);
    this.container.removeEventListener("pointerup", this.mouseupCallback);
    this.container.removeEventListener("pointerleave", this.mouseupCallback);
  }

  

  setState(state: ToolsType) {
    switch (state) {
      case "hand":
        this.hand();
        break;
      case "pencil":
        this.pencil();
        break;
      case "eraser":
        this.eraser();
        break;
      case "scissors":
        this.scissors();
        break;
      case "reload":
        this.reload();
        break;
      case "popStack":
        this.popStack();
        break;
      case "chatBubble":
        this.chatBubble();
        break;
    }
  }

  hand() {
    this.setCursor("grab");

    this.reassignEventListener("down", this.mousedownCallback, () => {
      this.canvasLogic.handDown();
    });

    this.reassignEventListener("move", this.mousemoveCallback, (evt: MouseEvent) => {
      if(this.canvasLogic.getMouseInfo().isDragging) {
        const adjustMoveRatio = 1;
        // 마우스 진행 방향과 반대로 이미지를 이동시켜서 당기는 효과 주기 위한 변수
        const invertNumber = -1;
        this.container.scrollBy({
            top: (evt.clientY - this.canvasLogic.getMouseInfo().currentY) * adjustMoveRatio * invertNumber,
            left: (evt.clientX - this.canvasLogic.getMouseInfo().currentX) * adjustMoveRatio * invertNumber,
          });
          this.setCursor("grabbing");
        }
        // 조건문 안에 들어가게 되면 최근 마우스 위치 동기화가 안 돼서 밖으로 빼야함함
        this.canvasLogic.handMove(evt.clientX, evt.clientY);
  });

    this.reassignEventListener("up", this.mouseupCallback, () => {
      this.canvasLogic.handUp();
      this.setCursor("grab");
    });

  }

  pencil() {
    this.setDrawingPointer({size: this.strokeWidth, color: "white"})

    this.reassignEventListener("down", this.mousedownCallback, (evt: MouseEvent) => {
      this.canvasLogic.pencilDown();
      this.draw({offsetX: evt.offsetX, offsetY: evt.offsetY});
    });

    this.reassignEventListener("move", this.mousemoveCallback, (evt: MouseEvent) => {
      this.canvasLogic.pencilMove(evt.offsetX, evt.offsetY);
      if(this.canvasLogic.getMouseInfo().isDragging) {
        this.draw({offsetX: evt.offsetX, offsetY: evt.offsetY});
      }
    });

    this.reassignEventListener("up", this.mouseupCallback, () => {
      this.canvasLogic.handUp();
      this.setDrawingPointer({size: this.strokeWidth, color: "white"})
    });

  }

  draw({offsetX, offsetY}: {offsetX: number, offsetY: number}) {
    this.setDrawingPointer({size: this.strokeWidth, color: this.strokeColor});
    this.drawingCtx!.globalCompositeOperation = "source-over";
    this.drawingCtx?.beginPath();
    this.drawingCtx?.arc(offsetX, offsetY, this.strokeWidth, 0, 2 * Math.PI);
    this.drawingCtx?.fill();
  }

  setStrokeWidth(size: number) {
    this.strokeWidth = size;
    this.setDrawingPointer({size: size});
  }

  setStrokeColor(color: string) {
    this.strokeColor = color;
    this.drawingCtx!.fillStyle = color;
  }

  eraser() {
    this.reassignEventListener("down", this.mousedownCallback, () => {
      this.canvasLogic.eraserDown();
    });

    this.reassignEventListener("move", this.mousemoveCallback, (evt: MouseEvent) => {
      this.canvasLogic.eraserMove(evt.offsetX, evt.offsetY);
      if(this.canvasLogic.getMouseInfo().isDragging) {
        this.erase({offsetX: evt.offsetX, offsetY: evt.offsetY});
      }
    });

    this.reassignEventListener("up", this.mouseupCallback, () => {
      this.canvasLogic.eraserUp();
    });
  }

  erase({offsetX, offsetY}: {offsetX: number, offsetY: number}) {
    this.setDrawingPointer({size: this.strokeWidth, color: "red"});
    this.drawingCtx!.globalCompositeOperation = "destination-out";
    this.drawingCtx?.beginPath();
    this.drawingCtx?.arc(offsetX, offsetY, this.strokeWidth, 0, 2 * Math.PI);
    this.drawingCtx?.fill();
  }

  zoom(zoomLevel: ZoomLevelType) {
    console.log(zoomLevel)
    if(zoomLevel > AppConstant.maxZoomLevel) return;
    if(zoomLevel < AppConstant.minZoomLevel) return;
    // zoomLevel당 20%씩 확대
    const zoomRatio = 0.2;

    let scale = 1 + zoomLevel * zoomRatio;
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = this.imageBitmap.width * scale;
    this.canvas.height = this.imageBitmap.height * scale;
    // this.drawingCanvas.width = this.imageBitmap.width * scale;
    // this.drawingCanvas.height = this.imageBitmap.height * scale;
    this.ctx?.drawImage(this.imageBitmap, 0, 0, this.imageBitmap.width * scale, this.imageBitmap.height * scale);
    
  }

  scissors() {

  }

  reload() {

  }

  popStack() {

  }

  chatBubble() {

  }

  reassignEventListener(state: CanvasMouseState, oldEvent: any, newEvent: any) {
    if(state === "down") {
      this.container.removeEventListener("pointerdown", oldEvent);
      this.container.addEventListener("pointerdown", newEvent);
      this.mousedownCallback = newEvent;
    } else if(state === "move") {
      this.container.removeEventListener("pointermove", oldEvent);
      this.container.addEventListener("pointermove", newEvent);
      this.mousemoveCallback = newEvent;
    } else if(state === "up") {
      this.container.removeEventListener("pointerup", oldEvent);
      this.container.removeEventListener("pointerleave", oldEvent);
      this.container.addEventListener("pointerup", newEvent);
      this.container.addEventListener("pointerleave", newEvent);
      this.mouseupCallback = newEvent;
    }
  }

  /**
   * @param cursor https://developer.mozilla.org/docs/Web/CSS/cursor 참조
   */
  setCursor(cursor: string) {
    this.container.style.cursor = cursor;
  }

  private convertSvgToDataUrl(svg: string) {
    const encodedSVG = window.encodeURIComponent(svg);
    const dataURL = `data:image/svg+xml,${encodedSVG}`;
    return dataURL;
  }

  setDrawingPointer({size, color}: {size: number, color?: string}) {
    const containerSize = size * 2 + 2;
    const strokeWidth = size > 3 ? 2 : 1;
    const sizeWithStroke = size + (strokeWidth / 2);
    const cursorSVG = `
<svg width="${containerSize}" height="${containerSize}" viewBox="0 0 ${containerSize} ${containerSize}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${sizeWithStroke}" cy="${sizeWithStroke}" r="${size}" fill="${color || "white"}" stroke="black" stroke-width="${strokeWidth}"/>
</svg>
`;
    this.cursorSVG = cursorSVG;
    this.setCursor(`url(${this.convertSvgToDataUrl(cursorSVG)}) ${size} ${size}, auto`);
  }

}