import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Editor from "@monaco-editor/react";
import { ReactNode } from "react";
import { ChangeLanguagePayload, DirectionType, LanguageType, AppConstant, InputTextPayload } from "shared-coding-gather";
import { useEditorsSelector } from "@/hooks/use-editors";
import { useWs } from "@/hooks/use-websocket";

export default function TextEditor({direction}: {direction: DirectionType}) {
  const editorsSelector = useEditorsSelector();
  const text = direction === AppConstant.direction.TOP ? editorsSelector.topEditor.getText() : editorsSelector.bottomEditor.getText();
  const language = direction === AppConstant.direction.TOP ? editorsSelector.topEditor.getLanguage() : editorsSelector.bottomEditor.getLanguage();
  const lowerCaseLanguage = language.toLowerCase().replace(/\s/g, "");
  const ws = useWs();
  /**
   * TLanguageType 설정 바꾸면 다른 유저들에게도 공유
   */
  const changeLanguage = (language: LanguageType) => {
    let data: ChangeLanguagePayload = {
      direction,
      language
    }
    ws.socket.emit(AppConstant.websocketEvent.CHANGE_LANGUAGE, data);
  };
  
  /**
   * 에디터에 글 입력할 때마다 다른 유저들에게 공유
   */
  const inputText = (text?: string) => {
    if(!text) text = "";
    let data: InputTextPayload = {
      text,
      direction
    }
    ws.socket.emit(AppConstant.websocketEvent.INPUT_TEXT, data);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <EditorToolbar>
        <LanguageMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-full outline-none">
              <MenuTrigger>{ language ? language : "Plain Text" }</MenuTrigger>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup onValueChange={(value: string) => changeLanguage(value as LanguageType)}>
              <DropdownMenuRadioItem value="Plain Text">Plain Text</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="JavaScript">JavaScript</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="TypeScript">TypeScript</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Python">Python</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Html">HTML</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Css">CSS</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Java">Java</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="C">C</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </LanguageMenu>
      </EditorToolbar>
      <Editor
        onChange={inputText}
        className="w-full h-full"
        height="100%"
        defaultLanguage="plaintext"
        language={lowerCaseLanguage? lowerCaseLanguage : "plaintext"}
        defaultValue="// 여기에 코드를 입력하세요"
        theme="vs-dark"
        options={{
        }}
        value={text}
      />
    </div>
  );
}

function EditorToolbar({children}: {children: React.ReactNode}) {
  return (
    <div className="w-full min-h-12 flex items-center gap-2 box-content">
      {children}
    </div>
  )
}

function LanguageMenu({children}: {children: ReactNode}) {
  return (
    <div className="h-full rounded-md bg-background shadow-sm">
      {children}
    </div>
  )
}

function MenuTrigger({children}: {children: ReactNode}) {
  return (
    <div className="flex justify-center items-center px-2 border-x-[1px] h-full cursor-pointer select-none hover:bg-accent hover:text-accent-foreground w-[12ch]">
      {children}
    </div>
  )
}