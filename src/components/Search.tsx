"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";
import {
  SearchBox,
  Hits,
  RefinementList,
  HierarchicalMenu,
  DynamicWidgets,
  Menu,
} from "react-instantsearch";
import { searchClient, indexName } from "@/config/typesense";
import { PropertyHitComponent } from "@/components/PropertyHit";
import type { PropertyHit } from "@/components/PropertyHit";
import { useTranslation } from "react-i18next";

export function Search({ lng }: { lng: string }) {
  const { t } = useTranslation();

  return (
    <InstantSearchNext
      indexName={indexName}
      searchClient={searchClient}
      routing={{
        router: {
          cleanUrlOnDispose: false,
          windowTitle(routeState) {
            return routeState.query
              ? `Search Results for: ${routeState.query}`
              : "Property Search";
          },
        },
      }}
      future={{
        preserveSharedStateOnUnmount: true,
        persistHierarchicalRootCount: true,
      }}
    >
      <Menu attribute="business_type_id" sortBy={["count"]} />
      <SearchBox
        placeholder={t("searchPlaceholder")}
        classNames={{
          root: "w-full",
          form: "relative",
          input:
            "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500",
          submit: "hidden",
          reset: "hidden",
        }}
      />
      <Hits<PropertyHit>
        hitComponent={({ hit }) => <PropertyHitComponent hit={hit} lng={lng} />}
      />
    </InstantSearchNext>
  );
}
