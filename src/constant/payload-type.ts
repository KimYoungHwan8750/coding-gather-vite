import { Language } from "./constant"

export type AllPayload = ParsedInputTextPayload | ParsedChangeLanguagePayload | ParsedSearchPayload | string

export type ParsedInputTextPayload = {
  direction: string
  text: string
}

export type ParsedChangeLanguagePayload = {
  direction: string
  language: Language
}

export type ParsedSearchPayload = {
  code: 200 | 404
  data: string
}