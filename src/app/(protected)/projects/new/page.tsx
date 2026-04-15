import Link from "next/link";
import ProjectForm from "@/components/ProjectForm";
import { prisma } from "@/lib/prisma";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      companyName: true,
      employees: {
        select: { id: true, name: true, title: true, email: true, status: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { companyName: "asc" },
  });

  const { clientId } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <nav className="text-sm text-gray-400"><Link href="/projects" className="hover:text-[#405189]">Projects</Link><span className="mx-2">&rsaquo;</span><span>Create</span></nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Create project</h1>
          <p className="mt-1 text-sm text-gray-500">Stand up a real project workspace with filtered requester selection and financials.</p>
        </div>
        <Link href="/projects" className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50">Back to projects</Link>
      </div>
      <ProjectForm mode="create" clients={clients} initialValues={{ clientId: clientId && clients.some((client) => client.id === clientId) ? clientId : "" }} />
    </div>
  );
}
