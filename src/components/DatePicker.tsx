"use client";

import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type DatePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
};

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const valueFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

function parseDateValue(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCalendarDays(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const days: Date[] = [];
  const leadingDays = start.getDay();

  for (let index = leadingDays; index > 0; index -= 1) {
    days.push(new Date(start.getFullYear(), start.getMonth(), 1 - index));
  }

  for (let day = 1; day <= end.getDate(); day += 1) {
    days.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }

  while (days.length < 42) {
    const last = days[days.length - 1];
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }

  return days;
}

export default function DatePicker({ label, value, onChange, hint, placeholder = "Select a date", required, disabled }: DatePickerProps) {
  const labelId = useId();
  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(selectedDate ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const weekdays = useMemo(() => {
    const base = new Date(2026, 0, 4);
    return Array.from({ length: 7 }, (_, index) => weekdayFormatter.format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + index)));
  }, []);

  const days = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

  return (
    <div className="block space-y-1.5">
      <span id={labelId} className="text-sm font-medium text-gray-700">{label}{required ? <span className="sr-only"> required</span> : null}</span>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => !disabled && setOpen((current) => !current)}
          disabled={disabled}
          className="date-picker-trigger"
          aria-expanded={open}
          aria-required={required}
          aria-labelledby={labelId}
        >
          <span className={`truncate text-left ${selectedDate ? "text-gray-700" : "text-gray-400"}`}>
            {selectedDate ? valueFormatter.format(selectedDate) : placeholder}
          </span>
          <CalendarDays size={16} className="shrink-0 text-gray-400" />
        </button>
        {open ? (
          <div className="date-picker-popover">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-3">
              <button type="button" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="date-picker-nav-button" aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>
              <div className="text-sm font-semibold text-gray-800">{monthFormatter.format(visibleMonth)}</div>
              <button type="button" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="date-picker-nav-button" aria-label="Next month">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 px-3 pt-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {weekdays.map((weekday) => <div key={weekday}>{weekday.slice(0, 2)}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 p-3 pt-2">
              {days.map((day) => {
                const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                const isSelected = value === toDateValue(day);
                const isToday = toDateValue(day) === toDateValue(new Date());

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => {
                      onChange(toDateValue(day));
                      setOpen(false);
                    }}
                    className={`date-picker-day ${isSelected ? "date-picker-day-selected" : ""} ${!isCurrentMonth ? "date-picker-day-muted" : ""} ${isToday && !isSelected ? "date-picker-day-today" : ""}`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 px-3 py-3">
              <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600">
                <X size={14} />
                Clear
              </button>
              <button type="button" onClick={() => { const today = new Date(); setVisibleMonth(today); onChange(toDateValue(today)); setOpen(false); }} className="text-xs font-medium text-[#405189] hover:text-[#364474]">
                Today
              </button>
            </div>
          </div>
        ) : null}
      </div>
      {hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
    </div>
  );
}
