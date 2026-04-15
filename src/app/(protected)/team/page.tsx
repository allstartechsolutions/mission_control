import { unstable_noStore as noStore } from "next/cache";
import { ShieldCheck, Smartphone, Users } from "lucide-react";
import TeamTable from "@/components/TeamTable";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  noStore();
  const members = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }, { email: "asc" }],
  });

  const totalMembers = members.length;
  const adminCount = members.filter((member) => member.role === "admin").length;
  const withMobileCount = members.filter((member) => member.mobile || member.whatsapp).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Team</h1>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <span>Team</span>
          </nav>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total team</p>
            <div className="mt-1 flex items-center gap-2 text-gray-800">
              <Users size={18} className="text-[#405189]" />
              <p className="text-2xl font-semibold">{totalMembers}</p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Admins</p>
            <div className="mt-1 flex items-center gap-2 text-gray-800">
              <ShieldCheck size={18} className="text-emerald-600" />
              <p className="text-2xl font-semibold">{adminCount}</p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Mobile-ready</p>
            <div className="mt-1 flex items-center gap-2 text-gray-800">
              <Smartphone size={18} className="text-amber-500" />
              <p className="text-2xl font-semibold">{withMobileCount}</p>
            </div>
          </div>
        </div>
      </div>

      <TeamTable
        members={members.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          mobile: member.mobile,
          whatsapp: member.whatsapp,
          role: member.role,
          createdAt: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(member.createdAt),
        }))}
      />
    </div>
  );
}
