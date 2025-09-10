"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  _id: string;
  registrationNumber: string;
  busName: string;
  type: "BUS" | "MINIBUS";
  capacity: number;
  driver?: { _id: string; name: string; email: string };
  status: "Active" | "Inactive" | "Maintenance";
}

interface Driver {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    registrationNumber: "",
    busName: "",
    type: "BUS" as "BUS" | "MINIBUS",
    capacity: "",
    driver: "",
  });
  const { toast } = useToast();

  const getDriverStatus = (driverId: string) => {
    const assignedVehicle = vehicles.find(
      (vehicle) =>
        vehicle.driver?._id === driverId && vehicle._id !== editingVehicle?._id
    );
    return assignedVehicle ? `Assigned to "${assignedVehicle.busName}"` : null;
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles");
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch("/api/drivers");
      if (!response.ok) throw new Error("Failed to fetch drivers");
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch drivers",
        variant: "destructive",
      });
    } finally {
      setDriversLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingVehicle
        ? `/api/vehicles/${editingVehicle._id}`
        : "/api/vehicles";
      const method = editingVehicle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: formData.registrationNumber,
          busName: formData.busName,
          type: formData.type,
          capacity: Number.parseInt(formData.capacity),
          driver: formData.driver,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save vehicle");
      }

      toast({
        title: "Success",
        description: `Vehicle ${
          editingVehicle ? "updated" : "created"
        } successfully`,
      });

      setIsDialogOpen(false);
      setEditingVehicle(null);
      setFormData({
        registrationNumber: "",
        busName: "",
        type: "BUS",
        capacity: "",
        driver: "",
      });
      fetchVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save vehicle",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registrationNumber: vehicle.registrationNumber,
      busName: vehicle.busName,
      type: vehicle.type,
      capacity: vehicle.capacity.toString(),
      driver: vehicle.driver?._id || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete vehicle");
      }

      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });

      fetchVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete vehicle",
        variant: "destructive",
      });
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Vehicle Management
          </h2>
          <p className="text-gray-600">
            Manage your fleet of buses and minibuses
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingVehicle(null);
                setFormData({
                  registrationNumber: "",
                  busName: "",
                  type: "BUS",
                  capacity: "",
                  driver: "",
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </DialogTitle>
              <DialogDescription>
                {editingVehicle
                  ? "Update the vehicle information below."
                  : "Enter the details for the new vehicle."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="registration" className="text-right">
                    Registration
                  </Label>
                  <Input
                    id="registration"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationNumber: e.target.value,
                      })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="busName" className="text-right">
                    Bus Name
                  </Label>
                  <Input
                    id="busName"
                    value={formData.busName}
                    onChange={(e) =>
                      setFormData({ ...formData, busName: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="e.g., RMSTU Bus 1"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "BUS" | "MINIBUS") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUS">Bus</SelectItem>
                      <SelectItem value="MINIBUS">Minibus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">
                    Capacity
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="driver" className="text-right">
                    Driver
                  </Label>
                  <Select
                    value={formData.driver}
                    onValueChange={(value) =>
                      setFormData({ ...formData, driver: value })
                    }
                    disabled={driversLoading}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={
                          driversLoading
                            ? "Loading drivers..."
                            : "Select a driver (optional)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">No driver assigned</SelectItem>
                      {drivers.map((driver) => {
                        const status = getDriverStatus(driver._id);
                        return (
                          <SelectItem
                            key={driver._id}
                            value={driver._id}
                            disabled={!!status}
                          >
                            <div className="flex flex-col">
                              <span>
                                {driver.name} ({driver.email})
                              </span>
                              {status && (
                                <span className="text-xs text-muted-foreground">
                                  {status}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting || driversLoading}>
                  {submitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration Number</TableHead>
              <TableHead>Bus Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell className="font-medium">
                  {vehicle.registrationNumber}
                </TableCell>
                <TableCell>{vehicle.busName}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>{vehicle.capacity}</TableCell>
                <TableCell>{vehicle.driver?.name || "Unassigned"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      vehicle.status === "Active"
                        ? "default"
                        : vehicle.status === "Maintenance"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {vehicle.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(vehicle._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
