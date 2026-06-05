import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useAppSettings } from "@/hooks/use-settings";
import {
  DEFAULT_APP_LANGUAGE,
  resolveAppLanguage,
  type AppLanguage,
  type ResolvedAppLanguage,
} from "./languages";
import { resources, type TranslationKey } from "./resources";

export {
  APP_LANGUAGES,
  DEFAULT_APP_LANGUAGE,
  FALLBACK_APP_LANGUAGE,
  isAppLanguage,
  resolveAppLanguage,
} from "./languages";
export type { AppLanguage, ResolvedAppLanguage } from "./languages";
export type { TranslationKey } from "./resources";

type TranslationValue = string | number | null | undefined;
type TranslationValues = Record<string, TranslationValue>;

interface I18nContextValue {
  language: AppLanguage;
  resolvedLanguage: ResolvedAppLanguage;
  t: (key: TranslationKey, values?: TranslationValues) => string;
}

function formatTranslation(template: string, values?: TranslationValues): string {
  if (!values) {
    return template;
  }
  return template.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (match, name: string) => {
    const value = values[name];
    return value === null || value === undefined ? match : String(value);
  });
}

function translate(
  key: TranslationKey,
  language: ResolvedAppLanguage,
  values?: TranslationValues,
): string {
  const template = resources[language][key] ?? resources.en[key] ?? key;
  return formatTranslation(template, values);
}

const DEFAULT_RESOLVED_LANGUAGE = resolveAppLanguage(DEFAULT_APP_LANGUAGE);

const I18nContext = createContext<I18nContextValue>({
  language: DEFAULT_APP_LANGUAGE,
  resolvedLanguage: DEFAULT_RESOLVED_LANGUAGE,
  t: (key, values) => translate(key, DEFAULT_RESOLVED_LANGUAGE, values),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppSettings();
  const language = settings.language;
  const resolvedLanguage = resolveAppLanguage(language);
  const t = useCallback(
    (key: TranslationKey, values?: TranslationValues) => translate(key, resolvedLanguage, values),
    [resolvedLanguage],
  );
  const value = useMemo(() => ({ language, resolvedLanguage, t }), [language, resolvedLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
