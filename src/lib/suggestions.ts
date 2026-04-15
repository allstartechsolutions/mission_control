export const suggestionStatusOptions = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "planned", label: "Planned" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "implemented", label: "Implemented" },
  { value: "archived", label: "Archived" },
] as const;

export const suggestionImpactOptions = ["Low", "Medium", "High", "Strategic"] as const;
export const suggestionEffortOptions = ["Low", "Medium", "High", "Large"] as const;

export function formatSuggestionStatus(status: string) {
  return suggestionStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function suggestionStatusClass(status: string) {
  const styles: Record<string, string> = {
    new: "bg-sky-50 text-sky-700 ring-sky-600/20",
    under_review: "bg-amber-50 text-amber-700 ring-amber-600/20",
    planned: "bg-violet-50 text-violet-700 ring-violet-600/20",
    accepted: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
    implemented: "bg-teal-50 text-teal-700 ring-teal-600/20",
    archived: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

  return styles[status] ?? styles.archived;
}
