"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Send, Calendar, Users } from "lucide-react"
import { requisitionSchema, type RequisitionFormData } from "@/lib/validations/requisition"

export function RequisitionForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequisitionFormData>({
    resolver: zodResolver(requisitionSchema),
  })

  const onSubmit = async (data: RequisitionFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/requisitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        console.log("Requisition submitted:", data)
        setIsSubmitted(true)
        reset()

        // Reset success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000)
      } else {
        throw new Error("Failed to submit requisition")
      }
    } catch (error) {
      console.error("Error submitting requisition:", error)
      // In a real app, you'd show an error message to the user
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your bus requisition has been submitted successfully. You will receive a confirmation email shortly.
            </p>
            <Button onClick={() => setIsSubmitted(false)} className="w-full">
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Bus Requisition Request</h1>
          <p className="text-gray-600 mt-2">
            Request a bus for special events, field trips, or departmental activities
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Information Card */}
        <Alert className="mb-6">
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            Please submit your request at least 3 days in advance. All requests are subject to vehicle availability and
            administrative approval.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Please fill out all required information for your bus requisition</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter your full name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="department"
                    {...register("department")}
                    placeholder="e.g., Computer Science"
                    className={errors.department ? "border-red-500" : ""}
                  />
                  {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
                </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-2">
                <Label htmlFor="purpose">
                  Purpose of Trip <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="purpose"
                  {...register("purpose")}
                  placeholder="Describe the purpose of your trip, destination, and any special requirements..."
                  rows={4}
                  className={errors.purpose ? "border-red-500" : ""}
                />
                {errors.purpose && <p className="text-sm text-red-500">{errors.purpose.message}</p>}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="requestedDate">
                    Requested Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="requestedDate"
                    type="date"
                    {...register("requestedDate")}
                    min={getTomorrowDate()}
                    className={errors.requestedDate ? "border-red-500" : ""}
                  />
                  {errors.requestedDate && <p className="text-sm text-red-500">{errors.requestedDate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestedTime">
                    Requested Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="requestedTime"
                    type="time"
                    {...register("requestedTime")}
                    className={errors.requestedTime ? "border-red-500" : ""}
                  />
                  {errors.requestedTime && <p className="text-sm text-red-500">{errors.requestedTime.message}</p>}
                </div>
              </div>

              {/* Number of Passengers */}
              <div className="space-y-2">
                <Label htmlFor="numberOfPassengers">
                  Number of Passengers <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="numberOfPassengers"
                    // type="number"
                    min="1"
                    max="50"
                    {...register("numberOfPassengers", { valueAsNumber: true })}
                    placeholder="Enter number of passengers"
                    className={`pl-10 ${errors.numberOfPassengers ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.numberOfPassengers && (
                  <p className="text-sm text-red-500">{errors.numberOfPassengers.message}</p>
                )}
                <p className="text-sm text-gray-500">Maximum 50 passengers per request</p>
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Important Guidelines:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Requests must be submitted at least 3 days in advance</li>
                  <li>• All trips are subject to vehicle availability</li>
                  <li>• Administrative approval is required for all requests</li>
                  <li>• You will receive an email confirmation once your request is processed</li>
                  <li>• Contact the transport office for urgent requests</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Requisition Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900">Transport Office</h4>
                <p className="text-gray-600">Phone: +880-XXX-XXXXXX</p>
                <p className="text-gray-600">Email: transport@rmstu.edu.bd</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Office Hours</h4>
                <p className="text-gray-600">Sunday - Thursday: 9:00 AM - 5:00 PM</p>
                <p className="text-gray-600">Friday: 9:00 AM - 12:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
