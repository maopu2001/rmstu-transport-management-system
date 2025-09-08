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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  MapPin,
  Users,
  Play,
  Square,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    registrationNumber: string;
    busName: string;
  };
  date: string;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  const fetchTrips = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/trips/driver?date=${today}`);
      if (!response.ok) throw new Error("Failed to fetch trips");
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStartTrip = async (tripId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ONGOING",
          startTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start trip");
      }

      toast({
        title: "Success",
        description: "Trip started successfully",
      });

      fetchTrips();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to start trip",
        variant: "destructive",
      });
    }
  };

  const handleEndTrip = async (tripId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          endTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to end trip");
      }

      toast({
        title: "Success",
        description: "Trip completed successfully",
      });

      fetchTrips();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to end trip",
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

      fetchTrips();
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
      case "SCHEDULED":
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
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {formatCurrentTime()}
            </div>
            <div className="text-sm text-gray-600 mt-1">{getCurrentDate()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
        <p className="text-gray-600 text-sm">Your assigned trips for today</p>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map((trip) => (
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
                    {trip.vehicle.busName} ({trip.vehicle.registrationNumber})
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
                <p className="text-sm font-medium text-gray-700 mb-2">Route:</p>
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
                      <SelectItem value="ON_SCHEDULE">On Schedule</SelectItem>
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
                      Started: {new Date(trip.startTime).toLocaleTimeString()}
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
                {trip.status === "SCHEDULED" && (
                  <>
                    {isPastDue(trip.schedule.departureTime) && (
                      <div className="flex items-center space-x-1 text-red-600 text-xs mb-2">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Trip is overdue</span>
                      </div>
                    )}
                    <Button
                      onClick={() => handleStartTrip(trip._id)}
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
                  </>
                )}

                {trip.status === "ONGOING" && (
                  <Button
                    onClick={() => handleEndTrip(trip._id)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    End Trip
                  </Button>
                )}

                {trip.status === "COMPLETED" && (
                  <div className="flex-1 text-center py-2 text-sm text-green-600 font-medium">
                    Trip Completed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {trips.filter((t) => t.status === "COMPLETED").length}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {trips.filter((t) => t.status === "ONGOING").length}
              </div>
              <div className="text-xs text-gray-600">Ongoing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {trips.filter((t) => t.status === "SCHEDULED").length}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
