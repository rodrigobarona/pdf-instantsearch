import { useConnector } from "react-instantsearch";
import connectAutocomplete from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";
import type { BaseHit } from "instantsearch.js";
import type { AutocompleteConnectorParams } from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";
import { useSearchBox, useHierarchicalMenu } from "react-instantsearch";
import { useCallback, useEffect, useState } from "react";
import { INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES } from "@/config/constants";
import { debounce } from "lodash";

type AutocompleteResult = {
  indices: Array<{ hits: Array<PropertyHit> }>;
  refine: (value: string) => void;
  $$type: "ais.autocomplete";
};

export type PropertyHit = BaseHit & {
  objectID: string;
  query?: string;
  cover_photo: string;
  title: string;
  county?: string;
  price?: number;
  slug_url?: string;
  zone_hierarchy?: Array<{ lvl0: string }>;
  [key: `title_${string}`]: string;
  [key: `slug_url_${string}`]: string;
};

type RecentSearch = {
  label: string;
  category?: string;
  timestamp: number;
};

const RECENT_SEARCHES_KEY = "recent_property_searches";
const MAX_RECENT_SEARCHES = 5;

export function useAutocomplete() {
  const { query, refine: setQuery } = useSearchBox();
  const { items: categories } = useHierarchicalMenu({
    attributes: INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  });
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [inputValue, setInputValue] = useState(query || "");

  const result = useConnector<AutocompleteConnectorParams, AutocompleteResult>(
    connectAutocomplete,
    {}
  ) as AutocompleteResult;

  // Load recent searches on mount
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  const saveRecentSearch = useCallback(
    (searchQuery: string, category?: string) => {
      const newSearch: RecentSearch = {
        label: searchQuery,
        category,
        timestamp: Date.now(),
      };

      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item.label !== searchQuery);
        const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const debouncedSetQuery = debounce((value: string) => {
    setQuery(value);
  }, 150);

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
      key: item.objectID,
      onClick: () => {
        setQuery(item.query || "");
        if (item.query) {
          saveRecentSearch(item.query, item.zone_hierarchy?.[0]?.lvl0);
        }
      },
    }),
    [setQuery, saveRecentSearch]
  );

  return {
    inputValue,
    getInputProps,
    getItemProps,
    hits: result.indices?.[0]?.hits || [],
    recentSearches,
    categories,
  };
}
