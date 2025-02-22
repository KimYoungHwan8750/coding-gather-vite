import { ParsedChangeLanguagePayload, ParsedInputTextPayload } from "@/constant/payload-type";


function inputTextMessage({ direction, text }: ParsedInputTextPayload) {
  return JSON.stringify({
    direction,
    text
  });
}


function changeLanguageMessage({ direction, language }: ParsedChangeLanguagePayload) {
  return JSON.stringify({
    direction,
    language
  });
}

function SearchMessage(url: string) {
  return JSON.stringify({
    url
  });
}

export { inputTextMessage, changeLanguageMessage, SearchMessage }