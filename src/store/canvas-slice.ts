import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppConstant, CanvasData, ToolsType } from "shared-coding-gather";
import { RootState } from "./store";
import { ZoomLevelType } from "shared-coding-gather";


type InitialStateType = {
  canvasData: CanvasData
  zoomLevel: ZoomLevelType
  strokeWidth: number
  strokeColor: string
}
const initialState: InitialStateType = {
  canvasData: {
    url: "",
    tool: "hand",
    pending: false
  },
  zoomLevel: 0,
  strokeWidth: 4,
  strokeColor: "black"
}

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setUrl(state, action: PayloadAction<string>) {
      state.canvasData.url = action.payload;
    },
    setTools(state, action: PayloadAction<ToolsType>) {
      state.canvasData.tool = action.payload;
    },
    setPending(state, action: PayloadAction<boolean>) {
      state.canvasData.pending = action.payload;
    },
    setDataFromCanvasData(state, action: PayloadAction<CanvasData>) {
      state.canvasData.url = action.payload.url;
      state.canvasData.tool = action.payload.tool;
      state.canvasData.pending = action.payload.pending;
    },
    setStrokeWidth(state, action: PayloadAction<number>) {
      state.strokeWidth = action.payload;
    },
    setStrokeColor(state, action: PayloadAction<string>) {
      state.strokeColor = action.payload;
    },
    zoomIn: (state) => {
      if(state.zoomLevel >= AppConstant.maxZoomLevel) return;
      state.zoomLevel += 1;
    },
    zoomOut: (state) => {
      if(state.zoomLevel <= AppConstant.minZoomLevel) return;
      state.zoomLevel -= 1;
    }
  }
})

export const { setUrl, setTools, setPending, setDataFromCanvasData, setStrokeWidth, setStrokeColor, zoomIn, zoomOut } = canvasSlice.actions;
export default canvasSlice.reducer;
export const canvasSelector = (state: RootState) => state.canvas;