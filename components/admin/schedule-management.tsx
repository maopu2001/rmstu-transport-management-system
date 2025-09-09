"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Schedule {
  _id: string;
  route: { _id: string; name: string };
  vehicle: { _id: string; registrationNumber: string; busName: string };
  departureTime: string;
  daysOfWeek: number[];
}

interface Vehicle {
  _id: string;
  registrationNumber: string;
  busName: string;
}

interface Route {
  _id: string;
  name: string;
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const { toast } = useToast();

  const [scheduleForm, setScheduleForm] = useState({
    route: "",
    vehicle: "",
    departureTime: "",
    daysOfWeek: [] as number[],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, vehiclesRes, routesRes] = await Promise.all([
        fetch("/api/schedules"),
        fetch("/api/vehicles"),
        fetch("/api/routes"),
      ]);

      if (!schedulesRes.ok || !vehiclesRes.ok || !routesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [schedulesData, vehiclesData, routesData] = await Promise.all([
        schedulesRes.json(),
        vehiclesRes.json(),
        routesRes.json(),
      ]);

      setSchedules(schedulesData);
      setVehicles(vehiclesData);
      setRoutes(routesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingSchedule
        ? `/api/schedules/${editingSchedule._id}`
        : "/api/schedules";
      const method = editingSchedule ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: scheduleForm.route,
          vehicle: scheduleForm.vehicle,
          departureTime: scheduleForm.departureTime,
          daysOfWeek: scheduleForm.daysOfWeek,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save schedule");
      }

      toast({
        title: "Success",
        description: `Schedule ${
          editingSchedule ? "updated" : "created"
        } successfully`,
      });

      setIsScheduleDialogOpen(false);
      setEditingSchedule(null);
      setScheduleForm({
        route: "",
        vehicle: "",
        departureTime: "",
        daysOfWeek: [],
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save schedule",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      route: schedule.route._id,
      vehicle: schedule.vehicle._id,
      departureTime: schedule.departureTime,
      daysOfWeek: schedule.daysOfWeek,
    });
    setIsScheduleDialogOpen(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete schedule");
      }

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const handleDayToggle = (day: number) => {
    const newDays = scheduleForm.daysOfWeek.includes(day)
      ? scheduleForm.daysOfWeek.filter((d) => d !== day)
      : [...scheduleForm.daysOfWeek, day];
    setScheduleForm({ ...scheduleForm, daysOfWeek: newDays });
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Schedule Management
        </h2>
        <p className="text-gray-600">
          Manage regular schedules and dynamic trips
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regular Schedules */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Regular Schedules</CardTitle>
                <CardDescription>
                  Weekly recurring bus schedules
                </CardDescription>
              </div>
              <Dialog
                open={isScheduleDialogOpen}
                onOpenChange={setIsScheduleDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
                    </DialogTitle>
                    <DialogDescription>
                      Create a recurring weekly schedule
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleScheduleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="route" className="text-right">
                          Route
                        </Label>
                        <Select
                          value={scheduleForm.route}
                          onValueChange={(value) =>
                            setScheduleForm({ ...scheduleForm, route: value })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select route" />
                          </SelectTrigger>
                          <SelectContent>
                            {routes.map((route) => (
                              <SelectItem key={route._id} value={route._id}>
                                {route.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="vehicle" className="text-right">
                          Vehicle
                        </Label>
                        <Select
                          value={scheduleForm.vehicle}
                          onValueChange={(value) =>
                            setScheduleForm({ ...scheduleForm, vehicle: value })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle._id} value={vehicle._id}>
                                {vehicle.busName} ({vehicle.registrationNumber})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                          Departure Time
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={scheduleForm.departureTime}
                          onChange={(e) =>
                            setScheduleForm({
                              ...scheduleForm,
                              departureTime: e.target.value,
                            })
                          }
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right">Days</Label>
                        <div className="col-span-3 flex flex-wrap gap-2">
                          {dayNames.map((day, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`day-${index}`}
                                checked={scheduleForm.daysOfWeek.includes(
                                  index
                                )}
                                onCheckedChange={() => handleDayToggle(index)}
                              />
                              <Label
                                htmlFor={`day-${index}`}
                                className="text-sm"
                              >
                                {day}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        {editingSchedule ? "Update Schedule" : "Add Schedule"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule._id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{schedule.route.name}</h4>
                      <p className="text-sm text-gray-600">
                        {schedule.vehicle.busName} (
                        {schedule.vehicle.registrationNumber})
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Active</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSchedule(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {schedule.departureTime}
                    </span>
                    <span className="text-gray-500">
                      {schedule.daysOfWeek
                        .map((day) => dayNames[day])
                        .join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Schedule Calendar</span>
            </CardTitle>
            <CardDescription>
              View all scheduled trips in calendar format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Trips */}
        {/* <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Dynamic Trips</CardTitle>
                <CardDescription>
                  Special one-time trips for events and special occasions
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  toast({
                    title: "Dynamic Trips",
                    description:
                      "This feature allows creating special one-time trips. Contact admin for setup.",
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Trip
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>
                Dynamic trip scheduling will be available in a future update.
              </p>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
