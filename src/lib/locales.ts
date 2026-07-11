export type Locale = { code: string; name: string; group: string };

export const SUPPORTED_LOCALES: Locale[] = [
  // Americas
  { code: 'en-US', name: 'English US', group: 'Americas' },
  { code: 'en-CA', name: 'English Canada', group: 'Americas' },
  { code: 'es-MX', name: 'Spanish Mexico', group: 'Americas' },
  { code: 'pt-BR', name: 'Portuguese Brazil', group: 'Americas' },
  { code: 'fr-CA', name: 'French Canada', group: 'Americas' },
  // Europe
  { code: 'en-GB', name: 'English UK', group: 'Europe' },
  { code: 'de-DE', name: 'German', group: 'Europe' },
  { code: 'fr-FR', name: 'French', group: 'Europe' },
  { code: 'es-ES', name: 'Spanish', group: 'Europe' },
  { code: 'it-IT', name: 'Italian', group: 'Europe' },
  { code: 'nl-NL', name: 'Dutch', group: 'Europe' },
  { code: 'pt-PT', name: 'Portuguese', group: 'Europe' },
  { code: 'pl-PL', name: 'Polish', group: 'Europe' },
  { code: 'sv-SE', name: 'Swedish', group: 'Europe' },
  { code: 'da-DK', name: 'Danish', group: 'Europe' },
  { code: 'fi-FI', name: 'Finnish', group: 'Europe' },
  { code: 'nb-NO', name: 'Norwegian', group: 'Europe' },
  { code: 'ru-RU', name: 'Russian', group: 'Europe' },
  { code: 'uk-UA', name: 'Ukrainian', group: 'Europe' },
  { code: 'tr-TR', name: 'Turkish', group: 'Europe' },
  // Asia Pacific
  { code: 'ja-JP', name: 'Japanese', group: 'Asia Pacific' },
  { code: 'ko-KR', name: 'Korean', group: 'Asia Pacific' },
  { code: 'zh-CN', name: 'Chinese Simplified', group: 'Asia Pacific' },
  { code: 'zh-TW', name: 'Chinese Traditional', group: 'Asia Pacific' },
  { code: 'th-TH', name: 'Thai', group: 'Asia Pacific' },
  { code: 'vi-VN', name: 'Vietnamese', group: 'Asia Pacific' },
  { code: 'id-ID', name: 'Indonesian', group: 'Asia Pacific' },
  { code: 'ms-MY', name: 'Malay', group: 'Asia Pacific' },
  { code: 'hi-IN', name: 'Hindi', group: 'Asia Pacific' },
  // Middle East & Africa
  { code: 'ar-SA', name: 'Arabic', group: 'Middle East & Africa' },
  { code: 'he-IL', name: 'Hebrew', group: 'Middle East & Africa' },
];

export const LONG_TEXT_LOCALES = ['de-DE', 'fi-FI', 'nl-NL', 'ru-RU', 'pl-PL'] as const;

export function getLocalesByGroup(): Map<string, Locale[]> {
  const map = new Map<string, Locale[]>();
  for (const locale of SUPPORTED_LOCALES) {
    const group = map.get(locale.group) ?? [];
    group.push(locale);
    map.set(locale.group, group);
  }
  return map;
}
