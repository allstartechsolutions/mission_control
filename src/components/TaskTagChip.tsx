import { X } from "lucide-react";

export default function TaskTagChip({ name, onRemove }: { name: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#405189]/10 px-2.5 py-1 text-xs font-medium text-[#405189] ring-1 ring-inset ring-[#405189]/20">
      {name}
      {onRemove ? (
        <button type="button" onClick={onRemove} className="ml-0.5 rounded-full p-0.5 hover:bg-[#405189]/15" aria-label={`Remove ${name}`}>
          <X size={12} />
        </button>
      ) : null}
    </span>
  );
}
