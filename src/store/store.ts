import { configureStore } from '@reduxjs/toolkit'
import canvasReducer from './canvas-slice'
import editorsReducer from './editors-slice'
export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    editors: editorsReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch