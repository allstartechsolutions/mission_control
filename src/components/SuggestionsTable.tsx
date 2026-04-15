"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, MessageSquarePlus, Paperclip, Pencil, Search } from "lucide-react";
import DeleteSuggestionButton from "@/components/DeleteSuggestionButton";
import { formatSuggestionStatus, suggestionStatusClass } from "@/lib/suggestions";

type SuggestionRow = {
  id: string;
  title: string;
  status: string;
  category: string | null;
  area: string | null;
  impact: string | null;
  effort: string | null;
  suggestedAt: string;
  suggestedBy: string;
  clientName: string | null;
  attachmentCount: number;
};

export default function SuggestionsTable({ suggestions }: { suggestions: SuggestionRow[] }) {
  const [query, setQuery] = useState("");

  const filteredSuggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return suggestions;

    return suggestions.filter((suggestion) =>
      [
        suggestion.title,
        suggestion.status,
        suggestion.category,
        suggestion.area,
        suggestion.impact,
        suggestion.effort,
        suggestion.suggestedBy,
        suggestion.clientName,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [query, suggestions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Suggestion intake</h2>
          <p className="text-sm text-gray-500">Review inbound ideas, track decisions, and keep attachments tied to the record.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search suggestions..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-[#405189] focus:bg-white"
            />
          </div>
          <Link href="/suggestions/new" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]">
            <MessageSquarePlus size={16} />
            New suggestion
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Suggestion</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Client / project</th>
                <th className="px-4 py-3">Suggested by</th>
                <th className="px-4 py-3">Attachments</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredSuggestions.map((suggestion) => (
                <tr key={suggestion.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-4">
                    <Link href={`/suggestions/${suggestion.id}`} className="font-semibold text-gray-800 hover:text-[#405189]">
                      {suggestion.title}
                    </Link>
                    <div className="mt-1 text-xs text-gray-500">
                      {[suggestion.area, suggestion.impact, suggestion.effort].filter(Boolean).join(" • ") || "Details pending"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${suggestionStatusClass(suggestion.status)}`}>
                      {formatSuggestionStatus(suggestion.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{suggestion.category || "General"}</td>
                  <td className="px-4 py-4 text-gray-700">
                    <div>{suggestion.clientName || "Internal"}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-700">{suggestion.suggestedBy}</div>
                    <div className="mt-1 text-xs text-gray-500">{new Date(suggestion.suggestedAt).toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    <div className="inline-flex items-center gap-2">
                      <Paperclip size={14} className="text-gray-400" />
                      {suggestion.attachmentCount}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/suggestions/${suggestion.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#405189] text-white hover:bg-[#364474]" title="Open suggestion">
                        <Eye size={15} />
                      </Link>
                      <Link href={`/suggestions/${suggestion.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:border-[#405189] hover:text-[#405189]" title="Edit suggestion">
                        <Pencil size={15} />
                      </Link>
                      <DeleteSuggestionButton suggestionId={suggestion.id} suggestionTitle={suggestion.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSuggestions.length === 0 ? <div className="border-t border-gray-100 px-4 py-10 text-center text-sm text-gray-500">No suggestions matched your search.</div> : null}
      </div>
    </div>
  );
}
