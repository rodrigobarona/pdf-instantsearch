import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

/**
 * Configure and export the Typesense InstantSearch adapter.
 * Environment variables prefixed with NEXT_PUBLIC_ are exposed to the client.
 */
const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY || "", // Use a search-only API key
    nearestNode: {
      // This is the special Load Balanced hostname that you'll see in the Typesense Cloud dashboard if you turn on High Availability
      host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || "",
      port: Number.parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || "443"),
      protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || "https",
    },
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST_NODE_1 || "",
        port: Number.parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || "443"),
        path: "", // Adjust if Typesense is hosted on a subpath
        protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || "https",
      },
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST_NODE_2 || "",
        port: Number.parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || "443"),
        path: "", // Adjust if Typesense is hosted on a subpath
        protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || "https",
      },
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST_NODE_3 || "",
        port: Number.parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || "443"),
        path: "", // Adjust if Typesense is hosted on a subpath
        protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || "https",
      },
    ],
    cacheSearchResultsForSeconds: 2 * 60, // Cache search results for 2 minutes
  },
  additionalSearchParameters: {
    // Updated based on your Typesense schema (using valid fields from the schema)
    query_by: "title,description,category_name",
  },
  geoLocationField: "_geoloc", // This is the field that contains the geolocation data
});

export const searchClient = typesenseInstantsearchAdapter.searchClient;
export const indexName =
  process.env.NEXT_PUBLIC_TYPESENSE_INDEX_NAME || "properties";
