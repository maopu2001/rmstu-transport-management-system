"use client"

import type React from "react"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Bus, LogOut, User } from "lucide-react"

interface DriverLayoutProps {
  children: React.ReactNode
}

export function DriverLayout({ children }: DriverLayoutProps) {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bus className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold">RMSTU Driver</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{session?.user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
