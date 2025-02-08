import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { debounce } from "@algolia/autocomplete-shared";
import { createLocalStorageRecentSearchesPlugin } from "@algolia/autocomplete-plugin-recent-searches";
import "@algolia/autocomplete-theme-classic";
import { Button } from "./ui/button";

export function AutocompleteBox() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { indices, currentRefinement, refine } = useAutocomplete({
    defaultRefinement: "",
  });

  // Debounce the refinement to prevent too many requests
  const debouncedRefine = useMemo(
    () => debounce((value: string) => refine(value), 300),
    [refine]
  );

  // Create plugins
  const plugins = useMemo(() => {
    const recentSearches = createLocalStorageRecentSearchesPlugin({
      key: "property-search",
      limit: 5,
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setInputValue(item.label);
            handleSubmit(new Event("submit") as any, item.label);
          },
        };
      },
    });

    return [recentSearches];
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (event: React.FormEvent, query = inputValue) => {
    event.preventDefault();
    setIsOpen(false);
    router.push(
      `/${lng}/properties${query ? `?q=${encodeURIComponent(query)}` : ""}`
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    debouncedRefine(value);
    setIsOpen(Boolean(value));
  };

  const handleSuggestionClick = (hit: any) => {
    const query = hit[`title_${lng}` as keyof typeof hit] || hit.title;
    setInputValue(query);
    handleSubmit(new Event("submit") as any, query);
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(Boolean(inputValue))}
          placeholder={t("searchPlaceholder")}
          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-0 w-20 h-10 bg-blue-500 text-white flex items-center justify-center rounded-r-lg hover:bg-blue-600 transition-colors"
        >
          {t("search")}
        </button>
      </form>

      {isOpen &&
        (indices[0]?.hits.length > 0 ||
          plugins[0].data?.getAlgoliaSearchParams().length > 0) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border divide-y divide-gray-100"
          >
            {/* Recent Searches Section */}
            {plugins[0].data?.getAlgoliaSearchParams().length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-sm text-gray-500">
                  {t("recentSearches")}
                </div>
                {plugins[0].data?.getItems().map((item: any) => (
                  <Button
                    key={`recent-${item.label}`}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                    onClick={() => handleSuggestionClick({ title: item.label })}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{item.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {/* Search Results Section */}
            {indices[0]?.hits.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-sm text-gray-500">
                  {t("suggestions")}
                </div>
                {indices[0].hits.map((hit: any, index: number) => (
                  <Button
                    key={`hit-${index}`}
                    className={cn(
                      "w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                    )}
                    onClick={() => handleSuggestionClick(hit)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Cover Photo */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                        {hit.cover_photo ? (
                          <img
                            src={hit.cover_photo}
                            alt={
                              hit[`title_${lng}` as keyof typeof hit] ||
                              hit.title
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-400 text-xs">
                              No image
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title and Location */}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {hit[`title_${lng}` as keyof typeof hit] ||
                              hit.title}
                          </span>
                          {hit.county && (
                            <span className="text-xs text-gray-500">
                              {hit.county}
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        {hit.price && (
                          <div className="mt-1">
                            <span className="text-sm font-medium text-blue-600">
                              €{hit.price.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Property Details */}
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                          {hit.rooms && (
                            <span>
                              {hit.rooms}{" "}
                              {hit.rooms === 1 ? t("room") : t("rooms")}
                            </span>
                          )}
                          {hit.area && <span>{hit.area} m²</span>}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
function refine(value: string): void {
  throw new Error("Function not implemented.");
}
