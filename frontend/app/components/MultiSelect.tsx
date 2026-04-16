"use client";

import { useState, useRef, useEffect } from "react";

interface MultiSelectProps {
  label?: string; // label เป็น optional
  options: string[];
  selected?: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: boolean;
}

export default function MultiSelect({
  label,
  options,
  selected = [],
  onChange,
  placeholder = "เลือก...",
  className = "",
  required = false,
  error = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectId = label ? label.replace(/\s+/g, "-").toLowerCase() : "";

  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label htmlFor={selectId} className="block text-[14px] text-BLUE font-prompt mb-1.5 px-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={() => setOpen(!open)}
        className={`border rounded-lg px-3 py-2 flex items-center justify-between gap-2 cursor-pointer bg-white min-h-[45px]
          ${error ? "border-red-500" : "border-BLUE"}
          text-blue-600
          ${className}`}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selected.length === 0 ? (
            <span className="text-sm text-gray-400">{placeholder}</span>
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

        <div className="flex items-center gap-1.5 shrink-0">
          {selected.length > 0 && (
            <>
              <span className="bg-[#1a3a8f] text-white text-[11px] font-medium w-5 h-5 rounded flex items-center justify-center">
                {selected.length}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                className="text-gray-400 hover:text-red-500 leading-none text-base"
              >
                ×
              </button>
            </>
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

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => toggle(opt)}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[#f0f4ff] text-gray-700"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected.includes(opt) ? "bg-[#1a3a8f] border-[#1a3a8f]" : "border-gray-300"
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
      {error && <p className="text-red-500 text-xs mt-1 px-2">กรุณาเลือกข้อมูล</p>}
    </div>
  );
}