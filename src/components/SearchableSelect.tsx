"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export default function SearchableSelect({
  label,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  value,
  onChange,
  options,
  disabled,
  hint,
  clearable,
}: {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  hint?: string;
  clearable?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => [option.label, option.description].filter(Boolean).some((part) => part!.toLowerCase().includes(term)));
  }, [options, query]);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className="searchable-select-trigger flex w-full items-center justify-between text-left disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <span className={selectedOption ? "text-gray-700" : "text-gray-400"}>{selectedOption?.label || placeholder}</span>
          <div className="flex items-center gap-2">
            {clearable && value ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onChange("");
                  setOpen(false);
                  setQuery("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onChange("");
                    setOpen(false);
                    setQuery("");
                  }
                }}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label={`Clear ${label}`}
              >
                <X size={13} />
              </span>
            ) : null}
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </button>

        {open ? (
          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 p-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="form-control bg-gray-50 pl-8 pr-8 focus:bg-white"
                />
                {query ? (
                  <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                ) : null}
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-gray-500">{emptyMessage}</div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm transition ${
                      option.value === value ? "bg-[#405189]/10 text-[#405189]" : "text-gray-700 hover:bg-gray-50"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className="font-medium">{option.label}</span>
                    {option.description ? <span className="mt-0.5 text-xs text-gray-500">{option.description}</span> : null}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
      {hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
    </div>
  );
}
