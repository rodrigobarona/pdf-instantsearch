"use client";

import { useTranslation } from "react-i18next";
import { AutocompleteBox } from "./AutocompleteBox";

import { BusinessTypeToggle } from "./BusinessTypeToggle";

export function SearchHero() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] bg-gray-100">
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
