export const INSTANT_SEARCH_INDEX_NAME =
  process.env.NEXT_PUBLIC_TYPESENSE_INDEX_NAME;
export const INSTANT_SEARCH_QUERY_SUGGESTIONS =
  process.env.NEXT_PUBLIC_INSTANT_SEARCH_QUERY_SUGGESTIONS;
export const INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES = [
  "parish_hierarchy.lvl0",
  "parish_hierarchy.lvl1",
  "parish_hierarchy.lvl2",
];
