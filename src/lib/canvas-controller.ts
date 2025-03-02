import { ToolsType } from "node_modules/shared-coding-gather/dist/types/constant";
import { CanvasLogic } from "./canvas-logic";

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

export type CanvasMouseState = "idle" | "down" | "move" | "up";
export class CanvasController {
  private readonly destination: DestinationPositionType;
  private readonly field: FieldPositionType;

  canvasLogic: CanvasLogic = new CanvasLogic();
  ctx: CanvasRenderingContext2D | null = null;
  mouseState: CanvasMouseState = "up";
  tools: ToolsType = "hand";

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
    if (!this.ctx) {
      throw new Error("2d context가 지원되지 않습니다.");
    }

    this.container.addEventListener("mousedown", this.mousedownCallback);
    this.container.addEventListener("mousemove", this.mousemoveCallback);
    this.container.addEventListener("mouseup", this.mouseupCallback);
    // 드래그중 요소를 벗어났다가 들어왔을 때 드래그 이벤트 유지되는 현상 방지
    this.container.addEventListener("mouseleave", this.mouseupCallback);
    this.hand();
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
      case "zoomIn":
        this.zoomIn();
        break;
      case "zoomOut":
        this.zoomOut();
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
    this.reassignEventListener("down", this.mousedownCallback, () => {
      this.canvasLogic.handDown();
    });

    this.reassignEventListener("move", this.mousemoveCallback, (evt: MouseEvent) => {
      if(this.canvasLogic.getMouseInfo().isDragging) {
      this.container.scrollBy({
          top: -(evt.clientY - this.canvasLogic.getMouseInfo().currentY) / 1,
          left: -(evt.clientX - this.canvasLogic.getMouseInfo().currentX) / 1,
        });
        this.container.style.cursor = "grabbing";
      }
      // 조건문 안에 들어가게 되면 최근 마우스 위치 동기화가 안 돼서 밖으로 뺌
      this.canvasLogic.handMove(evt.clientX, evt.clientY);
  });

    this.reassignEventListener("up", this.mouseupCallback, () => {
      this.canvasLogic.handUp();
      this.container.style.cursor = "grab";
    });

  }

  pencil() {
    this.reassignEventListener("down", this.mousedownCallback, (evt: MouseEvent) => {
      this.canvasLogic.pencilDown();
    });

    this.reassignEventListener("move", this.mousemoveCallback, (evt: MouseEvent) => {
      this.canvasLogic.pencilMove(evt.offsetX, evt.offsetY);
    });

    this.reassignEventListener("up", this.mouseupCallback, () => {
      this.canvasLogic.handUp();
    });

  }

  eraser() {
    this.reassignEventListener("down", this.mousedownCallback, () => {
      this.canvasLogic.eraserDown();
    });

    this.reassignEventListener("move", this.mousemoveCallback, (evt: MouseEvent) => {
      this.canvasLogic.eraserMove(evt.offsetX, evt.offsetY);
    });

    this.reassignEventListener("up", this.mouseupCallback, () => {
      this.canvasLogic.eraserUp();
    });
  }

  zoomIn() {
    
  }

  zoomOut() {

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
      this.container.removeEventListener("mousedown", oldEvent);
      this.container.addEventListener("mousedown", newEvent);
      this.mousedownCallback = newEvent;
    } else if(state === "move") {
      this.container.removeEventListener("mousemove", oldEvent);
      this.container.addEventListener("mousemove", newEvent);
      this.mousemoveCallback = newEvent;
    } else if(state === "up") {
      this.container.removeEventListener("mouseup", oldEvent);
      this.container.removeEventListener("mouseleave", oldEvent);
      this.container.addEventListener("mouseup", newEvent);
      this.container.addEventListener("mouseleave", newEvent);
      this.mouseupCallback = newEvent;
    }
  }

}