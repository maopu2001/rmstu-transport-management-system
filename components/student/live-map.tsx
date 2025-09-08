"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, Clock } from "lucide-react";
import { useWebSocket } from "@/lib/websocket-context";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/bus-icon.png",
  iconUrl: "/bus-icon.png",
  shadowUrl: null,
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
    | "DELAYED_OTHER";
  lastUpdated: Date;
}

const createBusIcon = (type: "BUS" | "MINIBUS", status: string) => {
  const color =
    status === "ON_SCHEDULE"
      ? "#10b981"
      : status.includes("DELAYED")
      ? "#f59e0b"
      : "#6b7280";
  const size = type === "BUS" ? 32 : 24;

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${type === "BUS" ? "14px" : "12px"};
      ">
        ${type === "BUS" ? "🚌" : "🚐"}
      </div>
    `,
    className: "custom-bus-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export function LiveMap() {
  const { busLocations, isConnected } = useWebSocket();
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === "ON_SCHEDULE") return "text-green-600";
    if (status.includes("DELAYED")) return "text-orange-600";
    return "text-gray-600";
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === "ON_SCHEDULE") return "default";
    if (status.includes("DELAYED")) return "destructive";
    return "secondary";
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            Live Bus Tracking
          </h1>
          <p className="text-gray-600">Track all active buses in real-time</p>
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>On Schedule</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Delayed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span>{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[22.646494, 92.17547]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Bus Markers */}
            {busLocations.map((bus) => (
              <Marker
                key={bus.vehicleId}
                position={[bus.location.lat, bus.location.lng]}
                icon={createBusIcon(bus.type, bus.status)}
                eventHandlers={{
                  click: () => setSelectedBus(bus),
                }}
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

        {/* Sidebar */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Active Buses ({busLocations.length})
            </h2>

            <div className="space-y-3">
              {busLocations.map((bus) => (
                <Card
                  key={bus.vehicleId}
                  className={`cursor-pointer transition-colors ${
                    selectedBus?.vehicleId === bus.vehicleId
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedBus(bus)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Bus className="h-4 w-4" />
                        <span className="font-medium">
                          {bus.busName || bus.registrationNumber}
                        </span>
                        {bus.busName && (
                          <span className="text-xs text-gray-500">
                            ({bus.registrationNumber})
                          </span>
                        )}
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

                    <p className="text-sm text-gray-600 mb-2">
                      {bus.routeName}
                    </p>

                    <div className="mt-2 text-xs text-gray-500">
                      <div>
                        Last updated:{" "}
                        {new Date(bus.lastUpdated).toLocaleTimeString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Bus Details */}
            {selectedBus && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedBus.busName || selectedBus.registrationNumber}
                  </CardTitle>
                  {selectedBus.busName && (
                    <p className="text-xs text-gray-500">
                      {selectedBus.registrationNumber}
                    </p>
                  )}
                  <CardDescription>{selectedBus.routeName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={getStatusBadgeVariant(selectedBus.status)}>
                      {formatStatus(selectedBus.status)}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Location:</span>
                    <div className="text-gray-600">
                      {selectedBus.location.lat.toFixed(4)},{" "}
                      {selectedBus.location.lng.toFixed(4)}
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Last Updated:</span>
                    <div className="text-gray-600">
                      {selectedBus.lastUpdated.toLocaleString()}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => setSelectedBus(null)}
                  >
                    Close Details
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
