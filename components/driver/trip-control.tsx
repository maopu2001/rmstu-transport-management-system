"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Clock,
  Users,
  Navigation,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useWebSocket } from "@/lib/websocket-context";

interface ActiveTrip {
  id: string;
  routeName: string;
  vehicleNumber: string;
  startTime: string;
  estimatedEndTime: string;
  currentStop: number;
  totalStops: number;
  stops: Array<{
    name: string;
    reached: boolean;
    estimatedTime: string;
  }>;
  passengers: number;
  status:
    | "On Schedule"
    | "Delayed - Traffic"
    | "Delayed - Breakdown"
    | "Delayed - Other";
}

const mockActiveTrip: ActiveTrip = {
  id: "1",
  routeName: "Campus Loop",
  vehicleNumber: "RMSTU-001",
  startTime: "08:00",
  estimatedEndTime: "08:45",
  currentStop: 2,
  totalStops: 4,
  stops: [
    { name: "Main Gate", reached: true, estimatedTime: "08:00" },
    { name: "Academic Building", reached: true, estimatedTime: "08:15" },
    { name: "Student Hostel", reached: false, estimatedTime: "08:30" },
    { name: "Library", reached: false, estimatedTime: "08:45" },
  ],
  passengers: 28,
  status: "On Schedule",
};

export function TripControl() {
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(
    mockActiveTrip
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isGPSActive, setIsGPSActive] = useState(true);
  const { updateLocation, startTrip, endTrip } = useWebSocket();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTrip && isGPSActive) {
      let locationInterval: NodeJS.Timeout;

      const updateLocationFromGPS = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              updateLocation(
                activeTrip.vehicleNumber,
                location,
                activeTrip.status
              );
            },
            (error) => {
              console.error("GPS Error:", error);
              // Fallback: use last known location or default
              const fallbackLocation = {
                lat: 22.6125,
                lng: 92.1647,
              };
              updateLocation(
                activeTrip.vehicleNumber,
                fallbackLocation,
                activeTrip.status
              );
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            }
          );
        }
      };

      // Update location immediately, then every 30 seconds
      updateLocationFromGPS();
      locationInterval = setInterval(updateLocationFromGPS, 30000);

      return () => {
        if (locationInterval) {
          clearInterval(locationInterval);
        }
      };
    }
  }, [activeTrip, isGPSActive, updateLocation]);

  const handleStatusChange = (newStatus: ActiveTrip["status"]) => {
    if (activeTrip) {
      const updatedTrip = { ...activeTrip, status: newStatus };
      setActiveTrip(updatedTrip);

      // Get current location and update
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            updateLocation(activeTrip.vehicleNumber, location, newStatus);
          },
          (error) => {
            console.error("GPS Error:", error);
            // Use last known location or default
            const fallbackLocation = {
              lat: 22.6125,
              lng: 92.1647,
            };
            updateLocation(
              activeTrip.vehicleNumber,
              fallbackLocation,
              newStatus
            );
          }
        );
      }
    }
  };

  const handleNextStop = () => {
    if (activeTrip && activeTrip.currentStop < activeTrip.totalStops) {
      const updatedStops = activeTrip.stops.map((stop, index) =>
        index === activeTrip.currentStop ? { ...stop, reached: true } : stop
      );

      setActiveTrip({
        ...activeTrip,
        currentStop: activeTrip.currentStop + 1,
        stops: updatedStops,
      });
    }
  };

  const handleStartTrip = () => {
    if (activeTrip) {
      setIsGPSActive(true);
      startTrip(activeTrip.vehicleNumber);
    }
  };

  const handleEndTrip = () => {
    if (activeTrip) {
      endTrip(activeTrip.vehicleNumber);
    }
    setActiveTrip(null);
    setIsGPSActive(false);
  };

  const getStatusColor = (status: ActiveTrip["status"]) => {
    if (status === "On Schedule") return "text-green-600";
    if (status.startsWith("Delayed")) return "text-orange-600";
    return "text-gray-600";
  };

  const getStatusBadgeVariant = (status: ActiveTrip["status"]) => {
    if (status === "On Schedule") return "default";
    if (status.startsWith("Delayed")) return "destructive";
    return "secondary";
  };

  const progress = activeTrip
    ? (activeTrip.currentStop / activeTrip.totalStops) * 100
    : 0;

  if (!activeTrip) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Active Trip
            </h3>
            <p className="text-gray-600">
              Start a trip from your schedule to begin tracking
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{activeTrip.routeName}</CardTitle>
              <CardDescription>{activeTrip.vehicleNumber}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(activeTrip.status)}>
              {activeTrip.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trip Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Trip Progress</span>
              <span>
                {activeTrip.currentStop}/{activeTrip.totalStops} stops
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">Started</div>
                <div className="text-gray-600">{activeTrip.startTime}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">Passengers</div>
                <div className="text-gray-600">{activeTrip.passengers}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPS Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isGPSActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="font-medium">GPS Tracking</span>
            </div>
            <Badge variant={isGPSActive ? "default" : "destructive"}>
              {isGPSActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {isGPSActive
              ? "Your location is being broadcast to students and admin"
              : "Location tracking is disabled"}
          </p>
          {!isGPSActive && activeTrip && (
            <Button onClick={handleStartTrip} className="w-full mt-3" size="sm">
              Start GPS Tracking
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Update Status</CardTitle>
          <CardDescription>
            Let students and admin know your current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={activeTrip.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="On Schedule">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>On Schedule</span>
                </div>
              </SelectItem>
              <SelectItem value="Delayed - Traffic">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span>Delayed - Traffic</span>
                </div>
              </SelectItem>
              <SelectItem value="Delayed - Breakdown">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>Delayed - Breakdown</span>
                </div>
              </SelectItem>
              <SelectItem value="Delayed - Other">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span>Delayed - Other</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Route Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Route Progress</CardTitle>
          <CardDescription>
            Track your progress through the route
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeTrip.stops.map((stop, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    stop.reached
                      ? "bg-green-600 text-white"
                      : index === activeTrip.currentStop
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      stop.reached ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {stop.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stop.estimatedTime}
                  </div>
                </div>
                {stop.reached && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {index === activeTrip.currentStop && (
                  <Navigation className="h-5 w-5 text-primary" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        {activeTrip.currentStop < activeTrip.totalStops && (
          <Button onClick={handleNextStop} className="w-full" size="lg">
            <MapPin className="h-5 w-5 mr-2" />
            Reached Next Stop
          </Button>
        )}

        <Button
          onClick={handleEndTrip}
          variant="outline"
          className="w-full bg-transparent"
          size="lg"
        >
          End Trip
        </Button>
      </div>
    </div>
  );
}
