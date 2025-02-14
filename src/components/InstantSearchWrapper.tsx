"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";
import { searchClient, indexName } from "@/config/typesense";
import { createInstantSearchRouterNext } from "react-instantsearch-router-nextjs";
import singletonRouter from "next/router";
import type { UiState } from "instantsearch.js";
import type { NextRequest } from "next/server";

type BusinessType = "sale" | "lease";

const businessTypeUrls: Record<BusinessType, string> = {
  sale: "comprar",
  lease: "aluguer",
};

const reverseBusinessTypeUrls = Object.entries(businessTypeUrls).reduce(
  (acc, [key, value]) => {
    acc[value] = key as BusinessType;
    return acc;
  },
  {} as Record<string, BusinessType>
);

function createLocationUrl(county?: string, parish?: string, zone?: string) {
  const parts = [];
  if (county) parts.push(county);
  if (parish) parts.push(parish);
  if (zone) parts.push(zone);
  return parts.join("/");
}

function parseLocationUrl(path: string) {
  const parts = path.split("/").filter(Boolean);
  return {
    county_id: parts[0],
    parish_id: parts[1],
    zone_id: parts[2],
  };
}

interface RouteState {
  query?: string;
  page?: number;
  business_type_id?: BusinessType;
  county_id?: string;
  parish_id?: string;
  zone_id?: string;
}

interface RouterState {
  routeState: RouteState;
}

const routerNext = {
  router: createInstantSearchRouterNext({
    singletonRouter,
    routerOptions: {
      windowTitle({ routeState }: RouterState) {
        if (!routeState) return process.env.NEXT_PUBLIC_APP_NAME || "";

        const { query, business_type_id, county_id, parish_id } = routeState;
        const parts = [];

        if (business_type_id) {
          parts.push(businessTypeUrls[business_type_id] || business_type_id);
        }
        if (county_id) {
          parts.push(county_id);
          if (parish_id) {
            parts.push(parish_id);
          }
        }
        if (query) {
          parts.push(`"${query}"`);
        }

        return parts.length
          ? `${parts.join(" - ")} | ${process.env.NEXT_PUBLIC_APP_NAME || ""}`
          : process.env.NEXT_PUBLIC_APP_NAME || "";
      },

      createURL({
        qsModule,
        routeState,
        location,
      }: {
        qsModule: {
          stringify: (
            params: Record<string, string | number>,
            options: { addQueryPrefix: boolean; arrayFormat: "repeat" }
          ) => string;
        };
        routeState: RouterState;
        location: Location;
      }): string {
        const urlParts = location.href.match(/^(.*?)\/?$/);
        const baseUrl = `${urlParts ? urlParts[1] : ""}/`;

        // Build the path segments
        const pathSegments = [];

        // Add business type if present
        if (routeState.routeState.business_type_id) {
          pathSegments.push(
            businessTypeUrls[routeState.routeState.business_type_id] ||
              routeState.routeState.business_type_id
          );
        }

        // Add location hierarchy
        const locationPath = createLocationUrl(
          routeState.routeState.county_id,
          routeState.routeState.parish_id,
          routeState.routeState.zone_id
        );
        if (locationPath) {
          pathSegments.push(locationPath);
        }

        // Add search term
        if (routeState.routeState.query) {
          pathSegments.push(encodeURIComponent(routeState.routeState.query));
        }

        // Build query parameters for other refinements
        const queryParameters: Record<string, string | number> = {};

        if (
          routeState.routeState.page !== undefined &&
          routeState.routeState.page !== 1
        ) {
          queryParameters.page = routeState.routeState.page;
        }

        const queryString = qsModule.stringify(queryParameters, {
          addQueryPrefix: true,
          arrayFormat: "repeat",
        });

        return `${baseUrl}${pathSegments.join("/")}${queryString}`;
      },

      parseURL({ qsModule, location }): RouterState {
        const pathParts = location.pathname.split("/").filter(Boolean);

        // Extract and validate business type
        const businessType = pathParts[0];
        const business_type_id =
          reverseBusinessTypeUrls[businessType] ||
          (Object.values(businessTypeUrls).includes(businessType)
            ? (businessType as BusinessType)
            : undefined);

        // Extract location parts
        const locationParts = parseLocationUrl(
          pathParts.slice(1, -1).join("/")
        );

        // Extract search query (last part of the path)
        const query =
          pathParts.length > 0
            ? decodeURIComponent(pathParts[pathParts.length - 1])
            : "";

        // Parse query parameters
        const { page, ...otherParams } = qsModule.parse(
          location.search.slice(1)
        );
        const numPage = page ? Number(page) : 1;

        return {
          routeState: {
            business_type_id,
            query,
            page: numPage,
            ...locationParts,
            ...otherParams,
          },
        };
      },

      cleanUrlOnDispose: false,
    },
  }),

  stateMapping: {
    stateToRoute(uiState: UiState): RouteState {
      const indexUiState = uiState[indexName] || {};

      return {
        query: indexUiState.query,
        page: indexUiState.page,
        business_type_id: indexUiState.refinementList?.business_type_id?.[0] as
          | BusinessType
          | undefined,
        county_id: indexUiState.refinementList?.county_id?.[0],
        parish_id: indexUiState.refinementList?.parish_id?.[0],
        zone_id: indexUiState.refinementList?.zone_id?.[0],
      };
    },

    routeToState(routeState: RouteState) {
      return {
        [indexName]: {
          query: routeState.query,
          page: routeState.page,
          refinementList: {
            business_type_id: routeState.business_type_id
              ? [routeState.business_type_id]
              : [],
            county_id: routeState.county_id ? [routeState.county_id] : [],
            parish_id: routeState.parish_id ? [routeState.parish_id] : [],
            zone_id: routeState.zone_id ? [routeState.zone_id] : [],
          },
        },
      };
    },
  },
};

export default function InstantSearchWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InstantSearchNext
      indexName={indexName}
      searchClient={searchClient}
      routing={routerNext}
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      {children}
    </InstantSearchNext>
  );
}

export async function getServerSideProps({ req }: { req: NextRequest }) {
  const protocol = req.headers.get("referer")?.split("://")[0] || "https";
  const serverUrl = `${protocol}://${req.headers.get("host")}${req.url}`;

  return {
    props: {
      serverUrl,
    },
  };
}
