"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface BusLocation {
  vehicleId: string
  registrationNumber: string
  type: "BUS" | "MINIBUS"
  location: {
    lat: number
    lng: number
  }
  status: "ON_SCHEDULE" | "DELAYED_TRAFFIC" | "BREAKDOWN" | "OFFLINE"
  routeName: string
  lastUpdated: Date
}

interface WebSocketContextType {
  busLocations: BusLocation[]
  isConnected: boolean
  updateLocation: (vehicleId: string, location: { lat: number; lng: number }, status: string) => void
  startTrip: (vehicleId: string) => void
  endTrip: (vehicleId: string) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Mock WebSocket connection simulation
  useEffect(() => {
    // Simulate connection
    setIsConnected(true)

    // Initialize with mock bus data
    const mockBuses: BusLocation[] = [
      {
        vehicleId: "1",
        registrationNumber: "RMSTU-001",
        type: "BUS",
        location: { lat: 22.4569, lng: 91.9677 }, // Chittagong coordinates
        status: "ON_SCHEDULE",
        routeName: "Campus to City Center",
        lastUpdated: new Date(),
      },
      {
        vehicleId: "2",
        registrationNumber: "RMSTU-002",
        type: "MINIBUS",
        location: { lat: 22.4589, lng: 91.9697 },
        status: "ON_SCHEDULE",
        routeName: "Hostel Route",
        lastUpdated: new Date(),
      },
    ]

    setBusLocations(mockBuses)

    // Simulate real-time location updates
    const interval = setInterval(() => {
      setBusLocations((prev) =>
        prev.map((bus) => ({
          ...bus,
          location: {
            lat: bus.location.lat + (Math.random() - 0.5) * 0.001,
            lng: bus.location.lng + (Math.random() - 0.5) * 0.001,
          },
          lastUpdated: new Date(),
        })),
      )
    }, 5000) // Update every 5 seconds

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [])

  const updateLocation = (vehicleId: string, location: { lat: number; lng: number }, status: string) => {
    setBusLocations((prev) =>
      prev.map((bus) =>
        bus.vehicleId === vehicleId
          ? {
              ...bus,
              location,
              status: status as BusLocation["status"],
              lastUpdated: new Date(),
            }
          : bus,
      ),
    )
  }

  const startTrip = (vehicleId: string) => {
    setBusLocations((prev) =>
      prev.map((bus) =>
        bus.vehicleId === vehicleId ? { ...bus, status: "ON_SCHEDULE", lastUpdated: new Date() } : bus,
      ),
    )
  }

  const endTrip = (vehicleId: string) => {
    setBusLocations((prev) =>
      prev.map((bus) => (bus.vehicleId === vehicleId ? { ...bus, status: "OFFLINE", lastUpdated: new Date() } : bus)),
    )
  }

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
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}
