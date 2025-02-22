import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Editor from "@monaco-editor/react";
import { ReactNode, useEffect, useState } from "react";
import { useWs } from "@/provider/websocket-provider";
import { changeLanguageMessage, inputTextMessage } from "@/lib/ws-frame-generator";
import { ParsedChangeLanguagePayload, ParsedInputTextPayload } from "@/constant/payload-type";
import { Direction, Language } from "@/constant/constant";
import { useEditorFeature } from "@/provider/editor-provider";
import a from "@/sources.json";

export default function TextEditor({direction}: {direction: Direction}) {
  const editorFeature = useEditorFeature();
  const [language, setLanguage] = useState<Language | null>(null);
  const lowerCaseLanguage = language?.toLowerCase().replace(/\s/g, "");
  const ws = useWs();
  const [text, setText] = useState("");
  /**
   * Language 설정 바꾸면 다른 유저들에게도 공유
   */
  const changeLanguage = (language: Language) => {
    setLanguage(language);
    ws.socket.emit("changeLanguage", changeLanguageMessage({ language, direction }));
  };
  
  /**
   * 에디터에 글 입력할 때마다 다른 유저들에게 공유
   */
  const syncEditor = (text?: string) => {
    if(!text) text = "";
    setText(text);
    ws.socket.emit("inputText", inputTextMessage({ text, direction }));
  };

  /**
   * 다른 유저가 입력한 내용을 받아서 에디터에 반영
   */
  useEffect(() => {
    if(editorFeature.onInputText.payload === "") return;
    const parsedPayload: ParsedInputTextPayload = JSON.parse(editorFeature.onInputText.payload);
    if(parsedPayload) {
      if(parsedPayload.direction === direction) {
        setText(parsedPayload.text);
      }
    }
  }, [editorFeature.onInputText.payload]);


  return (
    <div className="w-full h-full flex flex-col">
      <EditorToolbar>
        <LanguageMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-full outline-none">
              <MenuTrigger>{language? language : "Plain Text"}</MenuTrigger>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Language{a.ABC}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup onValueChange={(value: string) => changeLanguage(value as Language)}>
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
        onChange={syncEditor}
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