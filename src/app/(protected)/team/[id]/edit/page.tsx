import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import TeamForm from "@/components/TeamForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;
  const member = await prisma.user.findUnique({ where: { id } });

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <Link href="/team" className="hover:text-[#405189]">Team</Link>
            <span className="mx-2">&rsaquo;</span>
            <span>{member.name || member.email}</span>
            <span className="mx-2">&rsaquo;</span>
            <span>Edit</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Edit team member</h1>
          <p className="mt-1 text-sm text-gray-500">Update access and contact details for this internal Mission Control user.</p>
        </div>
        <Link
          href="/team"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]"
        >
          <ChevronLeft size={16} />
          Back to team
        </Link>
      </div>

      <TeamForm
        mode="edit"
        memberId={member.id}
        initialValues={{
          name: member.name ?? "",
          email: member.email,
          phone: member.phone ?? "",
          mobile: member.mobile ?? "",
          whatsapp: member.whatsapp ?? "",
          role: member.role,
        }}
      />
    </div>
  );
}
