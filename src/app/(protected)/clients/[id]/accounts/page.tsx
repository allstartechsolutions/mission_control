import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { LockKeyhole, Plus } from "lucide-react";
import Link from "next/link";
import ClientAccountsTable from "@/components/ClientAccountsTable";
import { ClientWorkspaceShell, EmptyState } from "@/components/ClientWorkspaceShell";
import { decryptAccountSecret } from "@/lib/account-crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientAccountsPage({ params }: { params: Promise<{ id: string }> }) {
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
      accounts: {
        orderBy: [{ name: "asc" }, { updatedAt: "desc" }],
        select: {
          id: true,
          name: true,
          description: true,
          usernameEncrypted: true,
          passwordEncrypted: true,
          updatedAt: true,
        },
      },
      _count: {
        select: {
          locations: true,
          employees: true,
          projects: true,
          accounts: true,
        },
      },
    },
  });

  if (!client) notFound();

  return (
    <ClientWorkspaceShell
      activeTab="accounts"
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
        locationCount: client._count.locations,
        accountCount: client._count.accounts,
      }}
    >
      {client.accounts.length === 0 ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href={`/clients/${client.id}/accounts/new`} className="inline-flex items-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]">
              <Plus size={16} />
              Add account
            </Link>
          </div>
          <EmptyState icon={LockKeyhole} title="No accounts yet" description="Store client credentials here when Mission Control needs them. Usernames and passwords are encrypted before they are written to the database." />
        </div>
      ) : (
        <ClientAccountsTable
          clientId={client.id}
          clientName={client.companyName}
          accounts={client.accounts.map((account) => ({
            id: account.id,
            name: account.name,
            description: account.description,
            username: decryptAccountSecret(account.usernameEncrypted),
            password: decryptAccountSecret(account.passwordEncrypted),
            updatedAtLabel: account.updatedAt.toLocaleString(),
          }))}
        />
      )}
    </ClientWorkspaceShell>
  );
}
