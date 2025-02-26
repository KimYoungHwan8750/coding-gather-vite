import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CanvasData, ToolsType } from "shared-coding-gather";

type StateType = {
  canvas: CanvasData
}

const initialState: StateType = {
  canvas: new CanvasData()
}

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setUrl(state, action: PayloadAction<string>) {
      state.canvas = state.canvas.withUrl(action.payload);
    },
    setBinary(state, action: PayloadAction<Uint8Array>) {
      state.canvas = state.canvas.withBinary(action.payload);
    },
    setTools(state, action: PayloadAction<ToolsType>) {
      state.canvas = state.canvas.withTool(action.payload);
    },
    setPending(state, action: PayloadAction<boolean>) {
      state.canvas = state.canvas.withPending(action.payload);
    },
    setBase64(state, action: PayloadAction<string>) {
      state.canvas = state.canvas.withBase64Data(action.payload);
    },
    setBase64FromBinary(state, action: PayloadAction<Uint8Array>) {
      state.canvas = state.canvas.withBase64Data(state.canvas.encodeBinaryToBase64(action.payload));
    }
  }
})

export const { setUrl, setBinary, setTools, setPending, setBase64, setBase64FromBinary } = canvasSlice.actions;
export default canvasSlice.reducer;