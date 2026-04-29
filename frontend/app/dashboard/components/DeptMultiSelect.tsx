"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type Option = { label: string; value: string };

interface Props {
  options: Option[];
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  maxVisible?: number; // จำนวนที่แสดงก่อนไม่บอก
}

export default function DeptMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "All Department",
  maxVisible = 4,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val]);
  };

  const visibleSelected = selected.slice(0, maxVisible);
  const hiddenCount = selected.length - maxVisible;

  return (
    <div ref={ref} className="relative flex-shrink-0" style={{ minWidth: 180, maxWidth: 360 }}>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-[#616872] rounded-[6px] px-3 h-[30px] bg-white cursor-pointer text-sm"
      >
        {/* tags หรือ placeholder */}
        <div className="flex items-center gap-1 flex-1 overflow-hidden">
          {selected.length === 0 ? (
            <span className="text-gray-400 text-sm truncate">{placeholder}</span>
          ) : (
            <>
              {visibleSelected.map(v => {
                const label = options.find(o => o.value === v)?.label ?? v;
                return (
                  <span
                    key={v}
                    className="flex items-center gap-0.5 bg-[#e8edf8] text-[#1a3a8f] text-[11px] px-1.5 py-0.5 rounded whitespace-nowrap"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); toggle(v); }}
                      className="hover:text-red-500 leading-none ml-0.5"
                    >×</button>
                  </span>
                );
              })}
              {hiddenCount > 0 && (
                <span className="text-[11px] text-[#1a3a8f] font-medium whitespace-nowrap">
                  +{hiddenCount} more
                </span>
              )}
            </>
          )}
        </div>

        {/* right icons */}
        <div className="flex items-center gap-1 shrink-0">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange([]); }}
              className="text-gray-400 hover:text-red-500 text-base leading-none"
            >×</button>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* dropdown */}
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-[220px] bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto">
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[#f0f4ff] text-gray-700"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected.includes(opt.value) ? "bg-[#1a3a8f] border-[#1a3a8f]" : "border-gray-300"
                }`}>
                {selected.includes(opt.value) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}