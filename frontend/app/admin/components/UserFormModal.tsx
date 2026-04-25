"use client";
import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { UserData, UserRole, LockStatus, departments, teams, roles, lockStatuses, UserStatus } from "../data/userMock";

interface Props {
    mode: "create" | "edit";
    user?: UserData;
    onClose: () => void;
    onSave: (data: Partial<UserData>) => void;
    onDelete?: (id: string) => void;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[11px] text-BLUE font-medium">{label}</label>
        {children}
    </div>
);

const inputCls = "border border-BLUE rounded-lg px-3 py-2 text-[12px] text-gray-700 outline-none focus:border-[#03369D] w-full";
const selectCls = "border border-BLUE rounded-lg px-3 py-2 text-[12px] text-gray-700 outline-none focus:border-[#03369D] w-full bg-white appearance-none";

export default function UserFormModal({ mode, user, onClose, onSave, onDelete }: Props) {
    const [form, setForm] = useState({
        fullName: user?.fullName ?? "",
        email: user?.email ?? "",
        password: user?.password ?? "",
        phone: user?.phone ?? "",
        position: user?.position ?? "",
        department: user?.department ?? "",
        team: user?.team ?? "",
        role: (user?.role ?? undefined) as UserRole | undefined,
        lockStatus: (user?.lockStatus ?? undefined) as LockStatus | undefined,
        accountStatus: user?.accountStatus ?? "Active" as UserStatus,
    });

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    console.log(form)
    const handleSave = async () => {
        try {
            if (mode == "create") {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8000/api/admin/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(form),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Create failed");

                onSave(data.user); // trigger fetchUsers ใน parent
                onClose();
            } else {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8000/api/admin/edit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(form),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Create failed");

                onSave(data.user); // trigger fetchUsers ใน parent
                onClose();
            }


        } catch (err: any) {
            console.error(err);
            alert(err.message);
        }
    };

    const [departmentsData, setDepartmentsData] = useState<any[]>([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("http://localhost:8000/api/admin/departments", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                console.log(data)

                if (!res.ok) throw new Error(data.error);

                setDepartmentsData(data);

            } catch (err) {
                console.error(err);
            }
        };

        fetchDepartments();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full sm:w-[75vw] max-h-[90vh] overflow-y-auto my-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-[14px] font-semibold text-gray-800">
                        {mode === "create" ? "Create User" : "Modification User"}
                    </h2>
                    <div className="flex items-center gap-3">
                        {mode === "edit" && (
                            <span className="text-[11px] px-3 py-1 bg-[#03369D] text-white rounded-full font-medium">
                                {form.accountStatus}
                            </span>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-4 sm:px-6 py-5 flex flex-col gap-4">
                    <Field label="ชื่อ-นามสกุล">
                        <input className={inputCls} placeholder="ชื่อ-นามสกุลพนักงาน" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Email">
                            <input className={inputCls} placeholder="example@gmail.com" value={form.email} onChange={e => set("email", e.target.value)} />
                        </Field>
                        <Field label="Password">
                            <input className={inputCls} placeholder="password234" type="text" value={form.password} onChange={e => set("password", e.target.value)} />
                        </Field>
                    </div>

                    <Field label="เบอร์โทรศัพท์">
                        <input className={inputCls} placeholder="0812345678" value={form.phone} onChange={e => set("phone", e.target.value)} />
                    </Field>

                    <Field label="ตำแหน่ง">
                        <input className={inputCls} placeholder="ตำแหน่งในองค์กร" value={form.position} onChange={e => set("position", e.target.value)} />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="ฝ่าย">
                            <div className="relative">
                                <select
                                    className={selectCls}
                                    value={form.department}
                                    onChange={e => set("department", e.target.value)}
                                >
                                    <option value="">เลือกฝ่าย</option>

                                    {departmentsData.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.department_name}
                                        </option>
                                    ))}
                                </select>

                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                            </div>
                        </Field>
                        <Field label="ตำแหน่งในทีม">
                            <div className="relative">
                                <select className={selectCls} value={form.team} onChange={e => set("team", e.target.value)}>
                                    <option value="">เลือกตำแหน่ง</option>
                                    {teams.map(t => <option key={t}>{t}</option>)}
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                            </div>
                        </Field>
                    </div>

                    <Field label="สิทธิ์การใช้งาน">
                        <div className="relative">
                            <select className={selectCls} value={form.role} onChange={e => set("role", e.target.value)}>
                                <option value="">เลือกสิทธิ์</option>
                                {roles.map(r => <option key={r}>{r}</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                        </div>
                    </Field>

                    {mode === "edit" && (
                        <Field label="สถานะการล็อกบัญชี">
                            <div className="relative">
                                <select className={selectCls} value={form.lockStatus} onChange={e => set("lockStatus", e.target.value)}>
                                    <option value="">เลือกสถานะ</option>
                                    {lockStatuses.map(s => <option key={s}>{s}</option>)}
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                            </div>
                        </Field>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 border-t sticky bottom-0 bg-white">
                    {mode === "edit" && onDelete && user ? (
                        <button
                            onClick={() => { onDelete(user.id); onClose(); }}
                            className="flex items-center gap-1.5 text-[12px] text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
                        >
                            <Trash2 size={14} /> Delete User
                        </button>
                    ) : <div />}
                    <div className="flex gap-2">
                        <button onClick={onClose} className="text-[12px] px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                            Clear
                        </button>
                        <button onClick={handleSave} className="text-[12px] px-5 py-2 bg-[#03369D] text-white rounded-lg hover:bg-[#02287d] transition font-medium">
                            {mode === "create" ? "Create" : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
