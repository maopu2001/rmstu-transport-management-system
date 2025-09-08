"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, MapPin, Bus, Search, Filter, Loader2 } from "lucide-react";

interface Schedule {
  _id: string;
  route: {
    _id: string;
    name: string;
    stops: Array<{
      stop: {
        _id: string;
        name: string;
        location: {
          type: "Point";
          coordinates: [number, number];
        };
      };
      order: number;
    }>;
  };
  vehicle: {
    _id: string;
    registrationNumber: string;
    busName: string;
    type: "BUS" | "MINIBUS";
    capacity: number;
  };
  departureTime: string;
  daysOfWeek: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [filterVehicleType, setFilterVehicleType] = useState<string>("all");

  // Fetch schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/schedules");
        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }
        const data = await response.json();
        setSchedules(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Helper functions for day conversion
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const getDayName = (dayNum: number) => dayNames[dayNum];
  const getDayNumber = (dayName: string) => dayNames.indexOf(dayName);

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.vehicle.registrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      schedule.vehicle.busName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      schedule.route.stops.some((stopObj) =>
        stopObj.stop.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesDay =
      filterDay === "all" ||
      schedule.daysOfWeek.includes(getDayNumber(filterDay));

    const matchesVehicleType =
      filterVehicleType === "all" ||
      schedule.vehicle.type === filterVehicleType;

    return matchesSearch && matchesDay && matchesVehicleType;
  });

  const getCurrentDay = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date().getDay()];
  };

  const isActiveToday = (daysOfWeek: number[]) => {
    const currentDay = new Date().getDay();
    return daysOfWeek.includes(currentDay);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Bus Schedules & Routes
          </h1>
          <p className="text-gray-600 mt-2">
            View all official bus routes and their timetables
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading schedules...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-red-500 mb-2">Failed to load schedules</div>
              <p className="text-gray-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Content - only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search routes, vehicles, or stops..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterDay} onValueChange={setFilterDay}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Days</SelectItem>
                        <SelectItem value="Mon">Monday</SelectItem>
                        <SelectItem value="Tue">Tuesday</SelectItem>
                        <SelectItem value="Wed">Wednesday</SelectItem>
                        <SelectItem value="Thu">Thursday</SelectItem>
                        <SelectItem value="Fri">Friday</SelectItem>
                        <SelectItem value="Sat">Saturday</SelectItem>
                        <SelectItem value="Sun">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filterVehicleType}
                      onValueChange={setFilterVehicleType}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="BUS">Bus</SelectItem>
                        <SelectItem value="MINIBUS">Minibus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {filteredSchedules.map((schedule) => {
                // Get stop names in order
                const orderedStops = schedule.route.stops
                  .sort((a, b) => a.order - b.order)
                  .map((stopObj) => stopObj.stop.name);

                return (
                  <Card
                    key={schedule._id}
                    className={
                      isActiveToday(schedule.daysOfWeek)
                        ? "ring-2 ring-primary"
                        : ""
                    }
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">
                          {schedule.route.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          {isActiveToday(schedule.daysOfWeek) && (
                            <Badge variant="default">Active Today</Badge>
                          )}
                          <Badge variant="outline">
                            {schedule.vehicle.type}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Bus className="h-4 w-4" />
                          <span>
                            {schedule.vehicle.busName} (
                            {schedule.vehicle.registrationNumber})
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{schedule.departureTime}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Route Stops */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Route:
                        </h4>
                        <p className="text-sm text-gray-600">
                          {orderedStops.join(" → ")}
                        </p>
                      </div>

                      {/* Schedule Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Days:
                          </span>
                          <div className="text-gray-600">
                            {schedule.daysOfWeek
                              .map((dayNum) => getDayName(dayNum))
                              .join(", ")}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Capacity:
                          </span>
                          <div className="text-gray-600">
                            {schedule.vehicle.capacity} passengers
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Status:
                          </span>
                          <div className="text-gray-600">
                            {schedule.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Departure:
                          </span>
                          <div className="text-gray-600">
                            {schedule.departureTime}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Track on Map
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Schedule Table */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Schedule Table</CardTitle>
                <CardDescription>
                  All routes and timetables in table format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => {
                      const orderedStops = schedule.route.stops
                        .sort((a, b) => a.order - b.order)
                        .map((stopObj) => stopObj.stop.name);

                      return (
                        <TableRow key={schedule._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {schedule.route.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {orderedStops.join(" → ")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>
                                {schedule.vehicle.busName} (
                                {schedule.vehicle.registrationNumber})
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {schedule.vehicle.type}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {schedule.departureTime}
                          </TableCell>
                          <TableCell className="text-sm">
                            {schedule.daysOfWeek
                              .map((dayNum) => getDayName(dayNum))
                              .join(", ")}
                          </TableCell>
                          <TableCell>{schedule.vehicle.capacity}</TableCell>
                          <TableCell>
                            {isActiveToday(schedule.daysOfWeek) ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* No Results */}
            {filteredSchedules.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No schedules found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
