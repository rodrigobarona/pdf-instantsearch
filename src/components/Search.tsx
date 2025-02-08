"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";
import { SearchBox } from "react-instantsearch";
import { searchClient, indexName } from "@/config/typesense";
import { useTranslation } from "react-i18next";
import { TabsMenu } from "@/components/TabsMenu";

export function Search() {
  const { t } = useTranslation();

  return (
    <InstantSearchNext
      indexName={indexName}
      searchClient={searchClient}
      routing={{
        router: {
          cleanUrlOnDispose: true,
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
      <TabsMenu attribute="business_type_id" sortBy={["count"]} />

      <SearchBox
        placeholder={t("searchPlaceholder")}
        searchAsYouType={false}
        autoFocus={true}
        submitIconComponent={() => (
          <div className="w-20 h-10 bg-blue-500 border border-blue-500">
            Submit
          </div>
        )}
        onSubmit={() => {
          console.log("submit");
        }}
        classNames={{
          root: "w-full",
          form: "relative flex items-center",
          input:
            "w-96 px-4 py-2 rounded-none border focus:outline-none focus:ring-0 focus:ring-blue-500",
        }}
      />
    </InstantSearchNext>
  );
}
