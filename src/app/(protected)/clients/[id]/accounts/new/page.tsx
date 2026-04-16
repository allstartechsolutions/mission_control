import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ClientAccountForm from "@/components/ClientAccountForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewClientAccountPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id }, select: { id: true, companyName: true } });

  if (!client) notFound();

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
            <Link href={`/clients/${client.id}/accounts`} className="hover:text-[#405189]">Accounts</Link>
            <span className="mx-2">&rsaquo;</span>
            <span>New</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Add account</h1>
          <p className="mt-1 text-sm text-gray-500">Create an encrypted credential record for this client.</p>
        </div>
        <Link href={`/clients/${client.id}/accounts`} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]">
          <ChevronLeft size={16} />
          Back to accounts
        </Link>
      </div>

      <ClientAccountForm mode="create" clientId={client.id} clientName={client.companyName} />
    </div>
  );
}
