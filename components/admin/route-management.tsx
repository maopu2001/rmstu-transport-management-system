"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import "leaflet/dist/leaflet.css"

// Fix for default markers in react-leaflet
import L from "leaflet"
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/map-marker-icon.png",
  iconUrl: "/map-marker-icon.png",
  shadowUrl: "/map-shadow.png",
})

interface Stop {
  _id: string
  name: string
  location: {
    coordinates: [number, number] // [lng, lat] in MongoDB format
  }
  description?: string
}

interface Route {
  _id: string
  name: string
  stops: Array<{
    stop: Stop
    order: number
  }>
}

function MapClickHandler({ onMapClick }: { onMapClick: (coords: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

export function RouteManagement() {
  const [stops, setStops] = useState<Stop[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false)
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)
  const [newStopName, setNewStopName] = useState("")
  const [newStopDescription, setNewStopDescription] = useState("")
  const [newRouteName, setNewRouteName] = useState("")
  const [selectedStops, setSelectedStops] = useState<string[]>([])
  const { toast } = useToast()

  const fetchStops = async () => {
    try {
      const response = await fetch("/api/stops")
      if (!response.ok) throw new Error("Failed to fetch stops")
      const data = await response.json()
      setStops(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch stops",
        variant: "destructive",
      })
    }
  }

  const fetchRoutes = async () => {
    try {
      const response = await fetch("/api/routes")
      if (!response.ok) throw new Error("Failed to fetch routes")
      const data = await response.json()
      setRoutes(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch routes",
        variant: "destructive",
      })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchStops(), fetchRoutes()])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleMapClick = (coords: [number, number]) => {
    setSelectedCoords(coords)
    setIsStopDialogOpen(true)
  }

  const handleAddStop = async () => {
    if (!selectedCoords || !newStopName) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/stops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStopName,
          coordinates: selectedCoords, // [lat, lng] format for frontend
          description: newStopDescription,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create stop")
      }

      toast({
        title: "Success",
        description: "Stop created successfully",
      })

      setIsStopDialogOpen(false)
      setNewStopName("")
      setNewStopDescription("")
      setSelectedCoords(null)
      fetchStops()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create stop",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddRoute = async () => {
    if (!newRouteName || selectedStops.length === 0) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRouteName,
          stops: selectedStops,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create route")
      }

      toast({
        title: "Success",
        description: "Route created successfully",
      })

      setIsRouteDialogOpen(false)
      setNewRouteName("")
      setSelectedStops([])
      fetchRoutes()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create route",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteStop = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stop?")) return

    try {
      const response = await fetch(`/api/stops/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete stop")
      }

      toast({
        title: "Success",
        description: "Stop deleted successfully",
      })

      fetchStops()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete stop",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRoute = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return

    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete route")
      }

      toast({
        title: "Success",
        description: "Route deleted successfully",
      })

      fetchRoutes()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete route",
        variant: "destructive",
      })
    }
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Routes & Stops Management</h2>
        <p className="text-gray-600">Manage bus stops and routes on the interactive map</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Map</CardTitle>
              <CardDescription>Click on the map to add new stops</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapContainer center={[23.7465, 90.3918]} zoom={15} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler onMapClick={handleMapClick} />
                  {stops.map((stop) => (
                    <Marker key={stop._id} position={[stop.location.coordinates[1], stop.location.coordinates[0]]}>
                      <Popup>
                        <div>
                          <h3 className="font-semibold">{stop.name}</h3>
                          {stop.description && <p className="text-sm">{stop.description}</p>}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stops & Routes Panel */}
        <div className="space-y-6">
          {/* Stops */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Bus Stops</CardTitle>
                  <CardDescription>Manage bus stops</CardDescription>
                </div>
                <Dialog open={isStopDialogOpen} onOpenChange={setIsStopDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stop
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Stop</DialogTitle>
                      <DialogDescription>
                        {selectedCoords
                          ? `Adding stop at coordinates: ${selectedCoords[0].toFixed(4)}, ${selectedCoords[1].toFixed(4)}`
                          : "Click on the map to select a location first"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stop-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="stop-name"
                          value={newStopName}
                          onChange={(e) => setNewStopName(e.target.value)}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stop-description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="stop-description"
                          value={newStopDescription}
                          onChange={(e) => setNewStopDescription(e.target.value)}
                          className="col-span-3"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddStop} disabled={!selectedCoords || !newStopName || submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Add Stop
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stops.map((stop) => (
                  <div key={stop._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{stop.name}</p>
                        {stop.description && <p className="text-xs text-gray-500">{stop.description}</p>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteStop(stop._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Routes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Routes</CardTitle>
                  <CardDescription>Manage bus routes</CardDescription>
                </div>
                <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Route
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Route</DialogTitle>
                      <DialogDescription>Create a new route by selecting stops</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="route-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="route-name"
                          value={newRouteName}
                          onChange={(e) => setNewRouteName(e.target.value)}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right">Stops</Label>
                        <div className="col-span-3 space-y-2 max-h-32 overflow-y-auto">
                          {stops.map((stop) => (
                            <label key={stop._id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedStops.includes(stop._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStops([...selectedStops, stop._id])
                                  } else {
                                    setSelectedStops(selectedStops.filter((id) => id !== stop._id))
                                  }
                                }}
                              />
                              <span className="text-sm">{stop.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddRoute}
                        disabled={!newRouteName || selectedStops.length === 0 || submitting}
                      >
                        {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Add Route
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {routes.map((route) => (
                  <div key={route._id} className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{route.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Active</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteRoute(route._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {route.stops.length} stops: {route.stops.map((s) => s.stop.name).join(" → ")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
