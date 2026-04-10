"use client";

interface SingleSelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SingleSelect({
  options,
  value,
  onChange,
  placeholder = "เลือกหมวดหมู่...",
  className = "",
  disabled = false,
}: SingleSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full border border-BLUE  rounded-md px-4 h-[45px] text-sm text-gray-700 bg-white appearance-none outline-none 
    focus:border-[#1a3a8f] cursor-pointer ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""} ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* Custom arrow */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}