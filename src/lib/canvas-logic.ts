
type MousePositionType = {
  beforeX: number
  beforeY: number
  currentX: number
  currentY: number
  isDragging: boolean
}

export class CanvasLogic {

  private readonly mouseInfo: MousePositionType

  constructor() {
    this.mouseInfo = { beforeX: 0, beforeY: 0, currentX: 0, currentY: 0, isDragging: false };
  }

  static async mockFetchData() {
    const response = await fetch("sample.jpg");
    const blob = await response.blob();
    const imageBitmap = await window.createImageBitmap(blob);
    return imageBitmap;
  }

  getMouseInfo() {
    return this.mouseInfo;
  }

  /**
   * @description 드래그 시작 위치를 기록합니다.
   */
  handDown() {
    this.mouseInfo.isDragging = true;
  }

  /**
   * @param clientX MouseEvent.offsetX
   * @param clientY MouseEvent.offsetX
   * @description 현재 위치를 기록합니다.
   */
  handMove(clientX: number, clientY: number) {
    this.mouseInfo.currentX = clientX;
    this.mouseInfo.currentY = clientY;
  }

  /**
   * @description 드래그 상태를 해제합니다.
   */
  handUp() {
    this.mouseInfo.isDragging = false;
  }

  /**
   * @description 현재 상태를 드래그 중으로 변경합니다.
   * @description 드래그 상태일 때 pencilDrag가 동작합니다.
   */
  pencilDown() {
    this.mouseInfo.isDragging = true;
  }

  /**
   * @param offsetX MouseEvent.offsetX
   * @param offsetY MouseEvent.offsetY
   * @description 선을 그리기 위해 현재 위치를 기록합니다.
   * @description canvas controller에서 드래그 중일 때만 동작하도록 구현됩니다.
   */
  pencilMove(offsetX: number, offsetY: number) {
    this.mouseInfo.currentX = offsetX;
    this.mouseInfo.currentY = offsetY;
  }

  /**
   * @description 드래그 상태를 해제합니다.
   * @description 드래그 상태가 아닐 땐 pencilDrag가 동작하지 않습니다.
   */
  pencilUp() {
    this.mouseInfo.isDragging = false;
  }

  /**
   * @description 현재 상태를 드래그 중으로 변경합니다.
   * @description 드래그 상태일 때 eraserDrag가 동작합니다.
   */
  eraserDown() {
    this.mouseInfo.isDragging = true;
  }

  /**
   * @param offsetX MouseEvent.offsetX
   * @param offsetY MouseEvent.offsetY
   * @description 지우개로 지우기 위해 현재 위치를 기록합니다.
   * @description canvas controller에서 드래그 중일 때만 동작하도록 구현됩니다.
   */
  eraserMove(offsetX: number, offsetY: number) {
    this.mouseInfo.currentX = offsetX;
    this.mouseInfo.currentY = offsetY;
  }

  /**
   * @description 드래그 상태를 해제합니다.
   * @description 드래그 상태가 아닐 땐 eraserDrag가 동작하지 않습니다.
   */
  eraserUp() {
    this.mouseInfo.isDragging = false;
  }

  /**
   * @param x Width
   * @param y Height 
   * @param scale Scale
   * @description 이미지의 크기를 조절합니다.
   * @description zoom in/out 기능을 구현합니다.
  */
  scale({width, height, scale}: {width: number, height: number, scale: number}) {
    return {width: width * scale, height: height * scale};
  }

  /**
   * @param offsetX MouseEvent.offsetX
   * @param offsetY MouseEvent.offsetY
   * @description 이미지를 자르기 위한 시작 위치를 기록합니다.
   */
  cutDown(offsetX: number, offsetY: number) {
    this.mouseInfo.beforeX = offsetX;
    this.mouseInfo.beforeY = offsetY;
    this.mouseInfo.isDragging = true;
  }

  /**
   * @param offsetX MouseEvent.offsetX
   * @param offsetY MouseEvent.offsetY
   * @description 이미지를 자르기 위한 끝 위치를 기록합니다.
   */
  cutMove(offsetX: number, offsetY: number) {
    this.mouseInfo.currentX = offsetX;
    this.mouseInfo.currentY = offsetY;
  }

  /**
   * @description 드래그 상태를 해제합니다.
   */
  cutUp() {
    this.mouseInfo.isDragging = false;
  }

  reset() {

  }

  back() {

  }

  text() {

  }
}