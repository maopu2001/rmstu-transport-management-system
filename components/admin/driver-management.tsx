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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, Users, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Driver {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { toast } = useToast();

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
    });
    setEditingDriver(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingDriver
        ? `/api/drivers/${editingDriver._id}`
        : "/api/drivers";
      const method = editingDriver ? "PUT" : "POST";

      // For edit, only include password if it's provided
      const submitData =
        editingDriver && !formData.password.trim()
          ? { name: formData.name, email: formData.email }
          : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save driver");
      }

      toast({
        title: "Success",
        description: `Driver ${
          editingDriver ? "updated" : "created"
        } successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchDrivers();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save driver",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      password: "", // Leave blank for editing
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/drivers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete driver");
      }

      toast({
        title: "Success",
        description: "Driver deleted successfully",
      });

      fetchDrivers();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete driver",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Driver Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage driver accounts for your transport system.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingDriver ? "Edit Driver" : "Add New Driver"}
              </DialogTitle>
              <DialogDescription>
                {editingDriver
                  ? "Update the driver's information below. Leave password blank to keep current password."
                  : "Create a new driver account. They will be able to log in with these credentials."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter driver's full name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    Password {editingDriver && "(leave blank to keep current)"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={
                      editingDriver
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    required={!editingDriver}
                    minLength={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingDriver ? "Update Driver" : "Create Driver"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Total Drivers
            </span>
          </div>
          <div className="text-2xl font-bold">{drivers.length}</div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No drivers found</p>
                    <p className="text-sm text-muted-foreground">
                      Click "Add Driver" to create your first driver account
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver._id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{driver.role}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(driver.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(driver)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the driver account for{" "}
                              <strong>{driver.name}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(driver._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
