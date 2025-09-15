"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, Clock, RefreshCw } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components (client only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface ActiveBus {
  vehicleId: string;
  registrationNumber: string;
  busName?: string;
  type: "BUS" | "MINIBUS";
  routeName: string;
  location: {
    lat: number;
    lng: number;
  };
  status:
    | "ON_SCHEDULE"
    | "DELAYED_TRAFFIC"
    | "DELAYED_BREAKDOWN"
    | "DELAYED_OTHER"
    | "ONGOING"
    | "OFFLINE";
  lastUpdated: Date;
}

interface BusStop {
  name: string;
  description: string;
  routeName: string;
  location: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  lastUpdated: Date;
}

export function DriverLiveMap() {
  const [busLocations, setBusLocations] = useState<ActiveBus[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedBus, setSelectedBus] = useState<ActiveBus | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDetails, setShowDetails] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);

  // Load Leaflet on client only
  useEffect(() => {
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/bus-icon.png",
        iconUrl: "/bus-icon.png",
        shadowUrl: null,
      });

      const stopIcon = L.icon({
        iconUrl: "/map-marker-icon.svg",
        iconRetinaUrl: "/map-marker-icon.svg",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const createBusIcon = (type: "BUS" | "MINIBUS", status: string) => {
        const color =
          status === "ON_SCHEDULE"
            ? "#10b981"
            : status.includes("DELAYED")
            ? "#f59e0b"
            : "#6b7280";
        const size = type === "BUS" ? 28 : 22;
        return L.divIcon({
          html: `
            <div style="
              background-color: ${color};
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: ${type === "BUS" ? "12px" : "10px"};
            ">
              ${type === "BUS" ? "🚌" : "🚐"}
            </div>
          `,
          className: "custom-bus-icon",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      };

      setLeaflet({ L, stopIcon, createBusIcon });
    });
  }, []);

  // Fetch buses
  const fetchBusLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/vehicles/locations");
      if (response.ok) {
        const locations = await response.json();
        const formattedLocations = locations.map((loc: any) => ({
          ...loc,
          lastUpdated: new Date(loc.lastUpdated),
        }));
        setBusLocations(formattedLocations);
        setIsConnected(true);
        setLastUpdate(new Date());
      } else {
        setIsConnected(false);
        setError("Failed to fetch bus locations");
      }
    } catch (err) {
      console.error(err);
      setIsConnected(false);
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch stops
  const fetchStops = useCallback(async () => {
    try {
      const response = await fetch("/api/stops");
      if (response.ok) {
        const stops = await response.json();
        const formattedStops = stops.map((stop: any) => ({
          name: stop.name,
          description: stop.description,
          location: stop.location.coordinates,
          isActive: stop.isActive,
        }));
        setStops(formattedStops);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchStops();
  }, [fetchStops]);

  useEffect(() => {
    fetchBusLocations();
    const interval = setInterval(fetchBusLocations, 5000);
    return () => clearInterval(interval);
  }, [fetchBusLocations]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!leaflet) return <p>Loading map...</p>; // wait until leaflet is ready

  const { L, stopIcon, createBusIcon } = leaflet;

  const getStatusColor = (status: string) => {
    if (status === "ON_SCHEDULE" || status === "ONGOING")
      return "text-green-600";
    if (status.includes("DELAYED")) return "text-orange-600";
    if (status === "OFFLINE") return "text-gray-600";
    return "text-gray-600";
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === "ON_SCHEDULE" || status === "ONGOING") return "default";
    if (status.includes("DELAYED")) return "destructive";
    if (status === "OFFLINE") return "secondary";
    return "secondary";
  };

  const formatStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Live Bus Tracking</h2>
          <p className="text-gray-600 text-sm">
            Track all active buses in real-time
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBusLocations}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Status Indicators */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>On Schedule</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span>Delayed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <span>Offline</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
        {lastUpdate && (
          <div className="flex items-center gap-1 text-gray-500">
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height: "300px", width: "100%" }}>
            <MapContainer
              center={[22.646494, 92.17547]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              className="z-0 rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Stop Markers */}
              {stops.map((stop, i) => (
                <Marker
                  key={`stop-${i}`}
                  position={[stop.location[1], stop.location[0]]}
                  icon={stopIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{stop.name}</h3>
                      {stop.description && (
                        <p className="text-sm text-gray-600">
                          {stop.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">Bus Stop</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Bus Markers */}
              {busLocations.map((bus) => (
                <Marker
                  key={bus.vehicleId}
                  position={[bus.location.lat, bus.location.lng]}
                  icon={createBusIcon(bus.type, bus.status)}
                  eventHandlers={{
                    click: () => {
                      setSelectedBus(bus);
                      setShowDetails(true);
                    },
                  }}
                  zIndexOffset={1000}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">
                        {bus.busName || bus.registrationNumber}
                      </h3>
                      {bus.busName && (
                        <p className="text-xs text-gray-500">
                          {bus.registrationNumber}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">{bus.routeName}</p>
                      <p className="text-sm">
                        <span className={getStatusColor(bus.status)}>
                          {formatStatus(bus.status)}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Last updated:{" "}
                        {new Date(bus.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Active Buses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Active Buses</CardTitle>
              <CardDescription>
                {busLocations.length} buses currently active
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide" : "Show"} Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-4 text-red-500">
              <Bus className="h-8 w-8 mx-auto mb-2 text-red-300" />
              <p className="mb-2 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBusLocations}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Try Again
              </Button>
            </div>
          )}
          {!error && busLocations.length === 0 && isLoading && (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-4 w-4 animate-spin text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">Loading buses...</span>
            </div>
          )}
          {!error && busLocations.length === 0 && !isLoading && (
            <div className="text-center py-4 text-gray-500">
              <Bus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No active buses found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBusLocations}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          )}
          {busLocations.length > 0 && (
            <div className="space-y-3">
              {busLocations.map((bus) => (
                <div
                  key={bus.vehicleId}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBus?.vehicleId === bus.vehicleId
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedBus(bus);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Bus className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {bus.busName || bus.registrationNumber}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {bus.type}
                      </Badge>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(bus.status)}
                      className="text-xs"
                    >
                      {formatStatus(bus.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{bus.routeName}</p>
                  {showDetails && (
                    <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>
                          {bus.location.lat.toFixed(4)},{" "}
                          {bus.location.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Updated:</span>
                        <span>
                          {new Date(bus.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Status */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>
    </div>
  );
}
