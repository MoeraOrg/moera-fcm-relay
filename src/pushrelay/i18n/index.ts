import i18n from 'i18next';
import ICU from 'i18next-icu';

import message_en from "pushrelay/i18n/locales/en/message.json";
import message_pl from "pushrelay/i18n/locales/pl/message.json";
import message_ru from "pushrelay/i18n/locales/ru/message.json";
import message_uk from "pushrelay/i18n/locales/uk/message.json";

// Do not forget to add languages to src/api/settings.ts

const LANGUAGE_RESOURCES = {
    en: {
        message: message_en
    },
    pl: {
        message: message_pl
    },
    ru: {
        message: message_ru
    },
    uk: {
        message: message_uk
    }
};

const LANGUAGES_SUPPORTED: string[] = ["en", "pl", "ru", "uk"];

export function tGender(gender: string | null | undefined): string {
    return gender != null ? gender.toLowerCase() : "";
}

export async function initI18n() {
    await i18n
        .use(ICU)
        .init({
            resources: LANGUAGE_RESOURCES,
            fallbackLng: "en",
            supportedLngs: LANGUAGES_SUPPORTED,
            ns: ['message'],
            defaultNS: 'message',
            interpolation: {
                escapeValue: false,
            }
        });
}
