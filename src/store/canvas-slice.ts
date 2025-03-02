import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CanvasData, ToolsType } from "shared-coding-gather";
import { RootState } from "./store";


type InitialStateType = {
  canvasData: CanvasData
}
const initialState: InitialStateType = {
  canvasData: {
    url: "",
    tool: "hand",
    pending: false
  },
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
    }
  }
})

export const { setUrl, setTools, setPending, setDataFromCanvasData } = canvasSlice.actions;
export default canvasSlice.reducer;
export const canvasSelector = (state: RootState) => state.canvas;