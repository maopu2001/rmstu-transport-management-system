import { DashboardStats } from "@/components/admin/dashboard-stats";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the RMSTU Transport Management System Admin Panel
        </p>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Charts */}
      <DashboardCharts />
    </div>
  );
}
