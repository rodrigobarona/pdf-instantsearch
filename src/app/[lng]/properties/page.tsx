"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/config/i18n";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import {
  SearchBox,
  Hits,
  Configure,
  Pagination,
  RefinementList,
  RangeInput,
  SortBy,
  CurrentRefinements,
  ClearRefinements,
  Menu,
} from "react-instantsearch";
import { searchClient, indexName } from "@/config/typesense";
import {
  PropertyHitComponent,
  type PropertyHit,
} from "@/components/PropertyHit";
import type { MenuProps } from "react-instantsearch";

export default function PropertiesPage() {
  const { lng } = useParams<{ lng: string }>();
  const [mounted, setMounted] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (lng && i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  useEffect(() => {
    // Get query from URL on mount
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    if (query) {
      // You can use this query to set initial search state if needed
      console.log("Initial search query:", query);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const currentLng = i18n.language || "pt";

  const transformBusinessTypes: MenuProps["transformItems"] = (items) => {
    return items.map((item) => ({
      ...item,
      label: t(`businessType.${item.value.toLowerCase()}`),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <InstantSearchNext
        indexName={indexName}
        searchClient={searchClient}
        routing={true}
        future={{
          preserveSharedStateOnUnmount: true,
        }}
      >
        <Configure hitsPerPage={12} facetFilters={[]} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <ClearRefinements
                translations={{
                  resetButtonText: t("clearFilters"),
                }}
                classNames={{
                  button:
                    "w-full px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors",
                }}
              />

              <CurrentRefinements
                classNames={{
                  root: "mt-4",
                  list: "space-y-2",
                  item: "flex flex-wrap gap-2",
                  label: "text-sm font-medium",
                  category:
                    "inline-flex items-center px-2 py-1 rounded bg-gray-100",
                  delete: "ml-2 text-gray-500 hover:text-gray-700",
                }}
              />

              {/* Price Range */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">{t("price")}</h3>
                <RangeInput
                  attribute="price"
                  precision={0}
                  classNames={{
                    root: "space-y-4",
                    form: "flex items-center gap-4",
                    input:
                      "w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500",
                    submit:
                      "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
                  }}
                />
              </div>

              {/* Business Type - with translations */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  {t("businessTypeFilter")}
                </h3>
                <Menu
                  attribute="business_type_id"
                  sortBy={["name"]}
                  limit={2}
                  transformItems={transformBusinessTypes}
                  classNames={{
                    root: "w-full",
                    list: "flex flex-row gap-2 justify-between",
                    item: "flex items-center justify-center w-full p-2 bg-blue-100",
                    label: "flex items-center space-x-2 text-sm",
                    selectedItem: "!bg-blue-500 text-white",
                    count: "hidden",
                  }}
                />
              </div>

              {/* Rooms */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">{t("rooms")}</h3>
                <RefinementList
                  attribute="rooms"
                  classNames={{
                    list: "space-y-2",
                    item: "flex items-center",
                    label: "flex items-center space-x-2 text-sm",
                    checkbox:
                      "rounded border-gray-300 text-blue-500 focus:ring-blue-500",
                    count: "ml-2 text-sm text-gray-500",
                  }}
                />
              </div>

              {/* Location */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">{t("location")}</h3>
                <RefinementList
                  attribute="county"
                  searchable={true}
                  classNames={{
                    list: "space-y-2",
                    searchBox: "mb-4",
                    item: "flex items-center",
                    label: "flex items-center space-x-2 text-sm",
                    checkbox:
                      "rounded border-gray-300 text-blue-500 focus:ring-blue-500",
                    count: "ml-2 text-sm text-gray-500",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <SearchBox
                placeholder={t("searchPlaceholder")}
                classNames={{
                  root: "relative",
                  form: "relative",
                  input:
                    "w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  submit: "absolute right-3 top-1/2 -translate-y-1/2",
                  reset: "hidden",
                }}
              />
            </div>

            <div className="flex justify-between items-center mb-6">
              <SortBy
                items={[
                  { label: t("relevance"), value: indexName },
                  {
                    label: t("priceLowToHigh"),
                    value: `${indexName}_price_asc`,
                  },
                  {
                    label: t("priceHighToLow"),
                    value: `${indexName}_price_desc`,
                  },
                ]}
                classNames={{
                  root: "min-w-[200px]",
                  select:
                    "w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500",
                }}
              />
            </div>

            <Configure hitsPerPage={12} />

            <Hits<PropertyHit>
              hitComponent={({ hit }) => (
                <PropertyHitComponent hit={hit} lng={currentLng} />
              )}
              classNames={{
                root: "mt-6",
                list: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
              }}
            />

            <Pagination
              classNames={{
                root: "mt-8",
                list: "flex justify-center items-center space-x-2",
                item: "inline-flex",
                link: "px-4 py-2 border rounded hover:bg-gray-50",
                selectedItem: "bg-blue-500 text-white hover:bg-blue-600",
                disabledItem: "opacity-50 cursor-not-allowed",
              }}
            />
          </div>
        </div>
      </InstantSearchNext>
    </div>
  );
}
