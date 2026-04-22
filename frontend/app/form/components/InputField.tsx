interface InputFieldProps {
  label: string;
  placeholder?: string;
  id?: string;
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  error?: boolean; 
}

export default function InputField({
  label,
  placeholder,
  id,
  value = "",
  onChange,
  disabled = false,
  className = "",
  required = true,
  error = false, 
}: InputFieldProps) {
  const inputId = id || label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="relative">
      <label
        htmlFor={inputId}
        className="block text-[14px] text-BLUE font-prompt mb-1.5 px-2"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={inputId}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`${className} text-[14px] w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 ${error ? "border-red-500" : "border-BLUE"
          } ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-blue-600"}`}
      />
      {error && <p className="text-red-500 text-xs mt-1 px-2">กรุณากรอกข้อมูล</p>}
    </div>
  );
}