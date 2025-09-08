"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Route, Clock, FileText, Loader2 } from "lucide-react";

interface DashboardStats {
  totalVehicles: number;
  activeTrips: number;
  pendingRequisitions: number;
  totalRoutes: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/analytics/dashboard");
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalVehicles: data.totalVehicles || 0,
            activeTrips: data.activeTrips || 0,
            pendingRequisitions: data.pendingRequisitions || 0,
            totalRoutes: data.totalRoutes || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats({
          totalVehicles: 0,
          activeTrips: 0,
          pendingRequisitions: 0,
          totalRoutes: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-24">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Active Vehicles",
      value: stats?.totalVehicles.toString() || "0",
      icon: Bus,
      color: "text-green-600",
    },
    {
      title: "Total Routes",
      value: stats?.totalRoutes.toString() || "0",
      icon: Route,
      color: "text-blue-600",
    },
    {
      title: "Ongoing Trips",
      value: stats?.activeTrips.toString() || "0",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Pending Requisitions",
      value: stats?.pendingRequisitions.toString() || "0",
      icon: FileText,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
