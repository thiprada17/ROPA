"use client";

type Option = {
  label: string;
  value: string;
};

interface SingleSelectProps {
  options: Option[] | string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}

export default function SingleSelect({
  options = [],
  value,
  onChange,
  placeholder = "เลือกหมวดหมู่...",
  className = "",
  disabled = false,
  required = false,
  error = false,
}: SingleSelectProps) {
  const normalizedOptions: Option[] = (options || [])
    .filter(Boolean)
    .map((opt) => {
      if (typeof opt === "string") {
        return { label: opt, value: opt };
      }

      if (
        typeof opt === "object" &&
        opt !== null &&
        "label" in opt &&
        "value" in opt
      ) {
        return {
          label: String(opt.label ?? ""),
          value: String(opt.value ?? ""),
        };
      }

      return null;
    })
    .filter((opt): opt is Option => opt !== null && !!opt.value);

  return (
    <div>
      {required && <span className="sr-only">Required</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full border border-BLUE rounded-md px-4 h-[45px] text-sm 
            ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-blue-600"} 
            ${error ? "border-red-500" : "border-BLUE"} appearance-none outline-none focus:border-[#1a3a8f] cursor-pointer ${className}`}
        >
          <option value="">{placeholder}</option>
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-1 px-2">กรุณาเลือกข้อมูล</p>}
    </div>
  );
}