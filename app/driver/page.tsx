import { MySchedule } from "@/components/driver/my-schedule";

export default function DriverDashboard() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your trips, track locations, and view schedules
        </p>
      </div>
      <MySchedule />
    </div>
  );
}
