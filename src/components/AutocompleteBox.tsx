"use client";

import type { FormEvent } from "react";
import { type PropertyHit, useAutocomplete } from "@/hooks/useAutocomplete";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSearchBox } from "react-instantsearch";
import { useHierarchicalMenu } from "react-instantsearch";
import { INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES } from "@/config/constants";
import { SearchIcon } from "lucide-react";

export function AutocompleteBox() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  const { query, refine: setQuery } = useSearchBox();
  const { items: parishes } = useHierarchicalMenu({
    attributes: INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  });

  const { hits, getInputProps, getItemProps, inputValue, recentSearches } =
    useAutocomplete();

  const currentParish = parishes.find(({ isRefined }) => isRefined)?.value;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    router.push(
      `/${lng}/properties${query ? `?q=${encodeURIComponent(query)}` : ""}${
        currentParish ? `&parish=${encodeURIComponent(currentParish)}` : ""
      }`
    );
  };

  const getLocalizedField = (hit: PropertyHit, field: string) => {
    if (lng === "pt") return hit[field];
    const localizedField = hit[`${field}_${lng}`];
    return localizedField || hit[field]; // Fallback to default if translation not available
  };

  return (
    <div className="relative w-full" aria-label="Property search">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full"
      >
        <input
          {...getInputProps({
            placeholder: t("searchPlaceholder"),
            className:
              "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500",
          })}
        />
        <button
          type="submit"
          className="absolute right-0 w-20 h-10 bg-blue-500 text-white flex items-center justify-center rounded-r-lg"
        >
          {t("search")}
        </button>
      </form>

      {(hits.length > 0 || recentSearches.length > 0) && inputValue && (
        <div className="absolute w-full mt-1 bg-white shadow-md border border-gray-200 max-h-[80vh] overflow-auto z-50">
          {recentSearches.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 px-2 mb-1">
                Recent Searches
              </div>
              {recentSearches.map((search) => (
                <Button
                  key={search.timestamp}
                  onClick={() => {
                    setQuery(search.label);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="text-gray-400">
                    <SearchIcon className="h-4 w-4" />
                  </span>
                  <span>{search.label}</span>
                  {search.category && (
                    <span className="text-xs text-gray-500">
                      in {search.category}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )}

          {hits.map((hit: PropertyHit) => {
            const itemProps = getItemProps({
              item: hit,
              className: "w-full text-left p-4 hover:bg-gray-50",
            });

            return (
              <Button
                key={hit.objectID}
                {...itemProps}
                asChild
                variant="ghost"
                className="w-full text-left p-0 hover:bg-gray-50 transition-colors h-auto border-b-2 border-gray-100 rounded-none"
              >
                <Link
                  href={`/${lng}/property/${getLocalizedField(
                    hit,
                    "slug_url"
                  )}`}
                  className="flex items-start gap-4 w-full hover:bg-gray-50 transition-colors"
                >
                  {hit.photos?.[0]?.url && (
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden">
                      <Image
                        src={hit.photos[0].url}
                        alt={getLocalizedField(hit, "title")}
                        className="object-cover object-center w-full h-full"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        loading="eager"
                        width={64}
                        height={64}
                        quality={50}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {getLocalizedField(hit, "title")}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {hit.zone}
                      {hit.alternate_zone && (
                        <span className="text-gray-500">
                          {" "}
                          ({hit.alternate_zone})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {hit.parish_hierarchy?.[0]?.lvl2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs">
                          {hit.parish_hierarchy[0].lvl2}
                        </span>
                      )}
                      {hit.category_name && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs">
                          {getLocalizedField(hit, "category_name")}
                        </span>
                      )}
                      {hit.business_type_id && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs">
                          {hit.business_type_id}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
