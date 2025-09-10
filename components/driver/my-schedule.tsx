"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  MapPin,
  Users,
  Play,
  Square,
  X,
  AlertTriangle,
  Loader2,
  Navigation,
  Route,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Schedule {
  _id: string;
  route: {
    _id: string;
    name: string;
    stops: Array<{ stop: { name: string } }>;
  };
  vehicle: {
    _id: string;
    registrationNumber: string;
    busName: string;
  };
  departureTime: string;
  daysOfWeek: number[];
  isActive: boolean;
}

interface Trip {
  _id: string;
  schedule: {
    _id: string;
    route: {
      name: string;
      stops: Array<{ stop: { name: string } }>;
    };
    departureTime: string;
  };
  vehicle: {
    _id: string;
    registrationNumber: string;
    busName: string;
  };
  date: string;
  status: "PENDING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  driverStatus:
    | "ON_SCHEDULE"
    | "DELAYED_TRAFFIC"
    | "DELAYED_BREAKDOWN"
    | "DELAYED_OTHER";
  passengers?: number;
  startTime?: string;
  endTime?: string;
}

export function MySchedule() {
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("my-trips");
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<string>("unknown");
  const [lastKnownLocation, setLastKnownLocation] = useState<{
    lat: number;
    lng: number;
    timestamp: Date;
  } | null>(null);
  const [locationErrorCount, setLocationErrorCount] = useState(0);
  const { toast } = useToast();

  // Get current driver ID (in real app, this would come from auth)
  const currentDriverId = "current-driver-id"; // TODO: Get from auth context

  useEffect(() => {
    // Check location permission status on component mount
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          setLocationPermissionStatus(result.state);
          result.addEventListener("change", () => {
            setLocationPermissionStatus(result.state);
          });
        })
        .catch(() => {
          setLocationPermissionStatus("unknown");
        });
    }
  }, []);

  const fetchAllSchedules = async () => {
    try {
      const response = await fetch("/api/schedules");
      if (!response.ok) throw new Error("Failed to fetch schedules");
      const data = await response.json();
      setAllSchedules(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch all schedules",
        variant: "destructive",
      });
    }
  };

  const fetchMyTrips = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/trips/driver?date=${today}`);
      if (!response.ok) throw new Error("Failed to fetch trips");
      const data = await response.json();
      setMyTrips(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your trips",
        variant: "destructive",
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAllSchedules(), fetchMyTrips()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Monitor ongoing trips and ensure location tracking continues
  useEffect(() => {
    const ongoingTrip = myTrips.find((trip) => trip.status === "ONGOING");

    if (ongoingTrip && !isTrackingLocation) {
      // If there's an ongoing trip but location tracking is not active, restart it
      console.log(
        "Restarting location tracking for ongoing trip:",
        ongoingTrip._id
      );
      startLocationTracking(ongoingTrip._id, ongoingTrip.vehicle._id);
    } else if (!ongoingTrip && isTrackingLocation) {
      // If no ongoing trips but location tracking is active, stop it
      console.log("No ongoing trips found, stopping location tracking");
      stopLocationTracking();
    }
  }, [myTrips, isTrackingLocation]);

  // Periodic check to ensure location tracking for ongoing trips
  useEffect(() => {
    const intervalId = setInterval(() => {
      const ongoingTrip = myTrips.find((trip) => trip.status === "ONGOING");

      if (ongoingTrip && !isTrackingLocation) {
        console.log(
          "Periodic check: Restarting location tracking for ongoing trip"
        );
        startLocationTracking(ongoingTrip._id, ongoingTrip.vehicle._id);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, [myTrips, isTrackingLocation]);

  const testLocationAccess = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      console.log("Test position:", { latitude, longitude });

      setLastKnownLocation({
        lat: latitude,
        lng: longitude,
        timestamp: new Date(),
      });

      toast({
        title: "Location Test Successful",
        description: `Current location: ${latitude.toFixed(
          6
        )}, ${longitude.toFixed(6)}`,
      });
    } catch (error: any) {
      console.error("Location test failed:", error);
      toast({
        title: "Location Test Failed",
        description: `Error: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const startLocationTracking = useCallback(
    (tripId: string, vehicleId: string) => {
      if (!navigator.geolocation) {
        toast({
          title: "Error",
          description: "Geolocation is not supported by this browser",
          variant: "destructive",
        });
        return;
      }

      // Request permission first if needed
      if (navigator.permissions) {
        navigator.permissions
          .query({ name: "geolocation" })
          .then((result) => {
            if (result.state === "denied") {
              toast({
                title: "Permission Denied",
                description:
                  "Please enable location permissions in your browser settings",
                variant: "destructive",
              });
              return;
            }
          })
          .catch((err) => {
            console.warn("Permission query failed:", err);
          });
      }

      try {
        const watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            console.log("Current position:", { latitude, longitude });

            // Reset error count on successful location update
            setLocationErrorCount(0);

            // Store last known location
            setLastKnownLocation({
              lat: latitude,
              lng: longitude,
              timestamp: new Date(),
            });

            // Validate coordinates
            if (
              !latitude ||
              !longitude ||
              latitude < -90 ||
              latitude > 90 ||
              longitude < -180 ||
              longitude > 180
            ) {
              console.error("Invalid coordinates received:", {
                latitude,
                longitude,
              });
              return;
            }

            try {
              const response = await fetch(`/api/trips/${vehicleId}/location`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  location: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                  },
                  status: "ON_SCHEDULE",
                }),
              });

              if (!response.ok) {
                console.error(
                  "Failed to update location:",
                  await response.text()
                );
              }
            } catch (error) {
              console.error("Failed to update location:", error);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            console.error("Error type:", typeof error);
            console.error("Error properties:", Object.keys(error || {}));
            console.error("Error code:", error?.code);
            console.error("Error message:", error?.message);

            let errorMessage = "Failed to get your location";

            // Check if error object exists and has expected properties
            if (error && typeof error === "object") {
              switch (error.code) {
                case 1: // PERMISSION_DENIED
                case error.PERMISSION_DENIED:
                  errorMessage =
                    "Location access denied. Please enable location permissions for this website.";
                  break;
                case 2: // POSITION_UNAVAILABLE
                case error.POSITION_UNAVAILABLE:
                  errorMessage =
                    "Location information is unavailable. Please check your GPS/location services.";
                  break;
                case 3: // TIMEOUT
                case error.TIMEOUT:
                  errorMessage =
                    "Location request timed out. Please try again.";
                  break;
                default:
                  errorMessage = `Location error: ${
                    error.message ||
                    error.toString() ||
                    "Unknown error occurred"
                  }`;
                  break;
              }
            } else {
              errorMessage =
                "Unknown geolocation error occurred. Please check your browser settings.";
            }

            toast({
              title: "Location Error",
              description: errorMessage,
              variant: "destructive",
            });

            // Increment error count
            setLocationErrorCount((prev) => prev + 1);

            // Only stop tracking after multiple consecutive errors or permission denied
            const shouldStopTracking =
              error?.code === 1 ||
              error?.code === error?.PERMISSION_DENIED ||
              locationErrorCount >= 3;

            if (shouldStopTracking) {
              console.log(
                "Stopping location tracking due to persistent errors or permission denied"
              );
              setIsTrackingLocation(false);
              setLocationWatcher(null);
            } else {
              console.log(
                `Location error ${locationErrorCount + 1}/3, will retry...`
              );
              // For ongoing trips, try to restart tracking after a delay
              setTimeout(() => {
                const ongoingTrip = myTrips.find(
                  (trip) => trip.status === "ONGOING"
                );
                if (ongoingTrip && locationErrorCount < 3) {
                  console.log("Retrying location tracking for ongoing trip");
                  startLocationTracking(
                    ongoingTrip._id,
                    ongoingTrip.vehicle._id
                  );
                }
              }, 5000); // Retry after 5 seconds
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout
            maximumAge: 10000, // Allow slightly older positions
          }
        );

        // Fallback: try to get current position immediately
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Initial position obtained:", position.coords);
          },
          (error) => {
            console.warn("Could not get initial position:", error);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 30000,
          }
        );

        setLocationWatcher(watchId);
        setIsTrackingLocation(true);
      } catch (error) {
        console.error("Failed to start location tracking:", error);
        toast({
          title: "Location Error",
          description:
            "Failed to start location tracking. Please check your browser settings.",
          variant: "destructive",
        });
      }
    },
    [locationPermissionStatus, locationErrorCount, myTrips, toast]
  );

  const stopLocationTracking = useCallback(
    (force = false) => {
      // Don't stop tracking if there's an ongoing trip unless forced
      if (!force) {
        const ongoingTrip = myTrips.find((trip) => trip.status === "ONGOING");
        if (ongoingTrip) {
          console.log(
            "Cannot stop location tracking: ongoing trip exists",
            ongoingTrip._id
          );
          toast({
            title: "Location Tracking Required",
            description:
              "Location tracking cannot be stopped while a trip is ongoing",
            variant: "destructive",
          });
          return false;
        }
      }

      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
        setLocationWatcher(null);
      }
      setIsTrackingLocation(false);
      console.log("Location tracking stopped");
      return true;
    },
    [myTrips, toast, locationWatcher]
  );

  const handleStartTrip = async (trip: Trip) => {
    // Check location permission before starting trip
    if (locationPermissionStatus === "denied") {
      toast({
        title: "Location Permission Required",
        description:
          "Please enable location permissions in your browser settings to track trips.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/trips/${trip.vehicle._id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start trip");
      }

      // Start location tracking
      startLocationTracking(trip._id, trip.vehicle._id);

      toast({
        title: "Success",
        description: "Trip started and location tracking enabled",
      });

      fetchMyTrips();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to start trip",
        variant: "destructive",
      });
    }
  };

  const handleStopTrip = async (trip: Trip) => {
    try {
      const response = await fetch(`/api/trips/${trip.vehicle._id}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to stop trip");
      }

      const result = await response.json();

      // Only stop location tracking if the trip was actually completed
      if (result.status === "COMPLETED") {
        stopLocationTracking(true); // Force stop since trip is completed
        toast({
          title: "Success",
          description: "Trip completed successfully",
        });
      } else {
        toast({
          title: "Warning",
          description:
            "Trip end requested but location tracking continues until trip is completed",
          variant: "destructive",
        });
      }

      fetchMyTrips();
    } catch (error) {
      // Don't stop location tracking if there was an error
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to stop trip",
        variant: "destructive",
      });
    }
  };

  const handleCancelTrip = async (trip: Trip) => {
    try {
      const response = await fetch(`/api/trips/${trip._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel trip");
      }

      const result = await response.json();

      // Only stop location tracking if the trip was actually cancelled
      if (result.status === "CANCELLED") {
        stopLocationTracking(true); // Force stop since trip is cancelled
        toast({
          title: "Success",
          description: "Trip cancelled successfully",
        });
      } else {
        toast({
          title: "Warning",
          description:
            "Trip cancellation requested but location tracking continues until trip status changes",
          variant: "destructive",
        });
      }

      fetchMyTrips();
    } catch (error) {
      // Don't stop location tracking if there was an error
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to cancel trip",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (
    tripId: string,
    newStatus: Trip["driverStatus"]
  ) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverStatus: newStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      fetchMyTrips();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Trip["status"]) => {
    switch (status) {
      case "PENDING":
        return "default";
      case "ONGOING":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

  const getDriverStatusColor = (status: Trip["driverStatus"]) => {
    if (status === "ON_SCHEDULE") return "text-green-600";
    if (status.startsWith("DELAYED")) return "text-orange-600";
    return "text-gray-600";
  };

  const getDriverStatusLabel = (status: Trip["driverStatus"]) => {
    switch (status) {
      case "ON_SCHEDULE":
        return "On Schedule";
      case "DELAYED_TRAFFIC":
        return "Delayed - Traffic";
      case "DELAYED_BREAKDOWN":
        return "Delayed - Breakdown";
      case "DELAYED_OTHER":
        return "Delayed - Other";
      default:
        return "On Schedule";
    }
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getCurrentDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isPastDue = (departureTime: string) => {
    const [hours, minutes] = departureTime.split(":").map(Number);
    const tripTime = new Date();
    tripTime.setHours(hours, minutes, 0, 0);
    const timeDiff = currentTime.getTime() - tripTime.getTime();
    return timeDiff > 15 * 60 * 1000; // 15 minutes past
  };

  const getDayName = (dayIndex: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayIndex];
  };

  const isScheduleForToday = (schedule: Schedule) => {
    const today = new Date().getDay();
    return schedule.daysOfWeek.includes(today);
  };

  const isMySchedule = (schedule: Schedule) => {
    return myTrips.some((trip) => trip.schedule._id === schedule._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Time & Date */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-primary">
                {formatCurrentTime()}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {getCurrentDate()}
              </div>
            </div>
            {isTrackingLocation && (
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                <Navigation className="h-4 w-4 text-green-600 animate-pulse" />
                <span className="text-sm text-green-700 font-medium">
                  Location Tracking Active
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Permission Status */}
      {locationPermissionStatus !== "granted" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-800">
                    Location Permission Required
                  </h4>
                  <p className="text-sm text-orange-700 mt-1">
                    {locationPermissionStatus === "denied"
                      ? "Location access is denied. Please enable location permissions in your browser settings to track trips."
                      : "Location permission is needed to track your bus location during trips. Click 'Start Trip' to enable tracking."}
                  </p>
                  {lastKnownLocation && (
                    <p className="text-xs text-orange-600 mt-1">
                      Last location: {lastKnownLocation.lat.toFixed(6)},{" "}
                      {lastKnownLocation.lng.toFixed(6)}
                      at {lastKnownLocation.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={testLocationAccess}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Test Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-trips" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>My Trips</span>
          </TabsTrigger>
          <TabsTrigger
            value="all-schedules"
            className="flex items-center space-x-2"
          >
            <Route className="h-4 w-4" />
            <span>All Schedules</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-trips" className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              My Assigned Trips
            </h2>
            <p className="text-gray-600 text-sm">
              Your assigned trips for today
            </p>
          </div>

          {myTrips.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No trips assigned for today</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myTrips.map((trip) => (
                <Card
                  key={trip._id}
                  className={`${
                    trip.status === "ONGOING" ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {trip.schedule.route.name}
                      </CardTitle>
                      <Badge variant={getStatusColor(trip.status)}>
                        {trip.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{trip.schedule.departureTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {trip.vehicle.busName} (
                          {trip.vehicle.registrationNumber})
                        </span>
                      </div>
                      {trip.passengers && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{trip.passengers}</span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Route Stops */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Route:
                      </p>
                      <p className="text-sm text-gray-600">
                        {trip.schedule.route.stops
                          .map((s) => s.stop.name)
                          .join(" → ")}
                      </p>
                    </div>

                    {/* Driver Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Status:
                      </span>
                      <div className="flex items-center space-x-2">
                        {trip.driverStatus.startsWith("DELAYED") && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${getDriverStatusColor(
                            trip.driverStatus
                          )}`}
                        >
                          {getDriverStatusLabel(trip.driverStatus)}
                        </span>
                      </div>
                    </div>

                    {/* Status Update Dropdown */}
                    {trip.status === "ONGOING" && (
                      <div>
                        <Select
                          value={trip.driverStatus}
                          onValueChange={(value: Trip["driverStatus"]) =>
                            handleStatusChange(trip._id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ON_SCHEDULE">
                              On Schedule
                            </SelectItem>
                            <SelectItem value="DELAYED_TRAFFIC">
                              Delayed - Traffic
                            </SelectItem>
                            <SelectItem value="DELAYED_BREAKDOWN">
                              Delayed - Breakdown
                            </SelectItem>
                            <SelectItem value="DELAYED_OTHER">
                              Delayed - Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Trip Times */}
                    {(trip.startTime || trip.endTime) && (
                      <div className="text-xs text-gray-500 space-y-1">
                        {trip.startTime && (
                          <div>
                            Started:{" "}
                            {new Date(trip.startTime).toLocaleTimeString()}
                          </div>
                        )}
                        {trip.endTime && (
                          <div>
                            Ended: {new Date(trip.endTime).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {trip.status === "PENDING" && (
                        <>
                          {isPastDue(trip.schedule.departureTime) && (
                            <div className="flex items-center space-x-1 text-red-600 text-xs mb-2">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Trip is overdue</span>
                            </div>
                          )}
                          <Button
                            onClick={() => handleStartTrip(trip)}
                            className="flex-1"
                            variant={
                              isPastDue(trip.schedule.departureTime)
                                ? "destructive"
                                : "default"
                            }
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Trip
                          </Button>
                          <Button
                            onClick={() => handleCancelTrip(trip)}
                            variant="outline"
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}

                      {trip.status === "ONGOING" && (
                        <>
                          <Button
                            onClick={() => handleStopTrip(trip)}
                            variant="outline"
                            className="flex-1"
                          >
                            <Square className="h-4 w-4 mr-2" />
                            Stop Trip
                          </Button>
                          <Button
                            onClick={() => handleCancelTrip(trip)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}

                      {trip.status === "COMPLETED" && (
                        <div className="flex-1 text-center py-2 text-sm text-green-600 font-medium">
                          Trip Completed
                        </div>
                      )}

                      {trip.status === "CANCELLED" && (
                        <div className="flex-1 text-center py-2 text-sm text-red-600 font-medium">
                          Trip Cancelled
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {myTrips.filter((t) => t.status === "COMPLETED").length}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {myTrips.filter((t) => t.status === "ONGOING").length}
                  </div>
                  <div className="text-xs text-gray-600">Ongoing</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {myTrips.filter((t) => t.status === "PENDING").length}
                  </div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {myTrips.filter((t) => t.status === "CANCELLED").length}
                  </div>
                  <div className="text-xs text-gray-600">Cancelled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-schedules" className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">All Schedules</h2>
            <p className="text-gray-600 text-sm">
              View all bus schedules in the system
            </p>
          </div>

          {allSchedules.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No schedules available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {allSchedules.map((schedule) => (
                <Card
                  key={schedule._id}
                  className={`${
                    isMySchedule(schedule)
                      ? "ring-2 ring-blue-200 bg-blue-50"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{schedule.route.name}</span>
                        {isMySchedule(schedule) && (
                          <Badge variant="secondary">My Schedule</Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {isScheduleForToday(schedule) && (
                          <Badge variant="default">Today</Badge>
                        )}
                        <Badge
                          variant={
                            schedule.isActive ? "outline" : "destructive"
                          }
                        >
                          {schedule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{schedule.departureTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {schedule.vehicle.busName} (
                          {schedule.vehicle.registrationNumber})
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Route Stops */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Route:
                      </p>
                      <p className="text-sm text-gray-600">
                        {schedule.route.stops
                          .map((s) => s.stop.name)
                          .join(" → ")}
                      </p>
                    </div>

                    {/* Days of Week */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Operating Days:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {schedule.daysOfWeek.map((day) => (
                          <Badge
                            key={day}
                            variant={
                              day === new Date().getDay()
                                ? "default"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {getDayName(day)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
