import { useConnector } from "react-instantsearch";
import connectAutocomplete from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";
import type { BaseHit } from "instantsearch.js";
import type { AutocompleteConnectorParams } from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";
import { useSearchBox } from "react-instantsearch";
import { useCallback } from "react";

export type PropertyHit = BaseHit & {
  objectID: string;
  query?: string;
  cover_photo: string;
  title: string;
  county?: string;
  price?: number;
  slug_url?: string;
  [key: `title_${string}`]: string;
  [key: `slug_url_${string}`]: string;
};

type AutocompleteResult = {
  indices: Array<{ hits: Array<PropertyHit> }>;
  hits: PropertyHit[];
  refine: (value: string) => void;
  $$type: "ais.autocomplete";
  getInputProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  getItemProps: (props: {
    item: PropertyHit;
    className?: string;
  }) => Record<string, unknown>;
  inputValue: string;
};

export function useAutocomplete() {
  const { query, refine } = useSearchBox();

  const result = useConnector<AutocompleteConnectorParams, AutocompleteResult>(
    connectAutocomplete,
    {}
  ) as AutocompleteResult;

  const getInputProps = useCallback(
    (props: Record<string, unknown> = {}) => ({
      ...props,
      value: query,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        refine(e.target.value);
      },
    }),
    [query, refine]
  );

  const getItemProps = useCallback(
    ({ item, className }: { item: PropertyHit; className?: string }) => ({
      className,
      key: item.objectID,
      onClick: () => refine(item.query || ""),
    }),
    [refine]
  );

  return {
    inputValue: query || "",
    getInputProps,
    getItemProps,
    hits: result.indices?.[0]?.hits || [],
  };
}
