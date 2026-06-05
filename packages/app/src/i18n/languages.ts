export const APP_LANGUAGES = ["system", "en", "zh-CN"] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];
export type ResolvedAppLanguage = Exclude<AppLanguage, "system">;

export const DEFAULT_APP_LANGUAGE: AppLanguage = "zh-CN";
export const FALLBACK_APP_LANGUAGE: ResolvedAppLanguage = "en";

const APP_LANGUAGE_SET = new Set<string>(APP_LANGUAGES);

export function isAppLanguage(value: unknown): value is AppLanguage {
  return typeof value === "string" && APP_LANGUAGE_SET.has(value);
}

export function readSystemLocale(): string | null {
  const nav = globalThis.navigator as
    | {
        languages?: readonly string[];
        language?: string;
      }
    | undefined;
  const firstNavigatorLanguage = nav?.languages?.find((language) => language.trim().length > 0);
  if (firstNavigatorLanguage) {
    return firstNavigatorLanguage;
  }
  if (nav?.language) {
    return nav.language;
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return null;
  }
}

export function resolveAppLanguage(language: AppLanguage): ResolvedAppLanguage {
  if (language !== "system") {
    return language;
  }

  const systemLocale = readSystemLocale()?.toLowerCase() ?? "";
  return systemLocale === "zh" || systemLocale.startsWith("zh-") ? "zh-CN" : FALLBACK_APP_LANGUAGE;
}
