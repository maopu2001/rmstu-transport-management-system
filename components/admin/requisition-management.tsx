"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Eye, Check, X, Clock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Requisition {
  _id: string
  name: string
  department: string
  purpose: string
  requestedDate: string
  requestedTime: string
  numberOfPassengers: number
  status: "PENDING" | "APPROVED" | "DENIED"
  createdAt: string
  adminNotes?: string
  user?: { name: string; email: string }
}

export function RequisitionManagement() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const { toast } = useToast()

  const fetchRequisitions = async () => {
    try {
      const response = await fetch("/api/requisitions")
      if (!response.ok) throw new Error("Failed to fetch requisitions")
      const data = await response.json()
      setRequisitions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch requisitions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequisitions()
  }, [])

  const handleViewDetails = (requisition: Requisition) => {
    setSelectedRequisition(requisition)
    setAdminNotes(requisition.adminNotes || "")
    setIsDetailDialogOpen(true)
  }

  const handleApprove = async (id: string) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/requisitions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
          adminNotes: adminNotes || "Request approved",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to approve requisition")
      }

      toast({
        title: "Success",
        description: "Requisition approved successfully",
      })

      setIsDetailDialogOpen(false)
      setSelectedRequisition(null)
      setAdminNotes("")
      fetchRequisitions()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve requisition",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeny = async (id: string) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/requisitions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DENIED",
          adminNotes: adminNotes || "Request denied",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to deny requisition")
      }

      toast({
        title: "Success",
        description: "Requisition denied successfully",
      })

      setIsDetailDialogOpen(false)
      setSelectedRequisition(null)
      setAdminNotes("")
      fetchRequisitions()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deny requisition",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "APPROVED":
        return <Check className="h-4 w-4" />
      case "DENIED":
        return <X className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "default"
      case "APPROVED":
        return "secondary"
      case "DENIED":
        return "destructive"
      default:
        return "default"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Requisition Management</h2>
        <p className="text-gray-600">Review and manage bus requisition requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requisitions.filter((r) => r.status === "PENDING").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requisitions.filter((r) => r.status === "APPROVED").length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denied</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requisitions.filter((r) => r.status === "DENIED").length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Requisitions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requisitions</CardTitle>
          <CardDescription>Review and manage bus requisition requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisitions.map((requisition) => (
                <TableRow key={requisition._id}>
                  <TableCell className="font-medium">{requisition.user?.name || requisition.name}</TableCell>
                  <TableCell>{requisition.department}</TableCell>
                  <TableCell className="max-w-xs truncate">{requisition.purpose}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatDate(requisition.requestedDate)}</div>
                      <div className="text-sm text-gray-500">{requisition.requestedTime}</div>
                    </div>
                  </TableCell>
                  <TableCell>{requisition.numberOfPassengers}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(requisition.status)} className="flex items-center space-x-1 w-fit">
                      {getStatusIcon(requisition.status)}
                      <span>{requisition.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDateTime(requisition.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(requisition)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Requisition Details</DialogTitle>
            <DialogDescription>Review and take action on this requisition request</DialogDescription>
          </DialogHeader>

          {selectedRequisition && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Requester</Label>
                  <p className="text-sm">{selectedRequisition.user?.name || selectedRequisition.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Department</Label>
                  <p className="text-sm">{selectedRequisition.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Requested Date</Label>
                  <p className="text-sm">{formatDate(selectedRequisition.requestedDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Requested Time</Label>
                  <p className="text-sm">{selectedRequisition.requestedTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Number of Passengers</Label>
                  <p className="text-sm">{selectedRequisition.numberOfPassengers}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Current Status</Label>
                  <Badge
                    variant={getStatusColor(selectedRequisition.status)}
                    className="flex items-center space-x-1 w-fit"
                  >
                    {getStatusIcon(selectedRequisition.status)}
                    <span>{selectedRequisition.status}</span>
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Purpose</Label>
                <p className="text-sm mt-1">{selectedRequisition.purpose}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Submitted At</Label>
                <p className="text-sm">{formatDateTime(selectedRequisition.createdAt)}</p>
              </div>

              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this requisition..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedRequisition?.status === "PENDING" && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handleDeny(selectedRequisition._id)} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                  Deny
                </Button>
                <Button onClick={() => handleApprove(selectedRequisition._id)} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
