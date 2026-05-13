import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type Language = "nl" | "en";

const STORAGE_KEYS = {
  theme: "evai.theme",
  language: "evai.language",
} as const;

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(STORAGE_KEYS.theme);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "nl";
  const saved = window.localStorage.getItem(STORAGE_KEYS.language);
  return saved === "en" ? "en" : "nl";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

function applyLanguage(lang: Language) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
}

/**
 * Read + write the user's local UI preferences. Persists to localStorage and
 * applies the theme to `document.documentElement[data-theme]` so CSS variables
 * defined in `index.css` swap immediately.
 */
export function usePreferences() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    applyLanguage(language);
    window.localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const setLanguage = useCallback((next: Language) => setLanguageState(next), []);

  return { theme, setTheme, language, setLanguage };
}

/**
 * Eager bootstrap. Call once from main.tsx before React renders so the page
 * never flashes the wrong theme on first paint.
 */
export function bootstrapPreferences() {
  applyTheme(getInitialTheme());
  applyLanguage(getInitialLanguage());
}
