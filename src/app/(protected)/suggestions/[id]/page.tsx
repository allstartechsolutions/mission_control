import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, FileText, FolderKanban, Paperclip, Pencil, UserRound } from "lucide-react";
import DeleteSuggestionButton from "@/components/DeleteSuggestionButton";
import { prisma } from "@/lib/prisma";
import { formatSuggestionStatus, suggestionStatusClass } from "@/lib/suggestions";

export const dynamic = "force-dynamic";

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</dt><dd className="mt-1 text-sm text-gray-700">{value}</dd></div>;
}

export default async function SuggestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;

  const suggestion = await prisma.suggestion.findUnique({
    where: { id },
    include: {
      suggestedBy: { select: { name: true, email: true } },
      client: { select: { id: true, companyName: true } },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!suggestion) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <Link href="/suggestions" className="hover:text-[#405189]">Suggestions</Link>
            <span className="mx-2">&rsaquo;</span>
            <span>{suggestion.title}</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-800">{suggestion.title}</h1>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${suggestionStatusClass(suggestion.status)}`}>{formatSuggestionStatus(suggestion.status)}</span>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">Review the suggestion details, supporting files, and current decision notes from one place.</p>
        </div>
        <Link href={`/suggestions/${suggestion.id}/edit`} className="inline-flex items-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]">
          <Pencil size={16} />
          Edit suggestion
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Suggestion</h2></div>
            <div className="space-y-5 p-5">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Proposal</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{suggestion.body}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <DetailRow label="Category" value={suggestion.category || "General"} />
                <DetailRow label="Area / module" value={suggestion.area || "Not set"} />
                <DetailRow label="Impact" value={suggestion.impact || "Not set"} />
                <DetailRow label="Effort" value={suggestion.effort || "Not set"} />
                <DetailRow label="Linked client" value={suggestion.client?.companyName || "Internal / none"} />
                <DetailRow label="Linked project" value={suggestion.linkedProject || "Not set"} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Business case</h2></div>
              <div className="space-y-4 p-5 text-sm text-gray-700">
                <div><h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Why this matters</h3><p className="mt-2 whitespace-pre-wrap">{suggestion.whyItMatters || "No rationale entered yet."}</p></div>
                <div><h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Expected outcome</h3><p className="mt-2 whitespace-pre-wrap">{suggestion.expectedOutcome || "No expected outcome entered yet."}</p></div>
              </div>
            </section>
            <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Decision notes</h2></div>
              <div className="p-5 text-sm text-gray-700 whitespace-pre-wrap">{suggestion.decisionNotes || "No decision notes yet."}</div>
            </section>
          </div>
        </section>

        <section className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Record info</h2></div>
            <div className="space-y-4 p-5">
              <div className="flex items-start gap-3"><div className="rounded-md bg-[#405189]/10 p-2 text-[#405189]"><UserRound size={16} /></div><div><p className="text-sm font-medium text-gray-800">Suggested by</p><p className="text-sm text-gray-500">{suggestion.suggestedBy.name || suggestion.suggestedBy.email || "Unknown user"}</p></div></div>
              <div className="flex items-start gap-3"><div className="rounded-md bg-[#405189]/10 p-2 text-[#405189]"><CalendarClock size={16} /></div><div><p className="text-sm font-medium text-gray-800">Suggested at</p><p className="text-sm text-gray-500">{suggestion.suggestedAt.toLocaleString()}</p></div></div>
              <div className="flex items-start gap-3"><div className="rounded-md bg-[#405189]/10 p-2 text-[#405189]"><FolderKanban size={16} /></div><div><p className="text-sm font-medium text-gray-800">Lifecycle state</p><p className="text-sm text-gray-500">{formatSuggestionStatus(suggestion.status)}</p></div></div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Attachments</h2></div>
            <div className="space-y-3 p-5">
              {suggestion.attachments.length > 0 ? suggestion.attachments.map((attachment) => (
                <a key={attachment.id} href={attachment.filePath} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-[#405189] hover:text-[#405189]">
                  <span className="inline-flex items-center gap-2"><Paperclip size={14} /> {attachment.fileName}</span>
                  <span className="text-xs text-gray-500">{Math.max(1, Math.round(attachment.fileSize / 1024))} KB</span>
                </a>
              )) : <div className="rounded-lg bg-gray-50 px-4 py-6 text-sm text-gray-500">No attachments yet.</div>}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Next actions</h2></div>
            <div className="space-y-3 p-5">
              <Link href={`/suggestions/${suggestion.id}/edit`} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]"><Pencil size={15} /> Update record</Link>
              <Link href="/suggestions" className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]"><FileText size={15} /> Back to list</Link>
              <DeleteSuggestionButton suggestionId={suggestion.id} suggestionTitle={suggestion.title} variant="full" redirectTo="/suggestions" />
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
