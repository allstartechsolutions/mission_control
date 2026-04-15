import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { UserPlus, Users } from "lucide-react";
import Link from "next/link";
import EmployeesTable from "@/components/EmployeesTable";
import { ClientWorkspaceShell, EmptyState } from "@/components/ClientWorkspaceShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientEmployeesPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      logoPath: true,
      status: true,
      phone: true,
      city: true,
      state: true,
      primaryContactName: true,
      primaryContactTitle: true,
      primaryContactEmail: true,
      primaryContactPhone: true,
      employees: {
        orderBy: [{ status: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          title: true,
          email: true,
          phone: true,
          mobile: true,
          whatsapp: true,
          status: true,
          profileImagePath: true,
          primaryLocation: {
            select: { id: true, name: true },
          },
        },
      },
      _count: {
        select: {
          locations: true,
          projects: true,
        },
      },
    },
  });

  if (!client) notFound();

  return (
    <ClientWorkspaceShell
      activeTab="employees"
      client={{
        id: client.id,
        companyName: client.companyName,
        logoPath: client.logoPath,
        status: client.status,
        primaryContactName: client.primaryContactName,
        primaryContactTitle: client.primaryContactTitle,
        primaryContactEmail: client.primaryContactEmail,
        primaryContactPhone: client.primaryContactPhone,
        phone: client.phone,
        city: client.city,
        state: client.state,
        employeeCount: client.employees.length,
        projectCount: client._count.projects,
        locationCount: client._count.locations,
      }}
    >
      {client.employees.length === 0 ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link
              href={`/clients/${client.id}/employees/new`}
              className="inline-flex items-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]"
            >
              <UserPlus size={16} />
              Add employee
            </Link>
          </div>
          <EmptyState
            icon={Users}
            title="No employee records yet"
            description="This workspace is ready for employee management. Add the first employee to create contact records, profile images, and active status controls right inside the client flow."
          />
        </div>
      ) : (
        <EmployeesTable clientId={client.id} clientName={client.companyName} employees={client.employees} />
      )}
    </ClientWorkspaceShell>
  );
}
