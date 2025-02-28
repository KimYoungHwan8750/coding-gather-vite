import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CanvasData, ToolsType } from "shared-coding-gather";



const initialState: CanvasData = {
  url: "",
  tool: "cursor",
  pending: false
}

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setUrl(state, action: PayloadAction<string>) {
      state.url = action.payload;
    },
    setTools(state, action: PayloadAction<ToolsType>) {
      state.tool = action.payload;
    },
    setPending(state, action: PayloadAction<boolean>) {
      state.pending = action.payload;
    },
    setDataFromCanvasData(state, action: PayloadAction<CanvasData>) {
      state.url = action.payload.url;
      state.tool = action.payload.tool;
      state.pending = action.payload.pending;
    }
  }
})

export const { setUrl, setTools, setPending, setDataFromCanvasData } = canvasSlice.actions;
export default canvasSlice.reducer;