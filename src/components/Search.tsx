"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";
import {
  SearchBox,
  Hits,
  useMenu,
  type UseMenuProps,
} from "react-instantsearch";
import { searchClient, indexName } from "@/config/typesense";
import { PropertyHitComponent } from "@/components/PropertyHit";
import type { PropertyHit } from "@/components/PropertyHit";
import { useTranslation } from "react-i18next";

function MenuSelect(props: UseMenuProps) {
  const { items, refine } = useMenu(props);
  const { value: selectedValue } = items.find((item) => item.isRefined) || {
    value: "",
  };

  return (
    <select
      className="w-full px-4 py-2 mb-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={selectedValue}
      onChange={(event) => {
        refine((event.target as HTMLSelectElement).value);
      }}
    >
      <option value="">All Business Types</option>
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label} ({item.count})
        </option>
      ))}
    </select>
  );
}

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
      <MenuSelect attribute="business_type_id" />
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
