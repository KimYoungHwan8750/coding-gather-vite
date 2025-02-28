import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppConstant, ChangeLanguageResponse, EditorData, InputTextResponse } from "shared-coding-gather"

type StateType = {
  topEditorData: EditorData
  bottomEditorData: EditorData
}
const initialState: StateType = {
  topEditorData: {
    direction: AppConstant.direction.TOP,
    language: AppConstant.language.PLAIN_TEXT,
    text: ""
  },
  bottomEditorData: {
    direction: AppConstant.direction.BOTTOM,
    language: AppConstant.language.PLAIN_TEXT,
    text: ""
  }
}

const editorsSlice = createSlice({
  name: 'editors',
  initialState,
  reducers: {

    /**
     * @description payload를 전달하면 해당 방향의 에디터에 텍스트를 설정
     */
    setText(state, action: PayloadAction<InputTextResponse>) {
      action.payload.direction === AppConstant.direction.TOP ? state.topEditorData.text = action.payload.text : state.bottomEditorData.text = action.payload.text;
    },

    /**
     * @description payload를 전달하면 해당 방향의 에디터에 언어를 설정
     */
    setLanguage(state, action: PayloadAction<ChangeLanguageResponse>) {
      action.payload.direction === AppConstant.direction.TOP ? state.topEditorData.language = action.payload.language : state.bottomEditorData.language = action.payload.language;
    },

    setDataFromEditorData(state, action: PayloadAction<EditorData>) {
      if(action.payload.direction === AppConstant.direction.TOP) {
        state.topEditorData = action.payload;
      } else {
        state.bottomEditorData = action.payload;
      }
    }
  }
})

export const { setText, setLanguage, setDataFromEditorData } = editorsSlice.actions
export default editorsSlice.reducer
export const topEditorSelector = (state: {editors: StateType}) => state.editors.topEditorData
export const bottomEditorSelector = (state: {editors: StateType}) => state.editors.bottomEditorData