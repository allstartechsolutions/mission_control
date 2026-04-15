import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import EmployeeForm from "@/components/EmployeeForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string; employeeId: string }> }) {
  noStore();
  const { id, employeeId } = await params;
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
      employees: {
        where: { id: employeeId },
        take: 1,
        include: {
          secondaryLocations: { select: { locationId: true } },
        },
      },
    },
  });

  const employee = client?.employees[0];
  if (!client || !employee) notFound();

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
            <span>{employee.name}</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Edit employee</h1>
          <p className="mt-1 text-sm text-gray-500">Update this employee without leaving the client workspace flow.</p>
        </div>
        <Link
          href={`/clients/${client.id}/employees`}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]"
        >
          <ChevronLeft size={16} />
          Back to employees
        </Link>
      </div>

      <EmployeeForm
        mode="edit"
        clientId={client.id}
        employeeId={employee.id}
        clientName={client.companyName}
        locations={client.locations}
        initialValues={{
          name: employee.name,
          title: employee.title ?? "",
          email: employee.email ?? "",
          phone: employee.phone ?? "",
          mobile: employee.mobile ?? "",
          whatsapp: employee.whatsapp ?? "",
          status: employee.status,
          profileImagePath: employee.profileImagePath ?? "",
          primaryLocationId: employee.primaryLocationId ?? "",
          secondaryLocationIds: employee.secondaryLocations.map((sl: { locationId: string }) => sl.locationId),
        }}
      />
    </div>
  );
}
