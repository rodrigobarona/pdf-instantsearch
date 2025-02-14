import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { LANGUAGES } from "@/config/constants";
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !LANGUAGES.includes(locale as (typeof LANGUAGES)[number])) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
