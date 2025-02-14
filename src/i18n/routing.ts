import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { LANGUAGES } from "@/config/constants";
export const routing = defineRouting({
  // All supported locales – adjust if needed.
  locales: LANGUAGES,
  defaultLocale: LANGUAGES[0],
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
