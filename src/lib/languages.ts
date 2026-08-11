export type ScriptId = "latin" | "cyrillic" | "japanese" | "chinese";

export type Language = {
  id: string;
  /** English name, for search and for the secondary line. */
  name: string;
  /** Endonym, set in the language's own script — this is the script demo. */
  native: string;
  script: ScriptId;
};

export const SCRIPTS: { id: ScriptId; label: string }[] = [
  { id: "latin", label: "Latin" },
  { id: "cyrillic", label: "Cyrillic" },
  { id: "japanese", label: "Japanese" },
  { id: "chinese", label: "Chinese" },
];

/**
 * Rendering is limited to the scripts our card typefaces actually cover:
 * Latin, Cyrillic, Japanese and Chinese. Anything else (Arabic, Hebrew, Thai,
 * Hangul, Devanagari) needs new font licensing before it can ship.
 */
export const LANGUAGES: Language[] = [
  { id: "en", name: "English", native: "English", script: "latin" },
  { id: "es", name: "Spanish", native: "Español", script: "latin" },
  { id: "fr", name: "French", native: "Français", script: "latin" },
  { id: "de", name: "German", native: "Deutsch", script: "latin" },
  { id: "it", name: "Italian", native: "Italiano", script: "latin" },
  { id: "pt", name: "Portuguese", native: "Português", script: "latin" },
  { id: "nl", name: "Dutch", native: "Nederlands", script: "latin" },
  { id: "pl", name: "Polish", native: "Polski", script: "latin" },
  { id: "cs", name: "Czech", native: "Čeština", script: "latin" },
  { id: "sv", name: "Swedish", native: "Svenska", script: "latin" },
  { id: "no", name: "Norwegian", native: "Norsk", script: "latin" },
  { id: "da", name: "Danish", native: "Dansk", script: "latin" },
  { id: "fi", name: "Finnish", native: "Suomi", script: "latin" },
  { id: "is", name: "Icelandic", native: "Íslenska", script: "latin" },
  { id: "tr", name: "Turkish", native: "Türkçe", script: "latin" },
  { id: "ro", name: "Romanian", native: "Română", script: "latin" },
  { id: "hu", name: "Hungarian", native: "Magyar", script: "latin" },
  { id: "hr", name: "Croatian", native: "Hrvatski", script: "latin" },
  { id: "sk", name: "Slovak", native: "Slovenčina", script: "latin" },
  { id: "sl", name: "Slovenian", native: "Slovenščina", script: "latin" },
  { id: "lt", name: "Lithuanian", native: "Lietuvių", script: "latin" },
  { id: "lv", name: "Latvian", native: "Latviešu", script: "latin" },
  { id: "et", name: "Estonian", native: "Eesti", script: "latin" },
  { id: "ca", name: "Catalan", native: "Català", script: "latin" },
  { id: "ga", name: "Irish", native: "Gaeilge", script: "latin" },
  { id: "cy", name: "Welsh", native: "Cymraeg", script: "latin" },
  { id: "vi", name: "Vietnamese", native: "Tiếng Việt", script: "latin" },
  { id: "id", name: "Indonesian", native: "Bahasa Indonesia", script: "latin" },
  { id: "ms", name: "Malay", native: "Bahasa Melayu", script: "latin" },
  { id: "tl", name: "Filipino", native: "Filipino", script: "latin" },
  { id: "af", name: "Afrikaans", native: "Afrikaans", script: "latin" },
  { id: "sw", name: "Swahili", native: "Kiswahili", script: "latin" },

  { id: "ru", name: "Russian", native: "Русский", script: "cyrillic" },
  { id: "uk", name: "Ukrainian", native: "Українська", script: "cyrillic" },
  { id: "bg", name: "Bulgarian", native: "Български", script: "cyrillic" },
  { id: "sr", name: "Serbian", native: "Српски", script: "cyrillic" },
  { id: "mk", name: "Macedonian", native: "Македонски", script: "cyrillic" },
  { id: "be", name: "Belarusian", native: "Беларуская", script: "cyrillic" },
  { id: "kk", name: "Kazakh", native: "Қазақша", script: "cyrillic" },
  { id: "mn", name: "Mongolian", native: "Монгол", script: "cyrillic" },

  { id: "ja", name: "Japanese", native: "日本語", script: "japanese" },

  {
    id: "zh-Hans",
    name: "Chinese (Simplified)",
    native: "简体中文",
    script: "chinese",
  },
  {
    id: "zh-Hant",
    name: "Chinese (Traditional)",
    native: "繁體中文",
    script: "chinese",
  },
];

export function findLanguage(id: string | null) {
  return LANGUAGES.find((l) => l.id === id) ?? null;
}
