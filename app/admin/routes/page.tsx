"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import RouteManagement with no SSR to avoid leaflet issues
const RouteManagement = dynamic(
  () =>
    import("@/components/admin/route-management").then((mod) => ({
      default: mod.RouteManagement,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading route management...</p>
        </div>
      </div>
    ),
  }
);

export default function RoutesPage() {
  return <RouteManagement />;
}
