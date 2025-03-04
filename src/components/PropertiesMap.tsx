import React, { useState } from "react";
import {
  useGeoSearch,
  useSearchBox,
  useInstantSearch,
} from "react-instantsearch";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression, LeafletEvent } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import type { BaseHit } from "instantsearch.js";
// Optional: listen to map movements (zoom/drag) to use in order to refine results.
// In a complete integration you might use a refine function to update the search with the new boundaries.

// Define custom icon
const customIcon = L.icon({
  iconUrl: "/img/marker-icon.png", // Make sure this path points to your public directory
  iconSize: [43, 55], // Size of the icon
  iconAnchor: [22, 55], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -55], // Point from which the popup should open relative to the iconAnchor
});

// Add interface for hit type
interface PropertyHit extends BaseHit {
  objectID: string;
  _geoloc: {
    lat: number;
    lng: number;
  };
  title: string;
  cover_photo: string;
  price_on_application: boolean;
  price: number;
  address: string;
  county: string;
  postal_code: string;
  rooms: number;
  bathrooms: number;
  gross_private_area: number;
  category_name: string;
  business_type_id: string;
  last_updated: string;
}

function MapEvents() {
  const { query, refine: refineQuery } = useSearchBox();
  const {
    items,
    refine: refineItems,
    currentRefinement,
    clearMapRefinement,
  } = useGeoSearch();
  const [previousQuery, setPreviousQuery] = useState(query);
  const [skipViewEffect, setSkipViewEffect] = useState(false);

  const onViewChange = ({ target }: LeafletEvent) => {
    setSkipViewEffect(true);

    if (query.length > 0) {
      refineQuery("");
    }

    refineItems({
      northEast: target.getBounds().getNorthEast(),
      southWest: target.getBounds().getSouthWest(),
    });
  };

  const map = useMapEvents({
    zoomend: onViewChange,
    dragend: onViewChange,
  });

  // Center map on first result when query changes
  if (query !== previousQuery) {
    if (currentRefinement) {
      clearMapRefinement();
    }

    if (items.length > 0 && !skipViewEffect) {
      map.setView({
        lat: items[0]._geoloc.lat,
        lng: items[0]._geoloc.lng,
      });
    }

    setSkipViewEffect(false);
    setPreviousQuery(query);
  }

  return null;
}

export default function PropertiesMap() {
  const { results } = useInstantSearch();
  const hits = (results?.hits || []) as PropertyHit[];
  const defaultCenter: LatLngExpression = [38.736946, -9.142685];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={10}
      scrollWheelZoom={true}
      className="w-full h-full"
      style={{ height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents />
      {hits.map((hit) => {
        if (!hit._geoloc) return null;
        const position: [number, number] = [hit._geoloc.lat, hit._geoloc.lng];
        return (
          <Marker key={hit.objectID} position={position} icon={customIcon}>
            <Popup className="property-popup">
              <div className="flex flex-col gap-2 min-w-[300px]">
                {/* Image */}
                <div className="relative w-full h-[160px]">
                  <Image
                    src={hit.cover_photo as string}
                    alt={hit.title as string}
                    className="w-full h-full object-cover rounded-lg"
                    width={300}
                    height={160}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                    sizes="(max-width: 300px) 100vw, 300px"
                    role="presentation"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  {/* Title and Price */}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {hit.title as string}
                    </h3>
                    {hit.price_on_application ? (
                      <span className="text-blue-600">
                        Price on application
                      </span>
                    ) : hit.price ? (
                      <span className="text-blue-600 font-semibold">
                        €{hit.price.toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  {/* Location */}
                  <div className="text-sm text-gray-600">
                    <div>{hit.address as string}</div>
                    <div>{hit.county as string}</div>
                    <div>{hit.postal_code as string}</div>
                  </div>

                  {/* Property Details */}
                  <div className="flex gap-4 text-sm text-gray-600">
                    {hit.rooms > 0 && (
                      <span>
                        {hit.rooms} {hit.rooms === 1 ? "room" : "rooms"}
                      </span>
                    )}
                    {hit.bathrooms > 0 && (
                      <span>
                        {hit.bathrooms} {hit.bathrooms === 1 ? "bath" : "baths"}
                      </span>
                    )}
                    {hit.gross_private_area > 0 && (
                      <span>{hit.gross_private_area}m²</span>
                    )}
                  </div>

                  {/* Category and Status */}
                  <div className="flex gap-2 text-sm">
                    {hit.category_name && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full">
                        {hit.category_name}
                      </span>
                    )}
                    {hit.business_type_id && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {hit.business_type_id}
                      </span>
                    )}
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-gray-500">
                    Last updated:{" "}
                    {new Date(hit.last_updated as string).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
