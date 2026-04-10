"use client";

import { useState, useRef, useEffect } from "react";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "เลือก...",
  className = "",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
  };

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger box */}
      <div
        onClick={() => setOpen(!open)}
        className={`border border-BLUE rounded-md px-3 py-2 flex items-center justify-between gap-2 cursor-pointer bg-white min-h-[45px] ${className}`}      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selected.length === 0 ? (
            <span className="text-xs text-gray-400">{placeholder}</span>
          ) : (
            selected.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 bg-[#e8edf8] text-[#1a3a8f] text-[12px] px-2 py-0.5 rounded-md"
              >
                {s}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(s);
                  }}
                  className="hover:text-red-500 leading-none"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        {/* ที่นับ + arrow ยังไม่ได้ทำกากบาทลบหมดนะคับ */}
        <div className="flex items-center gap-1.5 shrink-0">
          {selected.length > 0 && (
            <span className="bg-[#1a3a8f] text-white text-[11px] font-medium w-5 h-5 rounded flex items-center justify-center">
              {selected.length}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => toggle(opt)}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[#f0f4ff] text-gray-700"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  selected.includes(opt)
                    ? "bg-[#1a3a8f] border-[#1a3a8f]"
                    : "border-gray-300"
                }`}
              >
                {selected.includes(opt) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}