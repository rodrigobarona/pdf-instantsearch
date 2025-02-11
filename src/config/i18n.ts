import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files directly
import enTranslation from "../../public/locales/en/translation.json";
import ptTranslation from "../../public/locales/pt/translation.json";
import frTranslation from "../../public/locales/fr/translation.json";

const resources = {
  en: { translation: enTranslation },
  pt: { translation: ptTranslation },
  fr: { translation: frTranslation },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["pt", "en", "fr"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
