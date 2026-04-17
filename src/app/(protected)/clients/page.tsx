import { unstable_noStore as noStore } from "next/cache";
import { Users } from "lucide-react";
import ClientsTable from "@/components/ClientsTable";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  noStore();
  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: {
          employees: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { companyName: "asc" }],
  });

  const totalClients = clients.length;
  const activeClients = clients.filter((client) => client.status === "active").length;
  const totalEmployees = clients.reduce((sum, client) => sum + client._count.employees, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Clients</h1>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <span>Clients</span>
          </nav>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total clients</p>
            <p className="mt-1 text-2xl font-semibold text-gray-800">{totalClients}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600">{activeClients}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Client employees</p>
            <div className="mt-1 flex items-center gap-2 text-gray-800">
              <Users size={18} className="text-[#405189]" />
              <p className="text-2xl font-semibold">{totalEmployees}</p>
            </div>
          </div>
        </div>
      </div>

      <ClientsTable
        clients={clients.map((client) => ({
          id: client.id,
          companyName: client.companyName,
          logoPath: client.logoPath,
          primaryContactName: client.primaryContactName,
          primaryContactTitle: client.primaryContactTitle,
          primaryContactEmail: client.primaryContactEmail,
          primaryContactPhone: client.primaryContactPhone,
          businessEmail: client.businessEmail,
          website: client.website,
          phone: client.phone,
          status: client.status,
          employeeCount: client._count.employees,
          city: client.city,
          state: client.state,
        }))}
      />
    </div>
  );
}
