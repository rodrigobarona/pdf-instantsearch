"use client";

import { useTranslation } from "react-i18next";
import { AutocompleteBox } from "./AutocompleteBox";
import { Button } from "./ui/button";
import { useToggleRefinement } from "react-instantsearch";


function BusinessTypeToggle(props: {
  attribute: string;
  on: string;
  off: string;
}) {
  const { value, refine } = useToggleRefinement(props);
  const { t } = useTranslation();

  return (
    <div className="flex mb-4">
      <Button
        type="button"
        className={`px-4 py-2 border border-gray-300 rounded-none ${
          !value.isRefined
            ? "bg-blue-600 text-white border-blue-600 hover:border-gray-900"
            : "bg-white text-gray-700 hover:bg-gray-50 "
        }`}
        onClick={() => refine({ isRefined: true })}
      >
        {t("buy")}
      </Button>
      <Button
        type="button"
        className={`px-4 py-2 border border-gray-300 rounded-none ${
          value.isRefined
            ? "bg-blue-600 text-white border-blue-600 hover:border-gray-900"
            : "bg-white text-gray-700 hover:bg-gray-50 "
        }`}
        onClick={() => refine({ isRefined: false })}
      >
        {t("rent")}
      </Button>
    </div>
  );
}



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
