"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import LiveMap with no SSR to avoid window issues
const LiveMap = dynamic(
  () =>
    import("@/components/student/live-map").then((mod) => ({
      default: mod.LiveMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading live map...</p>
        </div>
      </div>
    ),
  }
);

export default function LiveMapPage() {
  return <LiveMap />;
}
