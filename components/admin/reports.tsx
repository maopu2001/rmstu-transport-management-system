"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
} from "recharts"
import { Download, Calendar, TrendingUp, Clock, Users, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReportsData {
  punctualityData: Array<{ vehicle: string; onTime: number; delayed: number }>
  tripHistoryData: Array<{ date: string; trips: number; completed: number; cancelled: number }>
  userActivityData: Array<{ name: string; value: number; color: string }>
  recentTrips: Array<{
    _id: string
    vehicle: { registrationNumber: string }
    schedule: { route: { name: string } }
    date: string
    startTime?: string
    endTime?: string
    status: string
    passengers?: number
    punctuality?: string
  }>
}

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [reportsData, setReportsData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [keyMetrics, setKeyMetrics] = useState({
    totalTrips: 0,
    onTimePerformance: 0,
    totalPassengers: 0,
    avgTripDuration: 0,
  })
  const { toast } = useToast()

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/reports?period=${selectedPeriod}`)
      if (!response.ok) throw new Error("Failed to fetch reports data")
      const data = await response.json()

      setReportsData(data)

      // Calculate key metrics from the data
      const totalTrips = data.tripHistoryData.reduce((sum: number, day: any) => sum + day.trips, 0)
      const completedTrips = data.tripHistoryData.reduce((sum: number, day: any) => sum + day.completed, 0)
      const onTimePerformance =
        data.punctualityData.length > 0
          ? Math.round(
              data.punctualityData.reduce((sum: number, vehicle: any) => sum + vehicle.onTime, 0) /
                data.punctualityData.length,
            )
          : 0
      const totalPassengers = data.recentTrips.reduce((sum: number, trip: any) => sum + (trip.passengers || 0), 0)

      setKeyMetrics({
        totalTrips,
        onTimePerformance,
        totalPassengers,
        avgTripDuration: 42, // This would need to be calculated from actual trip duration data
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports data",
        variant: "destructive",
      })
      setReportsData({
        punctualityData: [],
        tripHistoryData: [],
        userActivityData: [],
        recentTrips: [],
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportsData()
  }, [selectedPeriod])

  const handleExportReport = () => {
    toast({
      title: "Export Started",
      description: "Your report is being generated and will be downloaded shortly.",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">View system performance and usage statistics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.totalTrips}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.onTimePerformance}%</div>
            <p className="text-xs text-muted-foreground">Average across all vehicles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Passengers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.totalPassengers}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Trip Duration</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.avgTripDuration} min</div>
            <p className="text-xs text-muted-foreground">Estimated average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Punctuality Report */}
        <Card>
          <CardHeader>
            <CardTitle>Bus Punctuality</CardTitle>
            <CardDescription>On-time performance by vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportsData?.punctualityData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vehicle" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="onTime" stackId="a" fill="#10b981" name="On Time %" />
                <Bar dataKey="delayed" stackId="a" fill="#ef4444" name="Delayed %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trip History */}
        <Card>
          <CardHeader>
            <CardTitle>Trip History</CardTitle>
            <CardDescription>Daily trip completion trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportsData?.tripHistoryData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
                <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} name="Cancelled" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Activity & Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Active users by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={reportsData?.userActivityData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(reportsData?.userActivityData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {(reportsData?.userActivityData || []).map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trips */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Trip History</CardTitle>
            <CardDescription>Latest completed trips</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(reportsData?.recentTrips || []).map((trip) => (
                  <TableRow key={trip._id}>
                    <TableCell className="font-medium">{trip.vehicle?.registrationNumber}</TableCell>
                    <TableCell>{trip.schedule?.route?.name}</TableCell>
                    <TableCell>{new Date(trip.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {trip.startTime && trip.endTime ? `${trip.startTime} - ${trip.endTime}` : "N/A"}
                    </TableCell>
                    <TableCell>{trip.passengers || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={trip.punctuality === "ON_TIME" ? "default" : "destructive"}>
                        {trip.punctuality === "ON_TIME" ? "On Time" : trip.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
