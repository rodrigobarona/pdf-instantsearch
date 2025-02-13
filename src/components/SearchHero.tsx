"use client";

import { InstantSearch } from "react-instantsearch";
import { searchClient, indexName } from "@/config/typesense";
import { useTranslation } from "react-i18next";
import { Autocomplete } from "./Autocomplete";
import { AutocompleteBox } from "./AutocompleteBox";

export function SearchHero() {
  const { t } = useTranslation();

  return (
    <InstantSearch
      indexName={indexName}
      searchClient={searchClient}
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-8">{t("findYourDreamHome")}</h1>
        <div className="w-full max-w-2xl">
          <AutocompleteBox
            className="w-full"
            placeholder={t("searchPlaceholder")}
            openOnFocus={true}
            detachedMediaQuery="none"
          />
        </div>
      </div>
    </InstantSearch>
  );
}
