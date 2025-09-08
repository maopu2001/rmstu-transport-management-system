import type React from "react"

import { DriverLayout } from "@/components/driver/driver-layout"

export default function DriverLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <DriverLayout>{children}</DriverLayout>
}
