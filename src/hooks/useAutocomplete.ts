import { useConnector } from "react-instantsearch";
import connectAutocomplete from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";
import type { Hit, BaseHit } from "instantsearch.js";
import type { AutocompleteConnectorParams } from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";

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
  indices: Array<{ hits: Array<Hit<PropertyHit>> }>;
  currentRefinement: string;
  refine: (value: string) => void;
  $$type: "ais.autocomplete";
};

export function useAutocomplete(
  props?: AutocompleteConnectorParams
): AutocompleteResult {
  "use client";

  return useConnector<AutocompleteConnectorParams, AutocompleteResult>(
    connectAutocomplete,
    props
  ) as AutocompleteResult;
}
