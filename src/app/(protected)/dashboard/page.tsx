import {
  BarChart3,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "$45,231", change: "+12.5%", icon: TrendingUp, color: "bg-emerald-500" },
  { label: "Active Users", value: "2,345", change: "+8.2%", icon: Users, color: "bg-blue-500" },
  { label: "Products", value: "1,280", change: "+3.1%", icon: Package, color: "bg-amber-500" },
  { label: "Conversions", value: "18.2%", change: "+2.4%", icon: BarChart3, color: "bg-purple-500" },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
        <nav className="text-sm text-gray-400">
          <span className="text-[#405189]">Mission Control</span>
          <span className="mx-2">&rsaquo;</span>
          <span>Dashboard</span>
        </nav>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-800">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.color} text-white`}
              >
                <stat.icon size={20} />
              </div>
            </div>
            <p className="mt-3 text-xs text-emerald-600">{stat.change} from last month</p>
          </div>
        ))}
      </div>

      {/* Placeholder panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Recent Activity
          </h2>
          <div className="flex h-48 items-center justify-center text-gray-300">
            Activity feed will appear here
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            OpenClaw Integration
          </h2>
          <div className="flex h-48 items-center justify-center text-gray-300">
            OpenClaw status and events
          </div>
        </div>
      </div>
    </div>
  );
}
