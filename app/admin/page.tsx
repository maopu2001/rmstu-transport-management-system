import { DashboardStats } from "@/components/admin/dashboard-stats"
import { DashboardCharts } from "@/components/admin/dashboard-charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

const recentAlerts = [
  {
    id: 1,
    type: "warning",
    message: "Bus RMSTU-001 is running 15 minutes late",
    time: "5 minutes ago",
  },
  {
    id: 2,
    type: "success",
    message: "Route optimization completed successfully",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "info",
    message: "New requisition submitted for approval",
    time: "2 hours ago",
  },
]

const ongoingTrips = [
  {
    id: 1,
    vehicle: "RMSTU-001",
    route: "Main Campus - Hostel",
    driver: "John Doe",
    status: "On Time",
    passengers: 25,
  },
  {
    id: 2,
    vehicle: "RMSTU-002",
    route: "City Center - Campus",
    driver: "Jane Smith",
    status: "Delayed",
    passengers: 18,
  },
  {
    id: 3,
    vehicle: "RMSTU-003",
    route: "Hostel - Library",
    driver: "Mike Johnson",
    status: "On Time",
    passengers: 12,
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the RMSTU Transport Management System Admin Panel
        </p>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Charts */}
      <DashboardCharts />

      {/* Recent Activity & Ongoing Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              Latest system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {alert.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                  {alert.type === "success" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {alert.type === "info" && (
                    <Clock className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ongoing Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Ongoing Trips</CardTitle>
            <CardDescription>Currently active bus trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ongoingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{trip.vehicle}</span>
                      <Badge
                        variant={
                          trip.status === "On Time" ? "default" : "destructive"
                        }
                      >
                        {trip.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{trip.route}</p>
                    <p className="text-xs text-gray-500">
                      Driver: {trip.driver}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {trip.passengers} passengers
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 bg-transparent"
                    >
                      Track
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
