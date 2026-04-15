import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TeamForm from "@/components/TeamForm";

export default function NewTeamMemberPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <Link href="/team" className="hover:text-[#405189]">Team</Link>
            <span className="mx-2">&rsaquo;</span>
            <span>New</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Create team member</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new Mission Control user with login access and direct contact details.</p>
        </div>
        <Link
          href="/team"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]"
        >
          <ChevronLeft size={16} />
          Back to team
        </Link>
      </div>

      <TeamForm mode="create" />
    </div>
  );
}
