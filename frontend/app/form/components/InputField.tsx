interface InputFieldProps {
  label: string;
  placeholder?: string;
  id?: string; 
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;        
  className?: string;
  required?: boolean; // เพิ่ม prop นี้
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
}: InputFieldProps) {
  const inputId = id || label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className={`mt-4 mb-[24px]`}>
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
        className={`${className} text-[14px] w-full border border-BLUE font-prompt h-[45px] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-blue-600"}`}
      />
    </div>
  );
}