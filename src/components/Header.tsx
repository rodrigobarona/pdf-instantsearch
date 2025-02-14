"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { LANGUAGES, LANGUAGES_LABELS } from "@/config/constants";

const languages = [...LANGUAGES].map((lang) => ({
  code: lang,
  name: LANGUAGES_LABELS[lang],
}));

type HeaderProps = {
  locale: string;
};

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    // Replace the locale prefix in the pathname and navigate
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={`/${locale}`} className="text-xl font-bold">
          {t("title")}
        </Link>
        <div className="w-32">
          <select
            value={locale}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
