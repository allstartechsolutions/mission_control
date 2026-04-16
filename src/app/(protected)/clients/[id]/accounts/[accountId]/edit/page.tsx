import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ClientAccountForm from "@/components/ClientAccountForm";
import { decryptAccountSecret } from "@/lib/account-crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditClientAccountPage({ params }: { params: Promise<{ id: string; accountId: string }> }) {
  noStore();
  const { id, accountId } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      accounts: {
        where: { id: accountId },
        take: 1,
        select: {
          id: true,
          name: true,
          description: true,
          usernameEncrypted: true,
          passwordEncrypted: true,
        },
      },
    },
  });

  const account = client?.accounts[0];
  if (!client || !account) notFound();

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
            <span>{account.name}</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Edit account</h1>
          <p className="mt-1 text-sm text-gray-500">Update this encrypted credential record without leaving the client workspace.</p>
        </div>
        <Link href={`/clients/${client.id}/accounts`} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]">
          <ChevronLeft size={16} />
          Back to accounts
        </Link>
      </div>

      <ClientAccountForm
        mode="edit"
        clientId={client.id}
        accountId={account.id}
        clientName={client.companyName}
        initialValues={{
          name: account.name,
          description: account.description ?? "",
          username: decryptAccountSecret(account.usernameEncrypted),
          password: decryptAccountSecret(account.passwordEncrypted),
        }}
      />
    </div>
  );
}
