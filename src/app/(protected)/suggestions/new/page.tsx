import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SuggestionForm from "@/components/SuggestionForm";
import { prisma } from "@/lib/prisma";

export default async function NewSuggestionPage() {
  const clients = await prisma.client.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <Link href="/suggestions" className="hover:text-[#405189]">Suggestions</Link>
            <span className="mx-2">&rsaquo;</span>
            <span>New</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Create suggestion</h1>
          <p className="mt-1 text-sm text-gray-500">Capture a new intake item with enough detail for review and decision making.</p>
        </div>
        <Link href="/suggestions" className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]">
          <ChevronLeft size={16} />
          Back to suggestions
        </Link>
      </div>

      <SuggestionForm mode="create" clients={clients} />
    </div>
  );
}
