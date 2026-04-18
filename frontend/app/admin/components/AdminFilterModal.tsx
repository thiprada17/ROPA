"use client";
import { X, Check } from "lucide-react";
import { departments, roles } from "../data/userMock";

interface Props {
    open: boolean;
    onClose: () => void;
    selectedRoles: string[];
    setSelectedRoles: (v: string[]) => void;
    selectedDepts: string[];
    setSelectedDepts: (v: string[]) => void;
}

const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition
      ${active
                ? "border-[#03369D] text-[#03369D] bg-white font-medium"
                : "border-gray-300 text-gray-600 bg-white hover:border-[#03369D]"
            }`}
    >
        {active && <Check size={11} strokeWidth={3} />}
        {label}
    </button>
);


export default function AdminFilterModal({
    open, onClose,
    selectedRoles, setSelectedRoles,
    selectedDepts, setSelectedDepts,
}: Props) {
    if (!open) return null;

    const toggleRole = (r: string) =>
        setSelectedRoles(selectedRoles.includes(r) ? selectedRoles.filter(x => x !== r) : [...selectedRoles, r]);

    const toggleDept = (d: string) =>
        setSelectedDepts(selectedDepts.includes(d) ? selectedDepts.filter(x => x !== d) : [...selectedDepts, d]);

    const selectDepartments = () =>
        setSelectedDepts(selectedDepts.length === departments.length ? [] : [...departments]);

    const clearAll = () => { setSelectedRoles([]); setSelectedDepts([]); };

    const totalSelected = selectedRoles.length + selectedDepts.length;

    return (
        // เผอื่ตอนย่อจอเล็กๆๆ ถ้ามันสูงเกินจะมี scroll
        <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-[560px] max-h-[80vh] overflow-y-auto        
  bg-white rounded-2xl shadow-2xl z-30 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
                <span className="text-[15px] font-semibold text-gray-800">Filters</span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                    <X size={18} />
                </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-6">

                {/* Section: แผนก */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-[13px] font-semibold text-gray-800">บทบาทผู้เข้าถึงข้อมูล</p>
                            <p className="text-[11px] text-gray-400">{departments.length} ฝ่าย</p>
                        </div>
                        <button
                            onClick={selectDepartments}
                            className="text-[12px] text-gray-500 hover:text-[#03369D] transition border border-gray-200 px-3 py-1 rounded-full"
                        >
                            {selectedDepts.length === departments.length ? "Deselect All" : "Select All"}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {departments.map(d => (
                            <Chip key={d} label={d} active={selectedDepts.includes(d)} onClick={() => toggleDept(d)} />
                        ))}
                    </div>
                </div>

                <div className="border-t" />

                {/* Section: สิทธิ์ */}
                <div>
                    <div className="mb-3">
                        <p className="text-[13px] font-semibold text-gray-800">สิทธิ์การใช้งาน</p>
                        <p className="text-[11px] text-gray-400">{roles.length} สิทธิ์</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {roles.map(r => (
                            <Chip key={r} label={r} active={selectedRoles.includes(r)} onClick={() => toggleRole(r)} />
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <button
                    onClick={clearAll}
                    className="px-5 py-2 rounded-full text-[12px] font-medium bg-[#e8304a] text-white hover:bg-[#c9273f] transition"
                >
                    Clear All
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-full text-[12px] border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-full text-[12px] bg-[#03369D] text-white hover:bg-[#02287d] transition font-medium"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}