"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, MapPin, Bus, Search, Filter } from "lucide-react"

interface Schedule {
  id: string
  routeName: string
  vehicleNumber: string
  vehicleType: "BUS" | "MINIBUS"
  departureTime: string
  estimatedDuration: string
  stops: string[]
  daysOfWeek: string[]
  frequency: string
  capacity: number
}

const mockSchedules: Schedule[] = [
  {
    id: "1",
    routeName: "Campus Loop",
    vehicleNumber: "RMSTU-001",
    vehicleType: "BUS",
    departureTime: "08:00",
    estimatedDuration: "45 min",
    stops: ["Main Gate", "Academic Building", "Student Hostel", "Library"],
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    frequency: "Every 2 hours",
    capacity: 40,
  },
  {
    id: "2",
    routeName: "Academic Route",
    vehicleNumber: "RMSTU-002",
    vehicleType: "MINIBUS",
    departureTime: "09:30",
    estimatedDuration: "35 min",
    stops: ["Main Gate", "Academic Building", "Library"],
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    frequency: "Every 3 hours",
    capacity: 25,
  },
  {
    id: "3",
    routeName: "Hostel Route",
    vehicleNumber: "RMSTU-003",
    vehicleType: "BUS",
    departureTime: "14:00",
    estimatedDuration: "30 min",
    stops: ["Student Hostel", "Cafeteria", "Sports Complex"],
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    frequency: "Every 4 hours",
    capacity: 45,
  },
  {
    id: "4",
    routeName: "Evening Route",
    vehicleNumber: "RMSTU-001",
    vehicleType: "BUS",
    departureTime: "17:30",
    estimatedDuration: "40 min",
    stops: ["Library", "Academic Building", "Main Gate"],
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    frequency: "Daily",
    capacity: 40,
  },
  {
    id: "5",
    routeName: "Weekend Special",
    vehicleNumber: "RMSTU-002",
    vehicleType: "MINIBUS",
    departureTime: "10:00",
    estimatedDuration: "60 min",
    stops: ["Main Gate", "City Center", "Shopping Mall", "Main Gate"],
    daysOfWeek: ["Sat", "Sun"],
    frequency: "Weekends only",
    capacity: 25,
  },
]

export function Schedules() {
  const [schedules] = useState<Schedule[]>(mockSchedules)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDay, setFilterDay] = useState<string>("all")
  const [filterVehicleType, setFilterVehicleType] = useState<string>("all")

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.stops.some((stop) => stop.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDay = filterDay === "all" || schedule.daysOfWeek.includes(filterDay)

    const matchesVehicleType = filterVehicleType === "all" || schedule.vehicleType === filterVehicleType

    return matchesSearch && matchesDay && matchesVehicleType
  })

  const getCurrentDay = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return days[new Date().getDay()]
  }

  const isActiveToday = (daysOfWeek: string[]) => {
    return daysOfWeek.includes(getCurrentDay())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Bus Schedules & Routes</h1>
          <p className="text-gray-600 mt-2">View all official bus routes and their timetables</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <Select value={filterVehicleType} onValueChange={setFilterVehicleType}>
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
          {filteredSchedules.map((schedule) => (
            <Card key={schedule.id} className={isActiveToday(schedule.daysOfWeek) ? "ring-2 ring-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{schedule.routeName}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {isActiveToday(schedule.daysOfWeek) && <Badge variant="default">Active Today</Badge>}
                    <Badge variant="outline">{schedule.vehicleType}</Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Bus className="h-4 w-4" />
                    <span>{schedule.vehicleNumber}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{schedule.departureTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{schedule.estimatedDuration}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Stops */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Route:</h4>
                  <p className="text-sm text-gray-600">{schedule.stops.join(" → ")}</p>
                </div>

                {/* Schedule Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Days:</span>
                    <div className="text-gray-600">{schedule.daysOfWeek.join(", ")}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Frequency:</span>
                    <div className="text-gray-600">{schedule.frequency}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Capacity:</span>
                    <div className="text-gray-600">{schedule.capacity} passengers</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <div className="text-gray-600">{schedule.estimatedDuration}</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="outline" className="w-full bg-transparent">
                  <MapPin className="h-4 w-4 mr-2" />
                  Track on Map
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Schedule Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Schedule Table</CardTitle>
            <CardDescription>All routes and timetables in table format</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{schedule.routeName}</div>
                        <div className="text-sm text-gray-500">{schedule.stops.join(" → ")}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{schedule.vehicleNumber}</span>
                        <Badge variant="outline" className="text-xs">
                          {schedule.vehicleType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{schedule.departureTime}</TableCell>
                    <TableCell>{schedule.estimatedDuration}</TableCell>
                    <TableCell className="text-sm">{schedule.daysOfWeek.join(", ")}</TableCell>
                    <TableCell>{schedule.capacity}</TableCell>
                    <TableCell>
                      {isActiveToday(schedule.daysOfWeek) ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* No Results */}
        {filteredSchedules.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
