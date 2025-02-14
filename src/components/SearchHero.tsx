"use client";

import { useTranslations } from "next-intl";
import { AutocompleteBox } from "./AutocompleteBox";
import { BusinessTypeToggle } from "./BusinessTypeToggle";

export function SearchHero() {
  const t = useTranslations("HomePage");
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-red-900 text-white">
      <h1 className="text-4xl font-bold mb-8">{t("findYourDreamHome")}</h1>
      <div className="w-full max-w-2xl">
        <BusinessTypeToggle
          attribute="business_type_id"
          off="sale"
          on="lease"
        />
        <AutocompleteBox />
      </div>
    </div>
  );
}
