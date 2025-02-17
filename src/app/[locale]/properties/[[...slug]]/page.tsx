"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  SearchBox,
  Configure,
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
import { indexName } from "@/config/typesense";
import {
  PropertyHitComponent,
  type PropertyHit,
} from "@/components/PropertyHit";

import MapModal from "@/components/MapModal";
import { BusinessTypeToggle } from "@/components/BusinessTypeToggle";

export default function PropertiesPage() {
  const { locale } = useParams<{ locale: string }>();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("search");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [sentinelRef, setSentinelRef] = useState<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Get query from URL on mount
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    if (query) {
      // You can use this query to set initial search state if needed
      console.log("Initial search query:", query);
    }
  }, []);

  useEffect(() => {
    if (!sentinelRef) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading) {
          setIsLoading(true);
          const showMoreButton = document.querySelector(
            ".ais-InfiniteHits-loadMore"
          ) as HTMLButtonElement | null;

          if (showMoreButton && !showMoreButton.disabled) {
            showMoreButton.click();
          }
          // Reset loading state after a short delay
          setTimeout(() => setIsLoading(false), 300);
        }
      },
      {
        root: null,
        rootMargin: "1500px", // Increased to start loading much earlier
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef);

    return () => {
      observer.disconnect();
    };
  }, [sentinelRef, isLoading]);

  if (!mounted) {
    return null;
  }

  // Toggle bar to switch between List and Map view
  const viewToggle = (
    <div className="flex gap-4 mb-4">
      <button
        className="px-4 py-2 rounded bg-blue-500 text-white"
        type="button"
      >
        List
      </button>
      <button
        onClick={() => setIsMapModalOpen(true)}
        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        type="button"
      >
        Map
      </button>
    </div>
  );

  const currentLocale = locale || "pt";

  return (
    <div className="container mx-auto px-4 py-8">
      {viewToggle}

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
            {/* Investment */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Investment</h3>
              <RefinementList
                attribute="investment"
                searchable={true}
                showMore={true}
                sortBy={["name:asc", "count:desc"]}
                limit={10}
                showMoreLimit={1000}
                classNames={{
                  root: "space-y-2 ",
                  noRefinementRoot: "text-gray-500 italic",
                  searchBox: "relative",
                  noResults: "text-gray-500 text-sm italic px-2",
                  list: "space-y-1 max-h-[500px] overflow-y-auto",
                  item: "relative",
                  selectedItem: "font-medium text-blue-600",
                  label:
                    "flex items-center space-x-2 text-sm py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 cursor-pointer",
                  checkbox:
                    "rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  labelText: "flex-1",
                  count:
                    "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                  showMore:
                    "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                  disabledShowMore:
                    "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
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

              <hr className="my-6" />

              {/* Business Type - with custom component */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  {t("businessTypeFilter")}
                </h3>
                <BusinessTypeToggle
                  attribute="business_type_id"
                  off="sale"
                  on="lease"
                  classNames={{
                    root: "flex gap-2 w-full",
                    buttonOn: "bg-blue-500 text-white w-full",
                    buttonOff:
                      "bg-gray-200 text-gray-700 hover:bg-gray-300 w-full",
                  }}
                />
              </div>

              <hr className="my-6" />

              {/* County */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">County</h3>
                <RefinementList
                  attribute="county"
                  searchable={true}
                  showMore={true}
                  sortBy={["count:desc", "name:asc"]}
                  limit={10}
                  showMoreLimit={1000}
                  classNames={{
                    root: "space-y-2 ",
                    noRefinementRoot: "text-gray-500 italic",
                    searchBox: "relative",
                    noResults: "text-gray-500 text-sm italic px-2",
                    list: "space-y-1 max-h-[500px] overflow-y-auto",
                    item: "relative",
                    selectedItem: "font-medium text-blue-600",
                    label:
                      "flex items-center space-x-2 text-sm py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 cursor-pointer",
                    checkbox:
                      "rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    labelText: "flex-1",
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                    disabledShowMore:
                      "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
                  }}
                />
              </div>

              <hr className="my-6" />

              {/* Parish */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Parish</h3>
                <RefinementList
                  attribute="parish"
                  showMore={true}
                  searchable={true}
                  sortBy={["count:desc", "name:asc"]}
                  limit={10}
                  showMoreLimit={1000}
                  classNames={{
                    root: "space-y-2",
                    noRefinementRoot: "text-gray-500 italic",
                    searchBox: "relative",
                    noResults: "text-gray-500 text-sm italic px-2",
                    list: "space-y-1 max-h-[500px] overflow-y-auto",
                    item: "relative",
                    selectedItem: "font-medium text-blue-600",
                    label:
                      "flex items-center space-x-2 text-sm py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 cursor-pointer",
                    checkbox:
                      "rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    labelText: "flex-1",
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                    disabledShowMore:
                      "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
                  }}
                />
              </div>
              <hr className="my-6" />

              {/* Zone */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Zone</h3>
                <RefinementList
                  attribute="zone"
                  showMore={true}
                  searchable={true}
                  sortBy={["count:desc", "name:asc"]}
                  limit={10}
                  showMoreLimit={1000}
                  classNames={{
                    root: "space-y-2",
                    noRefinementRoot: "text-gray-500 italic",
                    searchBox: "relative",
                    noResults: "text-gray-500 text-sm italic px-2",
                    list: "space-y-1 max-h-[500px] overflow-y-auto",
                    item: "relative",
                    selectedItem: "font-medium text-blue-600",
                    label:
                      "flex items-center space-x-2 text-sm py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 cursor-pointer",
                    checkbox:
                      "rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    labelText: "flex-1",
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                    disabledShowMore:
                      "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
                  }}
                />
              </div>

              <hr className="my-6" />

              {/* Location Hierarchy */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  FULL Location Hierarchy
                </h3>
                <p className="text-sm text-blue-500 mb-3">
                  NUTS II - NUTS III - DISTRITO - CONCELHO - FRAGUESIA - ZONA
                </p>
                <HierarchicalMenu
                  attributes={[
                    "location_hierarchy.lvl0", // NUT II
                    "location_hierarchy.lvl1", // NUT III
                    "location_hierarchy.lvl2", // DISTRITO
                    "location_hierarchy.lvl3", // CONCELHO
                    "location_hierarchy.lvl4", // FRAGUESIA
                    "location_hierarchy.lvl5", // ZONA
                  ]}
                  sortBy={["name"]}
                  showParentLevel={true}
                  classNames={{
                    root: "space-y-2 -ml-3",
                    noRefinementRoot: "text-gray-500 italic",
                    list: "space-y-1 pl-2", // Slightly increased padding for better hierarchy visibility
                    item: "relative",
                    selectedItem: "font-medium text-blue-600",
                    parentItem: "mb-2", // Increased spacing for parent items
                    link: "flex items-center justify-between py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 text-sm",
                    selectedItemLink:
                      "bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium",
                    label: "flex-1", // Allow label to take remaining space
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                    disabledShowMore:
                      "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
                  }}
                />
              </div>

              <hr className="my-6" />

              {/* Parish Hierarchy */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Parish Hierarchy</h3>
                <p className="text-sm text-blue-500 mb-3">
                  NUTS II - CONCELHO - FRAGUESIA
                </p>
                <HierarchicalMenu
                  attributes={[
                    "parish_hierarchy.lvl0", // NUT II
                    "parish_hierarchy.lvl1", // CONCELHO
                    "parish_hierarchy.lvl2", // FRAGUESIA
                  ]}
                  sortBy={["name"]}
                  showParentLevel={true}
                  classNames={{
                    root: "space-y-2 -ml-3",
                    noRefinementRoot: "text-gray-500 italic",
                    list: "space-y-1 pl-2", // Slightly increased padding for better hierarchy visibility
                    item: "relative",
                    selectedItem: "font-medium text-blue-600",
                    parentItem: "mb-2", // Increased spacing for parent items
                    link: "flex items-center justify-between py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 text-sm",
                    selectedItemLink:
                      "bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium",
                    label: "flex-1", // Allow label to take remaining space
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                    disabledShowMore:
                      "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
                  }}
                />
              </div>

              <hr className="my-6" />

              {/* Zone Hierarchy */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Zone Hierarchy</h3>
                <p className="text-sm text-blue-500 mb-3">
                  NUTS II - CONCELHO - ZONE
                </p>
                <HierarchicalMenu
                  attributes={[
                    "zone_hierarchy.lvl0", // NUT II
                    "zone_hierarchy.lvl1", // CONCELHO
                    "zone_hierarchy.lvl2", // ZONE
                  ]}
                  sortBy={["name"]}
                  showParentLevel={true}
                  classNames={{
                    root: "space-y-2 -ml-3",
                    noRefinementRoot: "text-gray-500 italic",
                    list: "space-y-1 pl-2", // Slightly increased padding for better hierarchy visibility
                    item: "relative",
                    selectedItem: "font-medium text-blue-600",
                    parentItem: "mb-2", // Increased spacing for parent items
                    link: "flex items-center justify-between py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 text-sm",
                    selectedItemLink:
                      "bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium",
                    label: "flex-1", // Allow label to take remaining space
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                    disabledShowMore:
                      "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
                  }}
                />
              </div>

              <hr className="my-6" />

              {/* Category */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Category</h3>
                <RefinementList
                  attribute="category_name"
                  searchable={true}
                  showMore={true}
                  sortBy={["count:desc", "name:asc"]}
                  limit={10}
                  showMoreLimit={1000}
                  classNames={{
                    root: "space-y-2",
                    noRefinementRoot: "text-gray-500 italic",
                    searchBox: "relative",
                    noResults: "text-gray-500 text-sm italic px-2",
                    list: "space-y-1",
                    item: "relative",
                    selectedItem: "font-medium text-blue-600",
                    label:
                      "flex items-center space-x-2 text-sm py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 cursor-pointer",
                    checkbox:
                      "rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    labelText: "flex-1",
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                    disabledShowMore:
                      "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
                  }}
                />
              </div>

              <hr className="my-6" />

              {/* Sub Category */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Sub Category</h3>
                <RefinementList
                  attribute="sub_category_name"
                  searchable={true}
                  showMore={true}
                  sortBy={["count:desc", "name:asc"]}
                  limit={10}
                  showMoreLimit={1000}
                  classNames={{
                    root: "space-y-2",
                    noRefinementRoot: "text-gray-500 italic",
                    searchBox: "relative",
                    noResults: "text-gray-500 text-sm italic px-2",
                    list: "space-y-1 max-h-[500px] overflow-y-auto",
                    item: "relative",
                    selectedItem: "font-medium text-blue-600",
                    label:
                      "flex items-center space-x-2 text-sm py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 cursor-pointer",
                    checkbox:
                      "rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    labelText: "flex-1",
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                    disabledShowMore:
                      "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
                  }}
                />
              </div>

              <hr className="my-6" />

              {/* Category Hierarchy */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Category Hierarchy
                </h3>
                <p className="text-sm text-blue-500 mb-3">
                  CATEGORY - SUBCATEGORY
                </p>
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
                    list: "space-y-1 pl-2", // Slightly increased padding for better hierarchy visibility
                    item: "relative",
                    selectedItem: "font-medium text-blue-600",
                    parentItem: "mb-2", // Increased spacing for parent items
                    link: "flex items-center justify-between py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 text-sm",
                    selectedItemLink:
                      "bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium",
                    label: "flex-1", // Allow label to take remaining space
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                    disabledShowMore:
                      "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
                  }}
                />
              </div>

              <hr className="my-6" />

              {/* Rooms */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">{t("rooms")}</h3>
                <RefinementList
                  attribute="rooms"
                  searchable={true}
                  showMore={true}
                  sortBy={["count:desc", "name:asc"]}
                  limit={10}
                  showMoreLimit={1000}
                  classNames={{
                    root: "space-y-2",
                    noRefinementRoot: "text-gray-500 italic",
                    searchBox: "relative",
                    noResults: "text-gray-500 text-sm italic px-2",
                    list: "space-y-1 max-h-[500px] overflow-y-auto",
                    item: "relative",
                    selectedItem: "font-medium text-blue-600",
                    label:
                      "flex items-center space-x-2 text-sm py-1 px-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 cursor-pointer",
                    checkbox:
                      "rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    labelText: "flex-1",
                    count:
                      "ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5",
                    showMore:
                      "w-full text-sm text-blue-600 hover:text-blue-700 mt-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors text-center",
                    disabledShowMore:
                      "w-full text-sm text-gray-400 mt-2 cursor-not-allowed py-1 px-2 rounded text-center",
                  }}
                />
              </div>
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
            showPrevious={false}
            hitComponent={({ hit }) => (
              <PropertyHitComponent hit={hit} locale={currentLocale} />
            )}
            classNames={{
              root: "mt-6",
              list: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
              loadMore: "hidden",
            }}
          />

          {/* Loading indicator and sentinel */}
          <div className="relative py-4">
            <div ref={setSentinelRef} style={{ height: "1px" }} />
            {isLoading && (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />
    </div>
  );
}
