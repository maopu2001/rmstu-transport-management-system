"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Clock, Bus, LogOut, Bell, X, Check } from "lucide-react";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Notification = {
  _id: string;
  user: string;
  name: string;
  title: string;
  department: string;
  numberOfPassengers: number;
  purpose: string;
  requestedDate: string;
  requestedTime: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notification, setNotification] = useState<Notification[]>([]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      switch (session.user.role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "DRIVER":
          router.push("/driver");
          break;
      }
    }
  }, [session, status, router]);

  const getNotification = useCallback(async () => {
    const response = await fetch("/api/notification", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user?.token}`,
      },
    });
    const resData = await response.json();
    setNotification(resData.data);
  }, [session]);

  useEffect(() => {
    if (session) getNotification();
  }, [session]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "APPROVED":
        return <Check className="h-4 w-4" />;
      case "DENIED":
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "default";
      case "APPROVED":
        return "secondary";
      case "DENIED":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bus className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">
                RMSTU Transport Management System
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {session ? (
                <span className="flex justify-center items-center gap-4 text-sm text-gray-600">
                  {/* Notification Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="rounded-full size-8 cursor-pointer">
                        <Bell />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="min-w-1/2 max-h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Notifications</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto pr-2">
                        {notification.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">
                            No new notifications
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {notification.map((notif) => (
                              <Card
                                className="p-4 bg-accent/10"
                                key={notif._id}
                              >
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                      Requested For
                                    </Label>
                                    <p className="text-sm">{notif.name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                      Department
                                    </Label>
                                    <p className="text-sm">
                                      {notif.department}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                      Number of Passengers
                                    </Label>
                                    <p className="text-sm">
                                      {notif.numberOfPassengers}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                      Requested Date
                                    </Label>
                                    <p className="text-sm">
                                      {formatDate(notif.requestedDate)}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                      Requested Time
                                    </Label>
                                    <p className="text-sm">
                                      {formatTime(notif.requestedTime)}
                                    </p>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                      Current Status
                                    </Label>
                                    <Badge
                                      variant={getStatusColor(notif.status)}
                                      className="flex items-center space-x-1 w-fit"
                                    >
                                      {getStatusIcon(notif.status)}
                                      <span>{notif.status}</span>
                                    </Badge>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                      Admin Notes
                                    </Label>
                                    <p className="text-sm">
                                      {notif.adminNotes || "None"}
                                    </p>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                      Submitted At
                                    </Label>
                                    <p className="text-sm">
                                      {formatDateTime(notif.createdAt)}
                                    </p>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                      Modified At
                                    </Label>
                                    <p className="text-sm">
                                      {formatDateTime(notif.updatedAt)}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-500">
                                    Purpose
                                  </Label>
                                  <p className="text-sm mt-1">
                                    {notif.purpose}
                                  </p>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  Welcome, {session.user?.name}
                  <Button onClick={handleSignOut}>
                    <LogOut />
                  </Button>
                </span>
              ) : (
                <Button onClick={() => router.push("/auth/signin")}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            RMSTU Transport Management System
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track buses in real-time, view schedules, and request transportation
            services
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Live Tracking</span>
              </CardTitle>
              <CardDescription>
                View real-time bus locations and routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push("/live-map")}
              >
                View Live Map
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Schedules</span>
              </CardTitle>
              <CardDescription>Check bus routes and timetables</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push("/schedules")}
              >
                View Schedules
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bus className="h-5 w-5 text-primary" />
                <span>Request Bus</span>
              </CardTitle>
              <CardDescription>
                Submit a bus requisition request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push("/requisition")}
              >
                Request Bus
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <DashboardStats />
      </main>
      <footer className="w-full border-t bg-white text-sm text-muted-foreground fixed bottom-0">
        <div className="container py-1 mx-auto text-center">
          <div>
            <span>Developed by Team Zero Or One, RMSTU</span> |{" "}
            <Link className="hover:text-green-400" href="/details">
              Site Details
            </Link>
          </div>
          &copy; {new Date().getFullYear()} RMSTU Transport Management System.
          All rights reserved.
        </div>
      </footer>
    </div>
  );
}
