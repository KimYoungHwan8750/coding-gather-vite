import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppConstant, ChangeLanguageResponse, EditorData, InputTextResponse } from "shared-coding-gather"

type StateType = {
  topEditor: EditorData
  bottomEditor: EditorData
}

const initialState: StateType = {
  topEditor: new EditorData(AppConstant.direction.TOP, AppConstant.language.PLAIN_TEXT, ""),
  bottomEditor: new EditorData(AppConstant.direction.BOTTOM, AppConstant.language.PLAIN_TEXT, "")
}

const editorsSlice = createSlice({
  name: 'editors',
  initialState,
  reducers: {

    /**
     * @description payload를 전달하면 해당 방향의 에디터에 텍스트를 설정
     */
    setText(state, action: PayloadAction<InputTextResponse>) {
      action.payload.direction === AppConstant.direction.TOP ? state.topEditor = state.topEditor.withText(action.payload.text) : state.bottomEditor = state.bottomEditor.withText(action.payload.text);
    },

    /**
     * @description payload를 전달하면 해당 방향의 에디터에 언어를 설정
     */
    setLanguage(state, action: PayloadAction<ChangeLanguageResponse>) {
      action.payload.direction === AppConstant.direction.TOP ? state.topEditor = state.topEditor.withLanguage(action.payload.language) : state.bottomEditor = state.bottomEditor.withLanguage(action.payload.language);
    }
  }
})

export const { setText, setLanguage } = editorsSlice.actions
export default editorsSlice.reducer