"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface BusLocation {
  vehicleId: string;
  registrationNumber: string;
  busName?: string;
  type: "BUS" | "MINIBUS";
  location: {
    lat: number;
    lng: number;
  };
  status: "ON_SCHEDULE" | "DELAYED_TRAFFIC" | "BREAKDOWN" | "OFFLINE";
  routeName: string;
  lastUpdated: Date;
}

interface WebSocketContextType {
  busLocations: BusLocation[];
  isConnected: boolean;
  updateLocation: (
    vehicleId: string,
    location: { lat: number; lng: number },
    status: string
  ) => void;
  startTrip: (vehicleId: string) => void;
  endTrip: (vehicleId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection and fetch real vehicle data
    const initializeConnection = async () => {
      try {
        // Fetch active vehicles with current trips
        const response = await fetch("/api/vehicles/active");
        if (response.ok) {
          const vehicles = await response.json();
          setBusLocations(vehicles);
        }
        setIsConnected(true);
      } catch (error) {
        console.error("Failed to initialize vehicle data:", error);
        setIsConnected(false);
      }
    };

    initializeConnection();

    // Set up periodic location updates from the server
    const locationUpdateInterval = setInterval(async () => {
      if (isConnected) {
        try {
          const response = await fetch("/api/vehicles/locations");
          if (response.ok) {
            const updatedLocations = await response.json();
            setBusLocations(updatedLocations);
          }
        } catch (error) {
          console.error("Failed to fetch location updates:", error);
        }
      }
    }, 10000); // Update every 10 seconds

    return () => {
      clearInterval(locationUpdateInterval);
      setIsConnected(false);
    };
  }, []);

  const updateLocation = async (
    vehicleId: string,
    location: { lat: number; lng: number },
    status: string
  ) => {
    // Update local state immediately for responsive UI
    setBusLocations((prev) =>
      prev.map((bus) =>
        bus.vehicleId === vehicleId
          ? {
              ...bus,
              location,
              status: status as BusLocation["status"],
              lastUpdated: new Date(),
            }
          : bus
      )
    );

    // Send update to server
    try {
      await fetch(`/api/trips/${vehicleId}/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat], // GeoJSON format: [longitude, latitude]
          },
          status,
        }),
      });
    } catch (error) {
      console.error("Failed to update location on server:", error);
    }
  };

  const startTrip = async (vehicleId: string) => {
    setBusLocations((prev) =>
      prev.map((bus) =>
        bus.vehicleId === vehicleId
          ? { ...bus, status: "ON_SCHEDULE", lastUpdated: new Date() }
          : bus
      )
    );

    // Notify server about trip start
    try {
      await fetch(`/api/trips/${vehicleId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Failed to start trip on server:", error);
    }
  };

  const endTrip = async (vehicleId: string) => {
    setBusLocations((prev) =>
      prev.map((bus) =>
        bus.vehicleId === vehicleId
          ? { ...bus, status: "OFFLINE", lastUpdated: new Date() }
          : bus
      )
    );

    // Notify server about trip end
    try {
      await fetch(`/api/trips/${vehicleId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Failed to end trip on server:", error);
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        busLocations,
        isConnected,
        updateLocation,
        startTrip,
        endTrip,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
