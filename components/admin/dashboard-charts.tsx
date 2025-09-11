"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  Clock,
  Route,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

interface ChartData {
  peakHoursData: Array<{ hour: string; trips: number }>;
  weeklyTripsData: Array<{ day: string; trips: number }>;
  totalVehicles: number;
  totalRoutes: number;
  activeTrips: number;
  pendingRequisitions: number;
  routePerformance?: Array<{
    route: string;
    trips: number;
    efficiency: number;
    onTimeRate?: number;
    avgDuration?: number;
  }>;
  vehicleUtilization?: Array<{
    vehicle: string;
    utilization: number;
    percentage: number;
    status: string;
  }>;
  monthlyTrends?: Array<{
    month: string;
    completed: number;
    cancelled: number;
  }>;
  driverPerformance?: Array<{
    driver: string;
    totalTrips: number;
    onTimePercentage: number;
    completionRate: number;
    performance: string;
  }>;
  delayAnalysis?: Array<{
    reason: string;
    count: number;
  }>;
}

export function DashboardCharts() {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverData, setDriverData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchDriverData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverData = async () => {
    try {
      const response = await fetch("/api/analytics/drivers");
      if (!response.ok) throw new Error("Failed to fetch driver data");
      const result = await response.json();
      setDriverData(result);
    } catch (err) {
      console.error("Failed to fetch driver data:", err);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-center h-80">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Travel Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Travel Hours</CardTitle>
            <CardDescription>Number of trips by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.peakHoursData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, "Trips"]}
                  labelStyle={{ color: "black" }}
                />
                <Bar dataKey="trips" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trip Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trip Trends</CardTitle>
            <CardDescription>
              Daily trip count over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.weeklyTripsData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, "Trips"]}
                  labelStyle={{ color: "black" }}
                />
                <Area
                  type="monotone"
                  dataKey="trips"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Route Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Route Performance</CardTitle>
            <CardDescription>
              Trip volume and efficiency by route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.routePerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "trips"
                      ? `${value} trips`
                      : `${value}% efficiency`,
                    name === "trips" ? "Trip Count" : "Efficiency",
                  ]}
                  labelStyle={{ color: "black" }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="trips"
                  fill="hsl(var(--primary))"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#ff7300"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Utilization</CardTitle>
            <CardDescription>Current fleet status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.vehicleUtilization || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="utilization"
                  label={({ vehicle, utilization }) =>
                    `${vehicle}: ${utilization}`
                  }
                >
                  {data?.vehicleUtilization?.map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} vehicles (${props.payload?.percentage || 0}%)`,
                    "Count",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trip Trends</CardTitle>
            <CardDescription>
              Completed vs cancelled trips by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "completed"
                      ? "Completed Trips"
                      : "Cancelled Trips",
                  ]}
                  labelStyle={{ color: "black" }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="cancelled"
                  stroke="#ff4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Driver Performance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Driver Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Performance metrics by driver
            </p>
          </CardHeader>
          <CardContent>
            {driverData?.driverPerformance &&
            driverData.driverPerformance.length > 0 ? (
              <BarChart data={driverData.driverPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="driver"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}${name === "onTimePercentage" ? "%" : ""}`,
                    name === "onTimePercentage"
                      ? "On-Time Rate"
                      : "Total Trips",
                  ]}
                />
                <Legend />
                <Bar dataKey="totalTrips" fill="#8884d8" name="Total Trips" />
                <Bar
                  dataKey="onTimePercentage"
                  fill="#82ca9d"
                  name="On-Time %"
                />
              </BarChart>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No driver performance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delay Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delay Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Common causes of delays
            </p>
          </CardHeader>
          <CardContent>
            {driverData?.delayAnalysis &&
            driverData.delayAnalysis.length > 0 ? (
              <PieChart>
                <Pie
                  data={driverData.delayAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ reason, percent }: any) =>
                    `${reason} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {driverData.delayAnalysis.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Incidents"]} />
              </PieChart>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No delay analysis data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Health Overview</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Fleet Availability</span>
                <span className="text-sm font-bold">
                  {data
                    ? Math.round(
                        ((data.totalVehicles - data.activeTrips) /
                          data.totalVehicles) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: data
                      ? `${Math.round(
                          ((data.totalVehicles - data.activeTrips) /
                            data.totalVehicles) *
                            100
                        )}%`
                      : "0%",
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Route Coverage</span>
                <span className="text-sm font-bold">
                  {data
                    ? Math.round((data.activeTrips / data.totalRoutes) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: data
                      ? `${Math.min(
                          Math.round(
                            (data.activeTrips / data.totalRoutes) * 100
                          ),
                          100
                        )}%`
                      : "0%",
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Request Processing</span>
                <span className="text-sm font-bold">
                  {data?.pendingRequisitions
                    ? `${data.pendingRequisitions} pending`
                    : "All clear"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (data?.pendingRequisitions || 0) > 5
                      ? "bg-red-600"
                      : (data?.pendingRequisitions || 0) > 2
                      ? "bg-yellow-600"
                      : "bg-green-600"
                  }`}
                  style={{
                    width: data?.pendingRequisitions
                      ? `${Math.min(
                          (data.pendingRequisitions / 10) * 100,
                          100
                        )}%`
                      : "100%",
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg text-green-600">
                    {data
                      ? Math.round(
                          ((data.totalVehicles -
                            (data.pendingRequisitions || 0)) /
                            data.totalVehicles) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-muted-foreground">Operational</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-blue-600">
                    {data?.weeklyTripsData?.reduce(
                      (sum, day) => sum + day.trips,
                      0
                    ) || 0}
                  </div>
                  <div className="text-muted-foreground">Weekly Trips</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
