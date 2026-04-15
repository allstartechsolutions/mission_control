import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import EmployeeForm from "@/components/EmployeeForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      locations: {
        where: { status: "active" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, city: true, state: true },
      },
    },
  });

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
            <Link href={`/clients/${client.id}/employees`} className="hover:text-[#405189]">Employees</Link>
            <span className="mx-2">&rsaquo;</span>
            <span>New</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Add employee</h1>
          <p className="mt-1 text-sm text-gray-500">Create a new employee record directly inside the client workspace.</p>
        </div>
        <Link
          href={`/clients/${client.id}/employees`}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]"
        >
          <ChevronLeft size={16} />
          Back to employees
        </Link>
      </div>

      <EmployeeForm mode="create" clientId={client.id} clientName={client.companyName} locations={client.locations} />
    </div>
  );
}
