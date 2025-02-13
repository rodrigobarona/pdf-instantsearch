"use client";

import type { BaseItem } from "@algolia/autocomplete-core";
import type { AutocompleteOptions } from "@algolia/autocomplete-js";

import {
  createElement,
  Fragment,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { createRoot, type Root } from "react-dom/client";

import { useSearchBox, usePagination } from "react-instantsearch";
import { autocomplete } from "@algolia/autocomplete-js";
import { debounce } from "@algolia/autocomplete-shared";
import { useRouter, useParams } from "next/navigation";

import "@algolia/autocomplete-theme-classic";

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  className?: string;
};

type SetInstantSearchUiStateOptions = {
  query: string;
};

export function Autocomplete({
  className,
  ...autocompleteProps
}: AutocompleteProps) {
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  const autocompleteContainer = useRef<HTMLDivElement>(null);
  const panelRootRef = useRef<Root | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  const { query, refine: setQuery } = useSearchBox();
  const { refine: setPage } = usePagination();

  const [instantSearchUiState, setInstantSearchUiState] =
    useState<SetInstantSearchUiStateOptions>({ query });
  const debouncedSetInstantSearchUiState = debounce(
    setInstantSearchUiState,
    500
  );

  const stableProps = useRef(autocompleteProps).current;

  useEffect(() => {
    setQuery(instantSearchUiState.query);
    setPage(0);
  }, [instantSearchUiState, setQuery, setPage]);

  const handleSubmit = useCallback(
    (event: React.FormEvent, query = instantSearchUiState.query) => {
      event.preventDefault();
      router.push(
        `/${lng}/properties${query ? `?q=${encodeURIComponent(query)}` : ""}`
      );
    },
    [lng, instantSearchUiState.query, router]
  );

  useEffect(() => {
    if (!autocompleteContainer.current) {
      return;
    }

    const autocompleteInstance = autocomplete({
      ...stableProps,
      container: autocompleteContainer.current,
      initialState: { query },
      onReset() {
        setInstantSearchUiState({ query: "" });
      },
      onSubmit({ state }) {
        handleSubmit(
          { preventDefault: () => {} } as React.FormEvent,
          state.query
        );
      },
      onStateChange({ prevState, state }) {
        if (prevState.query !== state.query) {
          debouncedSetInstantSearchUiState({ query: state.query });
        }
      },
      renderer: { createElement, Fragment, render: () => {} },
      render({ children }, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root;

          panelRootRef.current?.unmount();
          panelRootRef.current = createRoot(root);
        }

        panelRootRef.current.render(children);
      },
    });

    return () => autocompleteInstance.destroy();
  }, [stableProps, debouncedSetInstantSearchUiState, handleSubmit, query]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={className} ref={autocompleteContainer} />
    </form>
  );
}

export default Autocomplete;
