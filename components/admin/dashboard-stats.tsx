"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bus, Route, Clock, FileText } from "lucide-react"

const stats = [
  {
    title: "Active Buses",
    value: "12",
    change: "+2 from last week",
    icon: Bus,
    color: "text-green-600",
  },
  {
    title: "Total Routes",
    value: "8",
    change: "No change",
    icon: Route,
    color: "text-blue-600",
  },
  {
    title: "Ongoing Trips",
    value: "5",
    change: "+1 from yesterday",
    icon: Clock,
    color: "text-orange-600",
  },
  {
    title: "Pending Requisitions",
    value: "15",
    change: "+3 new today",
    icon: FileText,
    color: "text-purple-600",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
