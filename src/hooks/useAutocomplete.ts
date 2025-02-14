import { useConnector } from "react-instantsearch";
import connectAutocomplete from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";
import type { BaseHit } from "instantsearch.js";
import type { AutocompleteConnectorParams } from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";
import { useSearchBox, useHierarchicalMenu } from "react-instantsearch";
import { useCallback, useState, useEffect, useMemo } from "react";
import { INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES } from "@/config/constants";
import { createLocalStorageRecentSearchesPlugin } from "@algolia/autocomplete-plugin-recent-searches";
import type { Hit } from "instantsearch.js";

export type PropertyHit = BaseHit & {
  objectID: string;
  query?: string;
  cover_photo: string;
  title: string;
  title_en?: string;
  title_fr?: string;
  county?: string;
  price?: number;
  slug_url?: string;
  slug_url_en?: string;
  slug_url_fr?: string;
  category_name: string;
  category_name_en?: string;
  category_name_fr?: string;
  zone_hierarchy?: Array<{ lvl0: string }>;
  photos?: Array<{ url: string }>;
  zone?: string;
  alternate_zone?: string;
  business_type_id?: string;
  parish_hierarchy?: Array<{ lvl2: string }>;
};

const RECENT_SEARCHES_KEY = "recent_property_searches";
const MAX_RECENT_SEARCHES = 5;

// Define a type for recent searches items.
export type RecentSearchesItem = {
  query: string;
  category?: string;
  timestamp: number;
};

// Define a type for highlighted recent search items.
type HighlightedRecentSearchesItem = {
  item: RecentSearchesItem;
};

// Define the autocomplete result type.
type AutocompleteResult = {
  indices: Array<{ hits: Array<Hit<PropertyHit>> }>;
  refine: (value: string) => void;
  $$type: "ais.autocomplete";
};

export function useAutocomplete(
  props?: Parameters<typeof connectAutocomplete>[0]
) {
  const { query, refine: setQuery } = useSearchBox();
  const { items: categories } = useHierarchicalMenu({
    attributes: INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  });
  const [inputValue, setInputValue] = useState(query || "");

  const result = useConnector<AutocompleteConnectorParams, AutocompleteResult>(
    connectAutocomplete,
    { ...props }
  ) as AutocompleteResult;

  const debouncedSetQuery = useCallback(
    (value: string) => {
      setQuery(value);
    },
    [setQuery]
  );

  const getInputProps = useCallback(
    (props: Record<string, unknown> = {}) => ({
      ...props,
      value: inputValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        debouncedSetQuery(e.target.value);
      },
    }),
    [inputValue, debouncedSetQuery]
  );

  const getItemProps = useCallback(
    ({ item, className }: { item: PropertyHit; className?: string }) => ({
      className,
      onClick: () => {
        setQuery(item.query || "");
        // Let the plugin handle adding the recent search.
      },
    }),
    [setQuery]
  );

  // Create state for resolved recent searches.
  const [resolvedRecentSearches, setResolvedRecentSearches] = useState<
    RecentSearchesItem[]
  >([]);

  const recentSearchesPlugin = useMemo(
    () =>
      createLocalStorageRecentSearchesPlugin({
        key: RECENT_SEARCHES_KEY,
        limit: MAX_RECENT_SEARCHES,
        transformSource({ source }) {
          return {
            ...source,
            onSelect({ item }) {
              // If the query is null, fall back to the current inputValue.
              const searchItem = item as { query?: string };
              if (!searchItem.query) {
                searchItem.query = inputValue;
              }
              setQuery(searchItem.query);
            },
          };
        },
      }),
    [inputValue, setQuery]
  );

  const getAllRecentSearches = recentSearchesPlugin.data?.getAll;
  useEffect(() => {
    if (getAllRecentSearches) {
      Promise.resolve(getAllRecentSearches())
        .then((res) => {
          // Map the returned items to ensure each has a 'query' property.
          const items = (res as unknown as HighlightedRecentSearchesItem[]).map(
            (highlighted) => ({
              query: highlighted.item.query || "",
              category: highlighted.item.category,
              timestamp: highlighted.item.timestamp,
            })
          );
          setResolvedRecentSearches(items);
        })
        .catch(() => setResolvedRecentSearches([]));
    }
  }, [getAllRecentSearches]);

  return {
    inputValue,
    getInputProps,
    getItemProps,
    hits: result.indices?.[0]?.hits || [],
    recentSearches: resolvedRecentSearches,
    categories,
  };
}
