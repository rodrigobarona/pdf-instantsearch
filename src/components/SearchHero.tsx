"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";
import { searchClient, indexName } from "@/config/typesense";
import { useTranslation } from "react-i18next";
import { AutocompleteBox } from "./AutocompleteBox";

export function SearchHero() {
  const { t } = useTranslation();

  return (
    <InstantSearchNext
      indexName={indexName}
      searchClient={searchClient}
      routing={{
        stateMapping: {
          stateToRoute(uiState) {
            const indexUiState = uiState[indexName] || {};
            return {
              q: indexUiState.query,
            };
          },
          routeToState(routeState) {
            return {
              [indexName]: {
                query: routeState.q,
              },
            };
          },
        },
      }}
      insights={true}
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-8">{t("findYourDreamHome")}</h1>
        <div className="w-full max-w-2xl">
          <AutocompleteBox />
        </div>
      </div>
    </InstantSearchNext>
  );
}
