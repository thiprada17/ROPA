//app/form/components/InputField.tsx
interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
}

export default function InputField({ label, placeholder = "", type = "text" }: InputFieldProps) {
  return (
    <div className="mt-4 mb-7">
      <label className="block text-sm text-BLUE font-prompt mb-1 px-2">{label} <span className="text-red-500">*</span></label> 
      <input
        type={type}
        placeholder={placeholder}
        className=" text-sm w-full border border-BLUE font-prompt rounded-lg py-3 px-4 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}