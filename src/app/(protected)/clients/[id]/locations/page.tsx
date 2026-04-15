import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { MapPin, MapPinPlus } from "lucide-react";
import Link from "next/link";
import LocationsTable from "@/components/LocationsTable";
import { ClientWorkspaceShell, EmptyState } from "@/components/ClientWorkspaceShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientLocationsPage({ params }: { params: Promise<{ id: string }> }) {
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
      locations: {
        orderBy: [{ status: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          addressLine1: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          phone: true,
          status: true,
          _count: {
            select: {
              primaryEmployees: true,
              secondaryEmployees: true,
            },
          },
        },
      },
      _count: {
        select: {
          employees: true,
          projects: true,
        },
      },
    },
  });

  if (!client) notFound();

  return (
    <ClientWorkspaceShell
      activeTab="locations"
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
        employeeCount: client._count.employees,
        projectCount: client._count.projects,
        locationCount: client.locations.length,
      }}
    >
      {client.locations.length === 0 ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link
              href={`/clients/${client.id}/locations/new`}
              className="inline-flex items-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]"
            >
              <MapPinPlus size={16} />
              Add location
            </Link>
          </div>
          <EmptyState
            icon={MapPin}
            title="No locations yet"
            description="Add physical sites and addresses for this client. Employees can then be assigned to primary and secondary locations."
          />
        </div>
      ) : (
        <LocationsTable clientId={client.id} clientName={client.companyName} locations={client.locations} />
      )}
    </ClientWorkspaceShell>
  );
}
