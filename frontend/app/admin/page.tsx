"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Filter, Plus, Calendar, ChevronDown, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { UserData } from "./data/userMock";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import AdminFilterModal from "./components/AdminFilterModal";
import Breadcrumb from "../Ropa/components/Breadcrumb";
import LoadingScreen from "../components/Loading";

export default function AdminPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [openDate, setOpenDate] = useState(false);
    const [openFilter, setOpenFilter] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
    const [modal, setModal] = useState<{ mode: "create" | "edit"; user?: UserData } | null>(null);
    const dateRef = useRef<HTMLDivElement>(null);
    const ITEMS_PER_PAGE = 10;

    const breadcrumbItems = [
        { label: <ShieldAlert size={16} />, href: "/" },
        { label: "ADMIN" },
    ];
    // ================= FETCH =================
    useEffect(() => {
        fetch("https://ropa-server.onrender.com/api/admin/users/get")
            .then(res => res.json())
            .then(data => {
                const formatted = data.map((u: any) => ({
                    id: u.id,
                    fullName: u.username,
                    email: u.email,
                    password: u.password,
                    phone: u.phone,
                    department: u.departments?.department_name || "-",
                    team: u.position,
                    role: u.role,
                    lockStatus: u.is_locked ? "Locked" : "Unlocked",
                    accountStatus: u.status === "ACTIVE" ? "Active" : "InActive",
                    createdAt: u.created_at || new Date().toISOString().split("T")[0]
                }));
                setUsers(formatted);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false)); // ← เพิ่มแค่นี้
    }, []);


    useEffect(() => { setPage(1); }, [search, selectedRoles, selectedDepts]);

    // ================= FILTER =================
    const filtered = users.filter(u => {
        const kw = search.toLowerCase();
        const matchSearch = u.fullName.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw);
        const matchRole = selectedRoles.length === 0 || selectedRoles.includes(u.role);
        const matchDept = selectedDepts.length === 0 || selectedDepts.includes(u.department);
        const matchDate = (!startDate && !endDate) || (u.createdAt >= (startDate || "0000") && u.createdAt <= (endDate || "9999"));
        return matchSearch && matchRole && matchDept && matchDate;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const filterCount = selectedRoles.length + selectedDepts.length;

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

    const fetchUsers = async () => {
        try {
            const res = await fetch("https://ropa-server.onrender.com/api/admin/users/get");
            const data = await res.json();
            const formatted = data.map((u: any) => ({
                id: u.id,
                fullName: u.username,
                email: u.email,
                password: u.password,
                phone: u.phone,
                department: u.departments?.department_name || "-",
                team: u.position,
                role: u.role,
                lockStatus: u.is_locked ? "Locked" : "Unlocked",
                accountStatus: u.status === "ACTIVE" ? "Active" : "InActive",
                createdAt: u.created_at || new Date().toISOString().split("T")[0],
            }));
            setUsers(formatted);
        } catch (err) {
            console.error(err);
        }
    };

    // ================= CLICK OUTSIDE =================
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dateRef.current && !dateRef.current.contains(e.target as Node)) setOpenDate(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    
    useEffect(() => {
        fetchUsers();
    }, []);


    // ================= SAVE / DELETE =================
    const handleSave = (data: Partial<UserData>) => {
        if (modal?.mode === "create") {
            fetchUsers();
        } else if (modal?.mode === "edit" && modal?.user) {
            setUsers(prev => prev.map(u => u.id === modal.user!.id ? { ...u, ...data } : u));
        }
    };

    const handleDelete = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

    return (
        <div className="flex h-screen bg-gray-100 font-prompt overflow-hidden">
            <main className="flex-1 flex flex-col overflow-hidden text-[12px]">

                {/* ── Toolbar ── */}
                <div className="px-10 pt-6 pb-4 shrink-0">
                    <div className="mb-3">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    <div className="border-b border-gray-200 mb-4" />
                    <br />

                    <div className="flex flex-col md:flex-row md:justify-between gap-4 items-start md:items-center">
                        {/* DATE FILTER */}
                        <div className="relative" ref={dateRef}>
                            <button
                                onClick={() => setOpenDate(!openDate)}
                                className="flex items-center justify-between gap-2 bg-white border rounded-lg px-4 h-[40px] w-[274px] shadow-sm hover:border-gray-400 transition"
                            >
                                <span className="text-sm flex items-center gap-2 text-[#1C1B1F]">
                                    <Calendar size={16} className="shrink-0" />
                                    <span className="truncate text-[12px] text-[#616872]">
                                        {startDate && endDate ? `${formatDate(startDate)} — ${formatDate(endDate)}` : "เลือกช่วงวันที่"}
                                    </span>
                                </span>
                                <ChevronDown size={16} className="text-[#A6A6A6]" />
                            </button>

                            {openDate && (
                                <div className="absolute mt-2 w-[264px] bg-white border rounded-xl shadow-lg p-4 z-20">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-semibold text-[#1C1B1F]">เลือกช่วงวันที่</span>
                                        <button onClick={() => { setStartDate(""); setEndDate(""); }} className="text-xs text-[#03369D] hover:underline">
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {[["วันเริ่มต้น", startDate, setStartDate], ["วันสิ้นสุด", endDate, setEndDate]].map(
                                            ([label, value, setter]: any) => (
                                                <div key={label} className="flex flex-col gap-1">
                                                    <label className="text-xs text-[#1C1B1F]">{label}</label>
                                                    <input
                                                        type="date" value={value}
                                                        onChange={e => setter(e.target.value)}
                                                        className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => setOpenDate(false)}
                                            className="text-sm bg-[#03369D] text-white px-4 py-1.5 rounded-md hover:bg-[#012a7c]"
                                        >Apply</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-4 items-center text-[12px]">
                            <button
                                onClick={() => setModal({ mode: "create" })}
                                className="flex items-center justify-center gap-2 w-[128px] h-[40px] bg-[#03369D] hover:bg-[#012a7c] text-white rounded-lg"
                            >
                                <Plus size={16} /> เพิ่มผู้ใช้งาน
                            </button>

                            <div className="flex items-center gap-2 border rounded-lg px-3 w-[304px] h-[40px] bg-white">
                                <Search size={16} className="text-[#A6A6A6]" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อ หรืออีเมล"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full outline-none text-sm placeholder-[#D8D8D8] text-[#1C1B1F]"
                                />
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setOpenFilter(!openFilter)}
                                    className="flex items-center justify-center gap-2 w-[88px] h-[40px] border bg-white rounded-lg text-[#1C1B1F]"
                                >
                                    <Filter size={16} />
                                    <span className="font-gabarito text-[14px]">Filter</span>
                                    {filterCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-[#03369D] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                            {filterCount}
                                        </span>
                                    )}
                                </button>
                                <AdminFilterModal
                                    open={openFilter}
                                    onClose={() => setOpenFilter(false)}
                                    selectedRoles={selectedRoles}
                                    setSelectedRoles={setSelectedRoles}
                                    selectedDepts={selectedDepts}
                                    setSelectedDepts={setSelectedDepts}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── BODY ── */}
                <div className="flex flex-1 overflow-hidden text-[12px] px-10 pb-6">
                    <div className="flex flex-col overflow-hidden flex-1">
                        <div className="bg-white rounded-xl shadow p-3 flex-1 overflow-y-auto">
                            {loading ? (
                                <LoadingScreen message="กำลังโหลดข้อมูลผู้ใช้งาน..." fullScreen={false} />
                            ) : apiError ? (
                                <div className="text-center text-red-500 py-6">{apiError}</div>
                            ) : (
                                <UserTable data={paginated} onRowClick={u => setModal({ mode: "edit", user: u })} />
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="mt-4 flex justify-between items-center text-sm shrink-0">
                            <span className="text-[#1C1B1F]">{filtered.length} items</span>
                            <div className="flex items-center gap-2 text-[#1C1B1F]">
                                <ChevronLeft
                                    size={18}
                                    className={`cursor-pointer ${page === 1 ? "opacity-30 pointer-events-none" : ""}`}
                                    onClick={() => setPage(p => p - 1)}
                                />
                                <span className="font-gabarito">Page</span>
                                <input
                                    type="number" value={page} min={1} max={totalPages}
                                    onChange={e => { const v = Number(e.target.value); if (v >= 1 && v <= totalPages) setPage(v); }}
                                    className="w-12 border rounded px-2 py-1"
                                />
                                <span className="font-gabarito">of {totalPages}</span>
                                <ChevronRight
                                    size={18}
                                    className={`cursor-pointer ${page === totalPages ? "opacity-30 pointer-events-none" : ""}`}
                                    onClick={() => setPage(p => p + 1)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {modal && (
                <UserFormModal
                    mode={modal.mode}
                    user={modal.user}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}