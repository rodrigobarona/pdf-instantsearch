"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/config/i18n";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import {
  SearchBox,
  Configure,
  Pagination,
  RefinementList,
  RangeInput,
  SortBy,
  CurrentRefinements,
  ClearRefinements,
  Stats,
  InfiniteHits,
  HierarchicalMenu,
  Breadcrumb,
} from "react-instantsearch";
import { searchClient, indexName } from "@/config/typesense";
import {
  PropertyHitComponent,
  type PropertyHit,
} from "@/components/PropertyHit";
import type { MenuProps } from "react-instantsearch";
import { useMenu } from "react-instantsearch";
import { Button } from "@/components/ui/button";

function CustomBusinessTypeMenu(props: MenuProps) {
  const { items, refine } = useMenu(props);
  const { t } = useTranslation();

  // Ensure default selection if nothing is selected
  React.useEffect(() => {
    const hasSelection = items.some((item) => item.isRefined);
    if (!hasSelection && items.length > 0) {
      refine(items[0].value);
    }
  }, [items, refine]);

  return (
    <div className="w-full">
      <div className="flex flex-row gap-2 justify-between">
        {items.map((item) => (
          <Button
            type="button"
            key={item.value}
            onClick={() => refine(item.value)}
            className={`flex items-center justify-center w-full p-2 ${
              item.isRefined
                ? "bg-blue-500 text-white"
                : "bg-blue-200 hover:bg-blue-300 text-black"
            } rounded transition-colors`}
          >
            <span className="text-sm">
              {t(`businessType.${item.value.toLowerCase()}`)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

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

  return (
    <div className="container mx-auto px-4 py-8">
      <InstantSearchNext
        indexName={indexName}
        searchClient={searchClient}
        routing={{
          stateMapping: {
            stateToRoute(uiState) {
              const indexUiState = uiState[indexName] || {};
              return {
                q: indexUiState.query,
                page: indexUiState.page,
                type: indexUiState.menu?.business_type_id,
                price: indexUiState.range?.price,
                rooms: Array.isArray(indexUiState.refinementList?.rooms)
                  ? indexUiState.refinementList.rooms.join(",")
                  : undefined,
                location: Array.isArray(indexUiState.refinementList?.county)
                  ? indexUiState.refinementList.county.join(",")
                  : undefined,
              };
            },
            routeToState(routeState) {
              return {
                [indexName]: {
                  query: routeState.q || "",
                  page: routeState.page,
                  menu: routeState.type
                    ? {
                        business_type_id: routeState.type,
                      }
                    : undefined,
                  range: routeState.price
                    ? {
                        price: routeState.price,
                      }
                    : undefined,
                  refinementList: {
                    rooms: routeState.rooms ? routeState.rooms.split(",") : [],
                    county: routeState.location
                      ? routeState.location.split(",")
                      : [],
                  },
                },
              };
            },
          },
        }}
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

              {/* Business Type - with custom component */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  {t("businessTypeFilter")}
                </h3>
                <CustomBusinessTypeMenu
                  attribute="business_type_id"
                  sortBy={["count"]}
                  limit={2}
                />
              </div>

              {/* Location Hierarchy */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  {t("locationParish")}
                </h3>
                <HierarchicalMenu
                  attributes={[
                    "location_hierarchy.lvl0", // NUT II
                    "location_hierarchy.lvl1", // NUT III
                    "location_hierarchy.lvl2", // DISTRITO
                    "location_hierarchy.lvl3", // CONCELHO
                    "location_hierarchy.lvl4", // FRAGUESIA
                    "location_hierarchy.lvl5", // ZONA
                  ]}
                  rootPath="location_hierarchy.lvl2"
                  sortBy={["name"]}
                  showParentLevel={true}
                  classNames={{
                    root: "space-y-2 -ml-3",
                    noRefinementRoot: "text-gray-500 italic",
                    list: "space-y-1 pl-2", // Indentation for nested levels
                    item: "relative", // For proper positioning
                    selectedItem: "font-medium text-blue-600",
                    parentItem: "mb-1",
                    link: "block py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900",
                    selectedItemLink:
                      "bg-blue-50 text-blue-600 hover:bg-blue-100",
                    label: "text-sm",
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer",
                    disabledShowMore:
                      "text-sm text-gray-400 mt-2 cursor-not-allowed",
                  }}
                />
              </div>

              {/* Category */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">{t("category")}</h3>
                <RefinementList
                  attribute="category_name"
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

              {/* Category Hierarchy */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  {t("categoryHierarchy")}
                </h3>
                <HierarchicalMenu
                  attributes={[
                    "category_hierarchy.lvl0",
                    "category_hierarchy.lvl1",
                  ]}
                  sortBy={["name"]}
                  showParentLevel={true}
                  classNames={{
                    root: "space-y-2 -ml-3",
                    noRefinementRoot: "text-gray-500 italic",
                    list: "space-y-1 pl-2", // Indentation for nested levels
                    item: "relative", // For proper positioning
                    selectedItem: "font-medium text-blue-600",
                    parentItem: "mb-1",
                    link: "block py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900",
                    selectedItemLink:
                      "bg-blue-50 text-blue-600 hover:bg-blue-100",
                    label: "text-sm",
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
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

              <Breadcrumb
                attributes={[
                  "location_hierarchy.lvl0",
                  "location_hierarchy.lvl1",
                  "location_hierarchy.lvl2",
                  "location_hierarchy.lvl3",
                  "location_hierarchy.lvl4",
                ]}
                classNames={{
                  root: "mt-4",
                  list: "flex items-center space-x-2",
                  item: "text-sm text-gray-500",
                  separator: "text-gray-500 mr",
                }}
              />

              <CurrentRefinements
                excludedAttributes={["business_type_id"]}
                classNames={{
                  root: "mt-4",
                  list: "space-y-2 flex flex-row gap-2",
                  item: "flex flex-wrap gap-2",
                  label: "text-sm font-medium",
                  category:
                    "inline-flex items-center px-2 py-1 rounded bg-gray-100",
                  delete: "ml-2 text-gray-500 hover:text-gray-700",
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
              <Stats
                classNames={{
                  root: "mt-6",
                }}
              />
            </div>

            <Configure hitsPerPage={36} />

            <InfiniteHits<PropertyHit>
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
