import { unstable_noStore as noStore } from "next/cache";
import { Lightbulb, Paperclip, Users } from "lucide-react";
import SuggestionsTable from "@/components/SuggestionsTable";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuggestionsPage() {
  noStore();
  const suggestions = await prisma.suggestion.findMany({
    include: {
      suggestedBy: { select: { name: true, email: true } },
      client: { select: { companyName: true } },
      _count: { select: { attachments: true } },
    },
    orderBy: [{ suggestedAt: "desc" }, { createdAt: "desc" }],
  });

  const totalSuggestions = suggestions.length;
  const activeSuggestions = suggestions.filter((suggestion) => ["new", "under_review", "planned", "accepted"].includes(suggestion.status)).length;
  const attachmentCount = suggestions.reduce((sum, suggestion) => sum + suggestion._count.attachments, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Suggestions</h1>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <span>Suggestions</span>
          </nav>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total suggestions</p>
            <div className="mt-1 flex items-center gap-2 text-gray-800"><Lightbulb size={18} className="text-[#405189]" /><p className="text-2xl font-semibold">{totalSuggestions}</p></div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Open pipeline</p>
            <div className="mt-1 flex items-center gap-2 text-gray-800"><Users size={18} className="text-[#405189]" /><p className="text-2xl font-semibold">{activeSuggestions}</p></div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Attachments</p>
            <div className="mt-1 flex items-center gap-2 text-gray-800"><Paperclip size={18} className="text-[#405189]" /><p className="text-2xl font-semibold">{attachmentCount}</p></div>
          </div>
        </div>
      </div>

      <SuggestionsTable
        suggestions={suggestions.map((suggestion) => ({
          id: suggestion.id,
          title: suggestion.title,
          status: suggestion.status,
          category: suggestion.category,
          area: suggestion.area,
          impact: suggestion.impact,
          effort: suggestion.effort,
          suggestedAt: suggestion.suggestedAt.toISOString(),
          suggestedBy: suggestion.suggestedBy.name || suggestion.suggestedBy.email || "Unknown user",
          clientName: suggestion.client?.companyName ?? null,
          attachmentCount: suggestion._count.attachments,
        }))}
      />
    </div>
  );
}
