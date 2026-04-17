import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ClientForm from "@/components/ClientForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <Link href="/clients" className="hover:text-[#405189]">Clients</Link>
            <span className="mx-2">&rsaquo;</span>
            <span>{client.companyName}</span>
            <span className="mx-2">&rsaquo;</span>
            <span>Edit</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Edit client</h1>
          <p className="mt-1 text-sm text-gray-500">Update account details while keeping the current client employee records untouched.</p>
        </div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]"
        >
          <ChevronLeft size={16} />
          Back to clients
        </Link>
      </div>

      <ClientForm
        mode="edit"
        clientId={client.id}
        initialValues={{
          companyName: client.companyName,
          logoPath: client.logoPath ?? "",
          businessEmail: client.businessEmail ?? "",
          website: client.website ?? "",
          addressLine1: client.addressLine1 ?? "",
          addressLine2: client.addressLine2 ?? "",
          city: client.city ?? "",
          state: client.state ?? "",
          zipCode: client.zipCode ?? "",
          country: client.country ?? "",
          phone: client.phone ?? "",
          mobile: client.mobile ?? "",
          whatsapp: client.whatsapp ?? "",
          primaryContactName: client.primaryContactName ?? "",
          primaryContactTitle: client.primaryContactTitle ?? "",
          primaryContactEmail: client.primaryContactEmail ?? "",
          primaryContactPhone: client.primaryContactPhone ?? "",
          status: client.status,
        }}
      />
    </div>
  );
}
