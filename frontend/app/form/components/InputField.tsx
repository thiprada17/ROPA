//app/form/components/InputField.tsx
interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
}

export default function InputField({ label, placeholder = "", type = "text" }: InputFieldProps) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-bold text-blue-600 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border rounded-lg py-2 px-4 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}