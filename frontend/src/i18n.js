import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./assets/languages/en.json";
import th from "./assets/languages/th.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "th",
  resources: {
    en: en,
    th: th,
  },
  interpolation: {
    escapeValue: false,
  },
  fallbackLng: "th",
});

export default i18n;
