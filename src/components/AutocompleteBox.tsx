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

export function AutocompleteBox() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  const { query } = useSearchBox();
  const { items: parishes } = useHierarchicalMenu({
    attributes: INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  });

  const { hits, getInputProps, getItemProps, inputValue } = useAutocomplete();

  const currentParish = parishes.find(({ isRefined }) => isRefined)?.value;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    router.push(
      `/${lng}/properties${query ? `?q=${encodeURIComponent(query)}` : ""}${
        currentParish ? `&parish=${encodeURIComponent(currentParish)}` : ""
      }`
    );
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

      {hits.length > 0 && inputValue && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-auto z-50">
          {hits.map((hit: PropertyHit) => {
            const itemProps = getItemProps({
              item: hit,
              className: "w-full text-left p-4 hover:bg-gray-50",
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { key: _key, ...restItemProps } = itemProps;

            return (
              <Button key={hit.objectID} {...restItemProps} asChild>
                <Link
                  href={`/${lng}/properties/${hit.slug_url}`}
                  className="flex items-start gap-4 w-full hover:bg-gray-50/50 transition-colors"
                >
                  <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-lg">
                    {hit.photos?.[0]?.url && (
                      <Image
                        src={hit.photos[0].url}
                        alt={hit.title}
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        loading="eager"
                        fill
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {hit.title}
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
                      {hit.zone_hierarchy?.[0]?.lvl0 && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {hit.zone_hierarchy[0].lvl0}
                        </span>
                      )}
                      {hit.category_name && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {hit.category_name}
                        </span>
                      )}
                      {hit.business_type_id && (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
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
