"use client";

import { useEffect, useRef } from "react";

interface Stop {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number]; // [lng, lat] in MongoDB format
  };
  description?: string;
}

interface InteractiveMapProps {
  stops: Stop[];
  onMapClick: (coords: [number, number]) => void;
}

export function InteractiveMap({ stops, onMapClick }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Prevent multiple initializations
    if (leafletMapRef.current) return;

    const initMap = async () => {
      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = (await import("leaflet")).default;

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/map-marker-icon.svg",
          iconUrl: "/map-marker-icon.svg",
          shadowUrl: null,
        });

        // Create map only if it doesn't exist
        if (!leafletMapRef.current && mapRef.current) {
          leafletMapRef.current = L.map(mapRef.current, {
            center: [22.646494, 92.17547],
            zoom: 13,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: false, // Disable double click zoom to prevent conflicts
          });

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(leafletMapRef.current);

          // Create a layer group for markers
          markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);

          // Add initial markers for existing stops
          stops.forEach((stop) => {
            const marker = L.marker([
              stop.location.coordinates[1], // lat
              stop.location.coordinates[0], // lng
            ]).bindPopup(`
              <div>
                <h3 style="font-weight: 600; margin: 0 0 4px 0;">${
                  stop.name
                }</h3>
                ${
                  stop.description
                    ? `<p style="margin: 0; font-size: 12px; color: #666;">${stop.description}</p>`
                    : ""
                }
              </div>
            `);

            // Add marker to the layer group
            markersLayerRef.current.addLayer(marker);
          });

          // Add click handler with debouncing to prevent multiple rapid clicks
          let clickTimeout: NodeJS.Timeout | null = null;
          leafletMapRef.current.on("click", (e: any) => {
            // Clear any existing timeout
            if (clickTimeout) {
              clearTimeout(clickTimeout);
            }

            // Debounce the click handler
            clickTimeout = setTimeout(() => {
              console.log("Map clicked at:", e.latlng.lat, e.latlng.lng);
              onMapClick([e.latlng.lat, e.latlng.lng]);
            }, 150); // 150ms debounce
          });

          // Prevent default context menu to avoid conflicts
          leafletMapRef.current.on("contextmenu", (e: any) => {
            e.originalEvent.preventDefault();
          });

          // Force map to resize properly
          setTimeout(() => {
            if (leafletMapRef.current) {
              leafletMapRef.current.invalidateSize();
            }
          }, 100);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        } finally {
          leafletMapRef.current = null;
          markersLayerRef.current = null;
        }
      }
    };
  }, []); // Only initialize once

  // Update markers when stops change
  useEffect(() => {
    // Wait for both map and markers layer to be initialized
    if (!leafletMapRef.current || !markersLayerRef.current) {
      // If not ready yet, try again after a short delay
      const timeout = setTimeout(() => {
        if (
          leafletMapRef.current &&
          markersLayerRef.current &&
          stops.length > 0
        ) {
          updateMarkersFromStops();
        }
      }, 200);
      return () => clearTimeout(timeout);
    }

    updateMarkersFromStops();

    async function updateMarkersFromStops() {
      if (!leafletMapRef.current || !markersLayerRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Clear existing markers from the layer group
        markersLayerRef.current.clearLayers();

        // Add new markers
        stops.forEach((stop) => {
          const marker = L.marker([
            stop.location.coordinates[1], // lat
            stop.location.coordinates[0], // lng
          ]).bindPopup(`
            <div>
              <h3 style="font-weight: 600; margin: 0 0 4px 0;">${stop.name}</h3>
              ${
                stop.description
                  ? `<p style="margin: 0; font-size: 12px; color: #666;">${stop.description}</p>`
                  : ""
              }
            </div>
          `);

          // Add marker to the layer group
          markersLayerRef.current.addLayer(marker);
        });
      } catch (error) {
        console.error("Error updating markers:", error);
      }
    }
  }, [stops]);

  return (
    <div className="h-96 w-full relative rounded-lg overflow-hidden border bg-gray-50">
      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        style={{
          height: "100%",
          width: "100%",
          zIndex: 1,
        }}
      />
    </div>
  );
}
