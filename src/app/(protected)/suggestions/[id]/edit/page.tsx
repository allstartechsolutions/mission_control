import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import SuggestionForm from "@/components/SuggestionForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditSuggestionPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;

  const [suggestion, clients] = await Promise.all([
    prisma.suggestion.findUnique({ include: { attachments: { orderBy: { createdAt: "asc" } } }, where: { id } }),
    prisma.client.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: "asc" } }),
  ]);

  if (!suggestion) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <Link href="/suggestions" className="hover:text-[#405189]">Suggestions</Link>
            <span className="mx-2">&rsaquo;</span>
            <Link href={`/suggestions/${suggestion.id}`} className="hover:text-[#405189]">{suggestion.title}</Link>
            <span className="mx-2">&rsaquo;</span>
            <span>Edit</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Edit suggestion</h1>
          <p className="mt-1 text-sm text-gray-500">Update the intake record, its review status, and any supporting files.</p>
        </div>
        <Link href={`/suggestions/${suggestion.id}`} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]">
          <ChevronLeft size={16} />
          Back to detail
        </Link>
      </div>

      <SuggestionForm
        mode="edit"
        suggestionId={suggestion.id}
        clients={clients}
        initialValues={{
          title: suggestion.title,
          body: suggestion.body,
          status: suggestion.status,
          category: suggestion.category ?? "",
          area: suggestion.area ?? "",
          impact: suggestion.impact ?? "",
          effort: suggestion.effort ?? "",
          whyItMatters: suggestion.whyItMatters ?? "",
          expectedOutcome: suggestion.expectedOutcome ?? "",
          clientId: suggestion.clientId ?? "",
          linkedProject: suggestion.linkedProject ?? "",
          decisionNotes: suggestion.decisionNotes ?? "",
        }}
        existingAttachments={suggestion.attachments.map((attachment) => ({
          id: attachment.id,
          fileName: attachment.fileName,
          filePath: attachment.filePath,
          mimeType: attachment.mimeType,
          fileSize: attachment.fileSize,
          createdAt: attachment.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
