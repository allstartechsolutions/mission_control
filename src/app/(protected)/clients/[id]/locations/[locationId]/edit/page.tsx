import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import LocationForm from "@/components/LocationForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditLocationPage({ params }: { params: Promise<{ id: string; locationId: string }> }) {
  noStore();
  const { id, locationId } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      locations: {
        where: { id: locationId },
        take: 1,
      },
    },
  });

  const location = client?.locations[0];
  if (!client || !location) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <Link href="/clients" className="hover:text-[#405189]">Clients</Link>
            <span className="mx-2">&rsaquo;</span>
            <Link href={`/clients/${client.id}`} className="hover:text-[#405189]">{client.companyName}</Link>
            <span className="mx-2">&rsaquo;</span>
            <Link href={`/clients/${client.id}/locations`} className="hover:text-[#405189]">Locations</Link>
            <span className="mx-2">&rsaquo;</span>
            <span>{location.name}</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Edit location</h1>
          <p className="mt-1 text-sm text-gray-500">Update this location without leaving the client workspace flow.</p>
        </div>
        <Link
          href={`/clients/${client.id}/locations`}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]"
        >
          <ChevronLeft size={16} />
          Back to locations
        </Link>
      </div>

      <LocationForm
        mode="edit"
        clientId={client.id}
        locationId={location.id}
        clientName={client.companyName}
        initialValues={{
          name: location.name,
          addressLine1: location.addressLine1 ?? "",
          addressLine2: location.addressLine2 ?? "",
          city: location.city ?? "",
          state: location.state ?? "",
          zipCode: location.zipCode ?? "",
          country: location.country ?? "",
          phone: location.phone ?? "",
          status: location.status,
        }}
      />
    </div>
  );
}
