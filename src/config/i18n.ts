import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "pt",
    supportedLngs: ["pt", "en", "fr"],
    debug: process.env.NODE_ENV === "development",

    // Namespace configuration
    ns: ["common"],
    defaultNS: "common",

    // Backend configuration
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    interpolation: {
      escapeValue: false,
    },

    // React specific configuration
    react: {
      useSuspense: false, // Recommended for SSR
    },
  });

export default i18n;
