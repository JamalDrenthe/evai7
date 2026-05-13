export const COMPANIES = [
  "VVC",
  "Spontiva",
  "Investbotiq",
  "WoningVry",
  "Djobba",
  "Boastplug",
  "Sabibank",
  "Zheavenzy",
] as const;

export type Company = (typeof COMPANIES)[number];

export const SECTIONS = ["codes", "informatie", "content"] as const;
export type Section = (typeof SECTIONS)[number];

export const SECTION_LABELS: Record<Section, string> = {
  codes: "Codes",
  informatie: "Informatie",
  content: "Content",
};

export type DocumentKind = "code" | "markdown" | "text";
export type DocumentLanguage =
  | "html"
  | "tsx"
  | "jsx"
  | "typescript"
  | "javascript"
  | "css"
  | "json"
  | "markdown"
  | "text";

export type DocumentEntry = {
  id: string;
  company: Company;
  section: Section;
  title: string;
  kind: DocumentKind;
  language?: DocumentLanguage;
  content: string;
  createdAt: number;
  updatedAt: number;
};
